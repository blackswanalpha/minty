import { app, BrowserWindow, ipcMain, webContents, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import crypto from 'node:crypto'
import * as pty from 'node-pty'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { cacheManager } from './cache/cacheManager'
import { scheduleCacheSave, forceSave } from './cache/cacheWorker'
import { AiToolMonitor } from './aiToolMonitor'
// AI settings manager — lazy-loaded to ensure app is ready before accessing userData path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _aiManager: any = null
function getAiManager() {
    if (!_aiManager) {
        _aiManager = require('./ai/aiSettingsManager').aiSettingsManager
    }
    return _aiManager
}

// Git manager — lazy-loaded to ensure app is ready before accessing userData path
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _gitManager: any = null
function getGitManager() {
    if (!_gitManager) {
        _gitManager = require('./git/gitManager').gitManager
    }
    return _gitManager
}

// Configure Logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Track PTY instances and directories per terminal tab
const tabPtys: Map<string, pty.IPty> = new Map()
const tabDirectories: Map<string, string> = new Map()
const tabPreviousDirectories: Map<string, string> = new Map()
// Track which window owns which tab (Tab ID -> Window WebContents ID)
const tabWindows: Map<string, number> = new Map()

// AI tool completion monitor — broadcast to ALL windows so the toast appears
// regardless of which window the tab belongs to
const aiToolMonitor = new AiToolMonitor((event) => {
    console.log('[Main] AI tool completed, broadcasting to all windows:', event.tabId, event.displayName)
    for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
            win.webContents.send('ai-tool-completed', event)
        }
    }
})

// Set app identity early
app.setName('Minty');
if (process.platform === 'linux') {
    app.setAppUserModelId('Minty');
    // Disable hardware acceleration to prevent VAAPI errors on Linux
    app.disableHardwareAcceleration();
}

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
const iconPath = path.resolve(process.env.VITE_PUBLIC || '', 'logo.png');

// Keep track of all windows to close app when all are closed
const windows = new Set<BrowserWindow>();
const windowTabIds: Map<number, string[]> = new Map();
// Track the active tab ID per window so it can be persisted on close
const windowActiveTabId: Map<number, string> = new Map();

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

// Configure AutoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// Allow pre-releases (e.g. beta, alpha)
autoUpdater.allowPrerelease = true;
// Useful for development/testing
autoUpdater.allowDowngrade = false;

function setupAutoUpdater(win: BrowserWindow): () => void {
    const sendToWin = (channel: string, ...args: any[]) => {
        if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
            try {
                win.webContents.send(channel, ...args);
            } catch (error) {
                // Window was destroyed between checks
                log.warn(`Failed to send ${channel}: window destroyed`);
            }
        }
    };

    const onCheckingForUpdate = () => {
        log.info('Checking for update...');
        sendToWin('update-checking');
    };

    const onUpdateAvailable = (info: any) => {
        log.info('Update available:', info);
        sendToWin('update-available', info);
    };

    const onUpdateNotAvailable = (info: any) => {
        log.info('Update not available:', info);
        sendToWin('update-not-available', info);
    };

    const onError = (err: Error) => {
        log.error('Update error:', err);
        sendToWin('update-error', err.message);
    };

    const onDownloadProgress = (progressObj: any) => {
        log.info('Download progress:', progressObj.percent + '%');
        sendToWin('download-progress', progressObj);
    };

    const onUpdateDownloaded = (info: any) => {
        log.info('Update downloaded:', info);
        sendToWin('update-downloaded', info);
    };

    autoUpdater.on('checking-for-update', onCheckingForUpdate);
    autoUpdater.on('update-available', onUpdateAvailable);
    autoUpdater.on('update-not-available', onUpdateNotAvailable);
    autoUpdater.on('error', onError);
    autoUpdater.on('download-progress', onDownloadProgress);
    autoUpdater.on('update-downloaded', onUpdateDownloaded);

    // Return cleanup function
    return () => {
        autoUpdater.removeListener('checking-for-update', onCheckingForUpdate);
        autoUpdater.removeListener('update-available', onUpdateAvailable);
        autoUpdater.removeListener('update-not-available', onUpdateNotAvailable);
        autoUpdater.removeListener('error', onError);
        autoUpdater.removeListener('download-progress', onDownloadProgress);
        autoUpdater.removeListener('update-downloaded', onUpdateDownloaded);
    };
}

// IPC handlers for updater
ipcMain.handle('check-for-updates', () => {
    return autoUpdater.checkForUpdates();
});

ipcMain.handle('download-update', () => {
    return autoUpdater.downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});


// Get the user's default shell
function getDefaultShell(): string {
    if (process.platform === 'win32') {
        return process.env.COMSPEC || 'cmd.exe'
    }
    return process.env.SHELL || '/bin/bash'
}

// Build environment with all common paths for CLI tools
function buildEnv(): NodeJS.ProcessEnv {
    const homeDir = os.homedir()
    const env = { ...process.env }

    // Common paths where CLI tools are installed
    const additionalPaths = [
        path.join(homeDir, '.local', 'bin'),
        path.join(homeDir, '.cargo', 'bin'),
        path.join(homeDir, '.npm-global', 'bin'),
        path.join(homeDir, 'go', 'bin'),
        path.join(homeDir, '.deno', 'bin'),
        path.join(homeDir, '.bun', 'bin'),
        path.join(homeDir, 'bin'),
        '/usr/local/bin',
        '/usr/bin',
        '/bin',
        '/usr/sbin',
        '/sbin',
        '/snap/bin',
        '/opt/homebrew/bin',
        '/home/linuxbrew/.linuxbrew/bin',
    ]

    const existingPath = env.PATH || ''
    const newPaths = additionalPaths.filter(p => !existingPath.includes(p)).join(':')
    env.PATH = newPaths ? `${newPaths}:${existingPath}` : existingPath

    env.HOME = homeDir
    env.USER = os.userInfo().username
    env.TERM = 'xterm-256color'
    env.COLORTERM = 'truecolor'

    return env
}

function createSplashWindow() {
    const splash = new BrowserWindow({
        title: 'Minty',
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        resizable: false,
        icon: iconPath,
    });

    splash.loadFile(path.join(process.env.VITE_PUBLIC || '', 'splash.html'));
    splash.center();
    return splash;
}

function sendToWindow(tabId: string, channel: string, ...args: any[]) {
    const webContentsId = tabWindows.get(tabId);
    if (webContentsId) {
        try {
            const contents = webContents.fromId(webContentsId);
            if (contents && !contents.isDestroyed()) {
                contents.send(channel, ...args);
            }
        } catch (error) {
            console.warn(`Failed to send message to tab ${tabId}:`, error);
        }
    }
}

function loadDevUrl(win: BrowserWindow, urlSuffix: string = '') {
    const fallbackUrl = 'http://localhost:5173';
    const baseUrl = VITE_DEV_SERVER_URL || fallbackUrl;
    const fullUrl = urlSuffix ? `${baseUrl}${urlSuffix}` : baseUrl;

    let retries = 0;
    const maxRetries = 10;

    const tryLoad = () => {
        if (win.isDestroyed()) return;
        console.log(`Loading from ${fullUrl} (attempt ${retries + 1})`);
        win.loadURL(fullUrl).catch((err: Error) => {
            retries++;
            if (retries < maxRetries && !win.isDestroyed()) {
                console.log(`[Main] Load failed (${err.message}), retrying in 500ms...`);
                setTimeout(tryLoad, 500);
            } else {
                console.error(`[Main] Failed to load ${fullUrl} after ${retries} attempts`);
                if (!win.isDestroyed()) win.show();
            }
        });
    };
    tryLoad();
}

function createWindow() {
    const win = new BrowserWindow({
        title: 'Minty',
        icon: iconPath,
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        frame: false,
        show: false,
    })

    windows.add(win);

    win.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Initialize updater events for this window and get cleanup function
    const cleanupAutoUpdater = setupAutoUpdater(win);

    win.webContents.on('did-finish-load', () => {
        if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
            try {
                win.webContents.send('main-process-message', (new Date).toLocaleString());
            } catch (error) {
                // Window destroyed during send
            }
        }
    })

    // Log renderer crashes
    win.webContents.on('render-process-gone', (_event, details) => {
        console.error('[Main] Renderer process gone:', details.reason, details.exitCode);
    });

    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
        console.error('[Main] Page failed to load:', errorCode, errorDescription);
    });

    if (app.isPackaged) {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    } else {
        loadDevUrl(win);
        // Open DevTools in dev mode so renderer errors are visible
        win.webContents.openDevTools();
    }

    win.once('ready-to-show', () => {
        win.show();
        // Check for updates on startup
        if (app.isPackaged) { // Check only in production
            autoUpdater.checkForUpdatesAndNotify();
        }
    });

    win.on('closed', () => {
        // Cleanup autoUpdater listeners first
        cleanupAutoUpdater();

        // Don't try to access window properties after it's destroyed
        // Save window state in 'close' event instead
        const windowId = win.id;

        // Clean up tracking
        windowTabIds.delete(windowId);
        windows.delete(win);
    });

    // Capture window state before it's destroyed
    win.on('close', () => {
        if (win.isDestroyed()) return;

        try {
            const windowId = win.id;
            const windowTabIdsList = windowTabIds.get(windowId);
            console.log('[Main] Window', windowId, 'closing - windowTabIds:', windowTabIdsList);
            console.log('[Main] tabDirectories has', tabDirectories.size, 'entries');
            const bounds = win.getBounds();
            const isMaximized = win.isMaximized();

            if (windowTabIdsList && windowTabIdsList.length > 0) {
                const activeId = windowActiveTabId.get(windowId) || '';
                const tabs: any[] = [];
                for (const tabId of windowTabIdsList) {
                    const cwd = tabDirectories.get(tabId);
                    console.log('[Main] Processing tab', tabId, 'cwd:', cwd);
                    if (cwd) {
                        tabs.push({
                            id: tabId,
                            title: cwd.split('/').pop() || 'unknown',
                            cwd: cwd,
                            isActive: tabId === activeId,
                            type: 'terminal' as const
                        });
                    }
                }

                forceSave({
                    windowId,
                    timestamp: Date.now(),
                    windowState: {
                        x: bounds.x,
                        y: bounds.y,
                        width: bounds.width,
                        height: bounds.height,
                        isMaximized
                    },
                    tabs,
                    activeTabId: activeId
                }).catch(err => {
                    console.warn('[Main] Failed to save cache on window close:', err);
                });
            }
            windowActiveTabId.delete(windowId);
        } catch (error) {
            console.warn('[Main] Error saving window state on close:', error);
        }
    });

    return win;
}

// Window controls - need to handle for key window or sender
ipcMain.on('toggle-devtools', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
        } else {
            win.webContents.openDevTools();
        }
    }
});

ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
});

ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
        win?.unmaximize();
    } else {
        win?.maximize();
    }
});

ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
});


// Create new window handler
ipcMain.handle('create-new-window', async () => {
    try {
        const newWin = createWindow();

        // Safety: force-show if ready-to-show never fires
        setTimeout(() => {
            if (!newWin.isDestroyed() && !newWin.isVisible()) {
                console.warn('[Main] New window ready-to-show timeout — force-showing');
                newWin.show();
            }
        }, 8000);

        return { success: true, windowId: newWin.id };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Create new tab handler
ipcMain.handle('create-new-tab', async (event) => {
    try {
        const tabId = crypto.randomUUID();
        const homeDir = os.homedir();
        tabDirectories.set(tabId, homeDir);

        // Register window mapping
        tabWindows.set(tabId, event.sender.id);

        // Register with windowTabIds for cache tracking
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            const windowId = win.id;
            const ids = windowTabIds.get(windowId) || [];
            if (!ids.includes(tabId)) {
                ids.push(tabId);
                windowTabIds.set(windowId, ids);
                console.log('[Main] Auto-registered new tab', tabId, 'for window', windowId, '- total tabs:', ids.length);
            }
        }

        const shell = getDefaultShell();
        const env = buildEnv();

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: homeDir,
            env: env as { [key: string]: string }
        });

        tabPtys.set(tabId, ptyProcess);
        aiToolMonitor.startMonitoring(tabId, (ptyProcess as any).pid);

        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
            aiToolMonitor.stopMonitoring(tabId);
            sendToWindow(tabId, 'pty-exit', { tabId, exitCode });
            tabPtys.delete(tabId);
            tabWindows.delete(tabId);
        });

        return { success: true, tabId, cwd: homeDir, title: homeDir.split('/').pop() || 'home' };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Get the number of open windows
ipcMain.handle('get-window-count', () => {
    return BrowserWindow.getAllWindows().length;
});

// Get home directory
ipcMain.handle('get-home-directory', () => {
    return os.homedir();
});

// Get current window ID
ipcMain.handle('get-window-id', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.id : null;
});

// Get current window bounds and state
ipcMain.handle('get-window-bounds', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return null;
    const bounds = win.getBounds();
    return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: win.isMaximized()
    };
});

// Get current working directory for a tab
ipcMain.handle('get-cwd', (_event, tabId: string) => {
    return tabDirectories.get(tabId) || os.homedir();
});

// Query current working directory from shell (actively polls)
ipcMain.handle('query-cwd', async (_event, tabId: string) => {
    const ptyProcess = tabPtys.get(tabId);
    if (!ptyProcess) {
        return tabDirectories.get(tabId) || os.homedir();
    }

    const pid = (ptyProcess as any).pid;
    if (pid) {
        // Linux: use /proc to read shell's cwd (completely invisible)
        if (process.platform === 'linux') {
            try {
                const fs = await import('node:fs/promises');
                const cwd = await fs.readlink(`/proc/${pid}/cwd`);
                if (cwd && cwd !== tabDirectories.get(tabId)) {
                    console.log('[Main] Directory changed for tab', tabId, ':', cwd);
                    tabDirectories.set(tabId, cwd);
                }
                return cwd;
            } catch (error) {
                console.warn('[Main] Failed to read /proc for tab', tabId, ':', error);
            }
        }

        // macOS: use lsof to find the cwd of the process
        if (process.platform === 'darwin') {
            try {
                const cp = await import('node:child_process');
                const cwd = await new Promise<string | null>((resolve) => {
                    cp.exec(`lsof -p ${pid} -Fn | grep '^fcwd$' -A1 | grep '^n' | cut -c2-`, { timeout: 2000 }, (err, stdout) => {
                        if (err || !stdout.trim()) {
                            resolve(null);
                        } else {
                            resolve(stdout.trim());
                        }
                    });
                });
                if (cwd && cwd !== tabDirectories.get(tabId)) {
                    console.log('[Main] Directory changed for tab', tabId, ':', cwd);
                    tabDirectories.set(tabId, cwd);
                }
                if (cwd) return cwd;
            } catch (error) {
                console.warn('[Main] Failed to query cwd via lsof for tab', tabId, ':', error);
            }
        }
    }

    // Fallback: return tracked directory
    return tabDirectories.get(tabId) || os.homedir();
});

// Set current working directory for a tab
ipcMain.handle('set-cwd', (_event, tabId: string, cwd: string) => {
    tabDirectories.set(tabId, cwd);
    return cwd;
});

// Select directory dialog
ipcMain.handle('select-directory', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Directory',
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
});

// List directory contents
ipcMain.handle('list-directory', async (_event, dirPath: string, options?: { showHidden?: boolean }) => {
    try {
        const resolvedPath = dirPath.startsWith('~')
            ? path.join(os.homedir(), dirPath.slice(1))
            : dirPath;

        const dirents = await fs.readdir(resolvedPath, { withFileTypes: true });

        const entries = await Promise.all(
            dirents
                .filter((dirent) => options?.showHidden || !dirent.name.startsWith('.'))
                .map(async (dirent) => {
                    const fullPath = path.join(resolvedPath, dirent.name);
                    let size = 0;
                    let modifiedAt = 0;
                    try {
                        const stat = await fs.stat(fullPath);
                        size = stat.size;
                        modifiedAt = stat.mtimeMs;
                    } catch {
                        // stat may fail for broken symlinks
                    }
                    return {
                        name: dirent.name,
                        path: fullPath,
                        isDirectory: dirent.isDirectory(),
                        isSymlink: dirent.isSymbolicLink(),
                        size,
                        modifiedAt,
                    };
                })
        );

        return { success: true, path: resolvedPath, entries };
    } catch (error: any) {
        return { success: false, entries: [], error: error.message };
    }
});

// Read file contents for the code editor
ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
        const resolvedPath = filePath.startsWith('~')
            ? path.join(os.homedir(), filePath.slice(1))
            : filePath;

        // Check file size first (reject files > 5MB)
        const stat = await fs.stat(resolvedPath);
        if (stat.size > 5 * 1024 * 1024) {
            return { success: false, error: 'File too large (>5MB)', path: resolvedPath };
        }

        // Read first 8KB to detect binary files
        const fileHandle = await fs.open(resolvedPath, 'r');
        const checkBuffer = Buffer.alloc(Math.min(8192, stat.size));
        await fileHandle.read(checkBuffer, 0, checkBuffer.length, 0);
        await fileHandle.close();

        // Check for null bytes (binary indicator)
        for (let i = 0; i < checkBuffer.length; i++) {
            if (checkBuffer[i] === 0) {
                return { success: false, error: 'Binary file cannot be opened in editor', path: resolvedPath };
            }
        }

        const content = await fs.readFile(resolvedPath, 'utf-8');
        return { success: true, content, path: resolvedPath };
    } catch (error: any) {
        return { success: false, error: error.message, path: filePath };
    }
});

// Write file contents from the code editor
ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
    try {
        const resolvedPath = filePath.startsWith('~')
            ? path.join(os.homedir(), filePath.slice(1))
            : filePath;
        await fs.writeFile(resolvedPath, content, 'utf-8');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

// Create persistent PTY session for a tab
ipcMain.handle('create-pty-session', (event, tabId: string, cwd?: string) => {
    // Kill existing PTY if any
    const existingPty = tabPtys.get(tabId);
    if (existingPty) {
        existingPty.kill();
    }

    const homeDir = os.homedir();
    const workingDir = cwd || homeDir;

    console.log('[Main] create-pty-session:', tabId, 'cwd:', workingDir);
    tabDirectories.set(tabId, workingDir);

    // Register window
    tabWindows.set(tabId, event.sender.id);

    // Register with windowTabIds for cache tracking
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const windowId = win.id;
        const ids = windowTabIds.get(windowId) || [];
        if (!ids.includes(tabId)) {
            ids.push(tabId);
            windowTabIds.set(windowId, ids);
            console.log('[Main] Auto-registered pty-session tab', tabId, 'for window', windowId, '- total tabs:', ids.length);
        }
    }

    const shell = getDefaultShell();
    const env = buildEnv();

    try {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: workingDir,
            env: env as { [key: string]: string }
        });

        tabPtys.set(tabId, ptyProcess);
        aiToolMonitor.startMonitoring(tabId, (ptyProcess as any).pid);

        // Stream output to renderer
        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        // Handle PTY exit
        ptyProcess.onExit(({ exitCode }) => {
            aiToolMonitor.stopMonitoring(tabId);
            sendToWindow(tabId, 'pty-exit', { tabId, exitCode });
            tabPtys.delete(tabId);
            tabWindows.delete(tabId);
        });

        // If restoring a saved directory (not home), explicitly cd to it
        if (cwd && cwd !== homeDir) {
            console.log('[Main] Explicitly changing to saved directory:', workingDir);
            setTimeout(() => {
                // Check if PTY still exists in our map (not killed)
                if (tabPtys.has(tabId)) {
                    ptyProcess.write(`cd "${workingDir}"\n`);
                    setTimeout(() => {
                        if (tabPtys.has(tabId)) {
                            ptyProcess.write('clear\n');
                        }
                    }, 50);
                }
            }, 100);
        }

        return { success: true, cwd: workingDir };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create PTY session',
            cwd: homeDir
        };
    }
});

// Initialize a new tab (legacy support + creates PTY)
ipcMain.handle('init-tab', (event, tabId: string, cwd?: string) => {
    // Use provided cwd or default to home directory
    const homeDir = os.homedir();
    const workingDir = cwd || homeDir;

    console.log('[Main] init-tab:', tabId, 'cwd:', workingDir);
    tabDirectories.set(tabId, workingDir);

    // Register window
    tabWindows.set(tabId, event.sender.id);

    // Automatically register tab with windowTabIds for cache tracking
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const windowId = win.id;
        const ids = windowTabIds.get(windowId) || [];
        if (!ids.includes(tabId)) {
            ids.push(tabId);
            windowTabIds.set(windowId, ids);
            console.log('[Main] Auto-registered tab', tabId, 'for window', windowId, '- total tabs:', ids.length);
        }
    }

    // Also create PTY session
    const existingPty = tabPtys.get(tabId);
    if (existingPty) {
        existingPty.kill();
    }

    const shell = getDefaultShell();
    const env = buildEnv();

    try {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: workingDir,
            env: env as { [key: string]: string }
        });

        tabPtys.set(tabId, ptyProcess);
        aiToolMonitor.startMonitoring(tabId, (ptyProcess as any).pid);

        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
            aiToolMonitor.stopMonitoring(tabId);
            sendToWindow(tabId, 'pty-exit', { tabId, exitCode });
            tabPtys.delete(tabId);
            tabWindows.delete(tabId);
        });

        // If restoring a saved directory (not home), explicitly cd to it
        // This ensures the shell is in the correct directory even if .bashrc/.bash_profile cd to home
        if (cwd && cwd !== homeDir) {
            console.log('[Main] Explicitly changing to saved directory:', workingDir);
            setTimeout(() => {
                // Check if PTY still exists in our map (not killed)
                if (tabPtys.has(tabId)) {
                    ptyProcess.write(`cd "${workingDir}"\n`);
                    // Clear the screen to hide the cd command
                    setTimeout(() => {
                        if (tabPtys.has(tabId)) {
                            ptyProcess.write('clear\n');
                        }
                    }, 50);
                }
            }, 100);
        }
    } catch (err) {
        console.error('Failed to create PTY:', err);
    }

    return workingDir;
});

// Remove tab and cleanup PTY
ipcMain.handle('remove-tab', (event, tabId: string) => {
    aiToolMonitor.stopMonitoring(tabId);
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.kill();
        tabPtys.delete(tabId);
    }
    tabDirectories.delete(tabId);
    tabWindows.delete(tabId);

    // Automatically unregister from windowTabIds
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const windowId = win.id;
        const ids = windowTabIds.get(windowId);
        if (ids) {
            const filtered = ids.filter(id => id !== tabId);
            console.log('[Main] Auto-unregistered tab', tabId, 'from window', windowId, '- remaining tabs:', filtered.length);
            if (filtered.length > 0) {
                windowTabIds.set(windowId, filtered);
            } else {
                windowTabIds.delete(windowId);
            }
        }
    }

    return true;
});

// Send input to PTY (for interactive commands)
ipcMain.handle('send-input', (_event, tabId: string, input: string) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.write(input);
        return { success: true };
    }
    return { success: false, error: 'No active PTY session' };
});

// Send command to PTY (writes command + newline)
ipcMain.handle('send-command', (_event, tabId: string, command: string) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.write(command + '\n');
        return { success: true };
    }
    return { success: false, error: 'No active PTY session' };
});

// Resize PTY
ipcMain.handle('resize-pty', (_event, tabId: string, cols: number, rows: number) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.resize(cols, rows);
        return { success: true };
    }
    return { success: false };
});

// Send signal to PTY (e.g., Ctrl+C)
ipcMain.handle('send-signal', (_event, tabId: string, signal: string) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        if (signal === 'SIGINT') {
            ptyProcess.write('\x03'); // Ctrl+C
        } else if (signal === 'SIGTSTP') {
            ptyProcess.write('\x1A'); // Ctrl+Z
        } else if (signal === 'EOF') {
            ptyProcess.write('\x04'); // Ctrl+D
        }
        return { success: true };
    }
    return { success: false };
});

// AI tool monitor settings
ipcMain.handle('ai-tool-monitor-set-enabled', (_event, enabled: boolean) => {
    aiToolMonitor.setEnabled(enabled);
    return { success: true };
});

ipcMain.handle('ai-tool-monitor-get-enabled', () => {
    return aiToolMonitor.isEnabled();
});

// Test handler: fire a fake AI tool completion event to verify toast pipeline
ipcMain.handle('ai-tool-monitor-test', (event) => {
    const testEvent = {
        tabId: 'test',
        toolName: 'claude',
        displayName: 'Claude Code',
        durationMs: 45000,
    };
    console.log('[Main] Firing test AI tool completion event');
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        win.webContents.send('ai-tool-completed', testEvent);
    }
    return { success: true };
});

// Execute command (legacy mode - non-interactive, returns when complete)
ipcMain.handle('execute-command', async (_event, command: string, tabId: string) => {
    const cwd = tabDirectories.get(tabId) || os.homedir();
    const trimmedCmd = command.trim();

    // Handle cd command specially to track directory changes
    const cdMatch = trimmedCmd.match(/^cd\s*(.*)?$/);
    if (cdMatch) {
        const targetPath = cdMatch[1]?.trim() || os.homedir();
        let newPath: string;

        if (targetPath === '' || targetPath === '~') {
            newPath = os.homedir();
        } else if (targetPath === '-') {
            newPath = tabPreviousDirectories.get(tabId) || cwd;
        } else if (targetPath.startsWith('~/')) {
            newPath = path.join(os.homedir(), targetPath.slice(2));
        } else if (path.isAbsolute(targetPath)) {
            newPath = targetPath;
        } else {
            newPath = path.resolve(cwd, targetPath);
        }

        try {
            const fs = await import('node:fs/promises');
            const stat = await fs.stat(newPath);
            if (!stat.isDirectory()) {
                return {
                    success: false,
                    output: '',
                    error: `cd: not a directory: ${targetPath}`,
                    cwd: cwd
                };
            }
            tabPreviousDirectories.set(tabId, cwd);
            tabDirectories.set(tabId, newPath);
            return {
                success: true,
                output: '',
                error: '',
                cwd: newPath
            };
        } catch {
            return {
                success: false,
                output: '',
                error: `cd: no such file or directory: ${targetPath}`,
                cwd: cwd
            };
        }
    }

    // Execute command using PTY
    return new Promise((resolve) => {
        const shell = getDefaultShell();
        const env = buildEnv();

        // Sanitize command to prevent injection - only allow alphanumeric, spaces, common operators
        // This is a basic sanitization - for production, consider using a proper shell command parser
        const sanitizedCommand = command.replace(/[;&|$`]/g, '');

        const shellArgs = process.platform === 'win32'
            ? ['/c', sanitizedCommand]
            : ['-l', '-c', sanitizedCommand];

        let output = '';

        try {
            const ptyProcess = pty.spawn(shell, shellArgs, {
                name: 'xterm-256color',
                cols: 120,
                rows: 30,
                cwd: cwd,
                env: env as { [key: string]: string }
            });

            const timeout = setTimeout(() => {
                ptyProcess.kill();
                resolve({
                    success: false,
                    output: output,
                    error: 'Command timed out after 60 seconds',
                    cwd: cwd,
                    exitCode: 124
                });
            }, 60000);

            ptyProcess.onData((data) => {
                output += data;
            });

            ptyProcess.onExit(({ exitCode }) => {
                clearTimeout(timeout);

                const cleanOutput = output
                    // eslint-disable-next-line no-control-regex
                    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n');

                resolve({
                    success: exitCode === 0,
                    output: cleanOutput,
                    error: exitCode !== 0 ? '' : '',
                    cwd: cwd,
                    exitCode: exitCode
                });
            });

        } catch (err) {
            resolve({
                success: false,
                output: '',
                error: err instanceof Error ? err.message : 'Failed to execute command',
                cwd: cwd,
                exitCode: 1
            });
        }
    });
});

// List available commands in PATH
ipcMain.handle('list-commands', async () => {
    const env = buildEnv();
    const pathDirs = (env.PATH || '').split(':');
    const commands: string[] = [];

    const fs = await import('node:fs/promises');

    for (const dir of pathDirs) {
        try {
            const files = await fs.readdir(dir);
            commands.push(...files);
        } catch {
            // Directory doesn't exist or isn't readable
        }
    }

    return [...new Set(commands)].sort();
});

// Check if a specific command exists
ipcMain.handle('command-exists', async (_event, command: string) => {
    const env = buildEnv();
    const pathDirs = (env.PATH || '').split(':');

    const fs = await import('node:fs/promises');

    for (const dir of pathDirs) {
        try {
            const cmdPath = path.join(dir, command);
            await fs.access(cmdPath, (await import('node:fs')).constants.X_OK);
            return { exists: true, path: cmdPath };
        } catch {
            // Command not found in this directory
        }
    }

    return { exists: false, path: null };
});

// Get system info
ipcMain.handle('get-system-info', () => {
    return {
        platform: process.platform,
        arch: os.arch(),
        hostname: os.hostname(),
        username: os.userInfo().username,
        shell: getDefaultShell(),
        homeDir: os.homedir(),
        tempDir: os.tmpdir()
    };
});

// Track previous CPU times for delta-based usage calculation
let prevCpuIdle = 0;
let prevCpuTotal = 0;

// Get real-time system stats (battery, wifi, cpu, memory)
ipcMain.handle('get-system-stats', async () => {
    // CPU usage (delta between calls)
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
        idle += cpu.times.idle;
        total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    let cpuUsage = 0;
    if (prevCpuTotal > 0) {
        const idleDiff = idle - prevCpuIdle;
        const totalDiff = total - prevCpuTotal;
        cpuUsage = totalDiff > 0 ? Math.round((1 - idleDiff / totalDiff) * 100) : 0;
    }
    prevCpuIdle = idle;
    prevCpuTotal = total;

    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    // Battery (Linux: /sys/class/power_supply/BAT*)
    let battery = { level: 100, charging: false, available: false };
    for (const batName of ['BAT0', 'BAT1', 'BAT2', 'BATT', 'battery']) {
        try {
            const batPath = `/sys/class/power_supply/${batName}`;
            const capacity = await fs.readFile(`${batPath}/capacity`, 'utf-8');
            const status = await fs.readFile(`${batPath}/status`, 'utf-8');
            battery = {
                level: parseInt(capacity.trim(), 10),
                charging: status.trim() === 'Charging' || status.trim() === 'Full',
                available: true
            };
            break;
        } catch {
            // Try next battery name
        }
    }

    // WiFi signal (Linux: /proc/net/wireless)
    let wifi = { connected: true, quality: 0, strength: 'unknown' as string, available: false };
    try {
        const wireless = await fs.readFile('/proc/net/wireless', 'utf-8');
        const lines = wireless.trim().split('\n');
        if (lines.length > 2) {
            const dataLine = lines[2].trim();
            const parts = dataLine.split(/\s+/);
            const linkQuality = parseFloat(parts[2]); // 0-70 typically
            const qualityPercent = Math.min(100, Math.round((linkQuality / 70) * 100));
            wifi = {
                connected: true,
                quality: qualityPercent,
                strength: qualityPercent > 65 ? 'strong' : qualityPercent > 35 ? 'moderate' : 'weak',
                available: true
            };
        }
    } catch {
        // No wireless interface or not on Linux — fallback
    }

    // If no wifi data from /proc, check basic network connectivity
    if (!wifi.available) {
        try {
            const { execSync } = await import('node:child_process');
            const result = execSync('nmcli -t -f SIGNAL,ACTIVE dev wifi', { timeout: 2000 }).toString();
            const activeLine = result.split('\n').find(l => l.endsWith(':yes'));
            if (activeLine) {
                const signal = parseInt(activeLine.split(':')[0], 10);
                wifi = {
                    connected: true,
                    quality: signal,
                    strength: signal > 65 ? 'strong' : signal > 35 ? 'moderate' : 'weak',
                    available: true
                };
            }
        } catch {
            // nmcli not available or no wifi
        }
    }

    return { cpuUsage, memoryUsage, battery, wifi };
});

// Get current tabs for saving
ipcMain.handle('get-current-tabs', () => {
    const tabs: any[] = [];
    for (const [tabId, cwd] of tabDirectories.entries()) {
        tabs.push({
            id: tabId,
            title: cwd.split('/').pop() || 'unknown',
            cwd: cwd
        });
    }
    return tabs;
});

// Save to library
ipcMain.handle('save-to-library', async (_event: any, _libraryItem: unknown) => {
    try {
        // Use localStorage through the renderer process
        // This will be handled in the renderer process
        return { success: true };
    } catch (error) {
        console.error('Failed to save to library:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Open tab with specific directory
ipcMain.handle('open-tab-with-directory', async (event: any, cwd: string, title?: string) => {
    try {
        const newId = crypto.randomUUID();
        tabDirectories.set(newId, cwd);

        // Register window
        tabWindows.set(newId, event.sender.id);

        // Register with windowTabIds for cache tracking
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            const windowId = win.id;
            const ids = windowTabIds.get(windowId) || [];
            if (!ids.includes(newId)) {
                ids.push(newId);
                windowTabIds.set(windowId, ids);
                console.log('[Main] Auto-registered directory tab', newId, 'for window', windowId, '- total tabs:', ids.length);
            }
        }

        const shell = getDefaultShell();
        const env = buildEnv();

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: cwd,
            env: env as { [key: string]: string }
        });

        tabPtys.set(newId, ptyProcess);
        aiToolMonitor.startMonitoring(newId, (ptyProcess as any).pid);

        ptyProcess.onData((data) => {
            sendToWindow(newId, 'pty-output', { tabId: newId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
            aiToolMonitor.stopMonitoring(newId);
            sendToWindow(newId, 'pty-exit', { tabId: newId, exitCode });
            tabPtys.delete(newId);
            tabWindows.delete(newId);
        });

        // Explicitly cd to the directory
        const homeDir = os.homedir();
        if (cwd && cwd !== homeDir) {
            console.log('[Main] open-tab-with-directory - explicitly cd to:', cwd);
            setTimeout(() => {
                // Check if PTY still exists in our map (not killed)
                if (tabPtys.has(newId)) {
                    ptyProcess.write(`cd "${cwd}"\n`);
                    setTimeout(() => {
                        if (tabPtys.has(newId)) {
                            ptyProcess.write('clear\n');
                        }
                    }, 50);
                }
            }, 100);
        }

        // Send tab info back to renderer
        return { success: true, tabId: newId, cwd, title: title || cwd.split('/').pop() };
    } catch (error) {
        console.error('Failed to open tab with directory:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Create .minty file for agent tracking
ipcMain.handle('create-minty-file', async (_event: any, { path: filePath, content }: { path: string, content: string }) => {
    try {
        const fs = await import('node:fs/promises');
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true, message: 'File created successfully' };
    } catch (error) {
        console.error('Failed to create .minty file:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Run minty index (Enhance Prompt)
ipcMain.handle('run-minty-index', async (_event: any, targetDir: string) => {
    try {
        console.log(`[IPC] Running minty index on: ${targetDir}`);

        // Determine path to cli/src/index.js
        // In dev: project_root/cli/src/index.js
        // We can try to guess it relative to __dirname or process.cwd()

        // Assuming we are running from project root in dev
        let cliPath = path.resolve(process.cwd(), 'cli/src/index.js');

        // Check if file exists
        const fs = await import('node:fs/promises');
        try {
            await fs.access(cliPath);
        } catch {
            // Fallback for production/packaged execution might differ, 
            // but for now we focus on the active development workspace.
            console.warn(`[IPC] Could not find CLI at ${cliPath}, trying to locate...`);
            // Attempt to locate if CWD is deeper
            cliPath = path.resolve(__dirname, '../../cli/src/index.js'); // Heuristic
        }

        const cp = await import('node:child_process');

        return new Promise((resolve) => {
            // Run: node cliPath index targetDir
            const child = cp.spawn('node', [cliPath, 'index', targetDir], {
                cwd: targetDir,
                stdio: 'pipe' // Capture output
            });

            let output = '';
            let errorOutput = '';

            child.stdout?.on('data', (data) => output += data.toString());
            child.stderr?.on('data', (data) => errorOutput += data.toString());

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                } else {
                    console.error('[IPC] Minty CLI failed:', errorOutput);
                    resolve({ success: false, error: errorOutput || 'Unknown CLI error' });
                }
            });
        });

    } catch (error) {
        console.error('Failed to run minty index:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Read codebase context
ipcMain.handle('read-codebase-context', async (_event: any, targetDir: string) => {
    try {
        const contextPath = path.join(targetDir, 'codebase.md');
        const fs = await import('node:fs/promises');

        // Check if exists
        try {
            await fs.access(contextPath);
        } catch {
            return { success: false, error: 'codebase.md not found. Please index the directory first.' };
        }

        const content = await fs.readFile(contextPath, 'utf-8');
        // Limit content size if huge? For now read all.
        // Maybe truncate if > 100KB for the prompt context to avoid blowing up tokens too much blindly.
        // Let's take the first 50KB or just return it all and let frontend decide.
        // Implementation Plan said "summary/snippet", but reading full file gives frontend flexibility.

        return { success: true, content };
    } catch (error) {
        console.error('Failed to read codebase context:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Library storage path - use app data directory
const getLibraryPath = () => {
    return path.join(app.getPath('userData'), 'library');
};

// Ensure library directory exists
const ensureLibraryDir = async () => {
    const fs = await import('node:fs/promises');
    const libPath = getLibraryPath();
    try {
        await fs.access(libPath);
    } catch {
        await fs.mkdir(libPath, { recursive: true });
    }
    return libPath;
};

// Save library item to JSON file
ipcMain.handle('library-save', async (_event, item: any) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = path.join(libPath, `${item.id}.json`);
        const fs = await import('node:fs/promises');
        await fs.writeFile(filePath, JSON.stringify(item, null, 2), 'utf-8');
        return { success: true, id: item.id };
    } catch (error) {
        console.error('Failed to save library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Load all library items
ipcMain.handle('library-load-all', async () => {
    try {
        const libPath = await ensureLibraryDir();
        const fs = await import('node:fs/promises');

        try {
            await fs.access(libPath);
        } catch {
            return { success: true, items: [] };
        }

        const files = await fs.readdir(libPath);
        const items: any[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(libPath, file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    items.push(JSON.parse(content));
                } catch (err) {
                    console.error(`Failed to read library file ${file}:`, err);
                }
            }
        }

        return { success: true, items };
    } catch (error) {
        console.error('Failed to load library items:', error);
        return { success: false, items: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Load single library item
ipcMain.handle('library-load', async (_event, id: string) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = path.join(libPath, `${id}.json`);
        const fs = await import('node:fs/promises');

        try {
            await fs.access(filePath);
        } catch {
            return { success: false, error: 'Item not found' };
        }

        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, item: JSON.parse(content) };
    } catch (error) {
        console.error('Failed to load library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Delete library item
ipcMain.handle('library-delete', async (_event, id: string) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = path.join(libPath, `${id}.json`);
        const fs = await import('node:fs/promises');

        try {
            await fs.unlink(filePath);
            return { success: true };
        } catch {
            return { success: false, error: 'Item not found' };
        }
    } catch (error) {
        console.error('Failed to delete library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Cache IPC Handlers
ipcMain.handle('cache-initialize', async () => {
    try {
        await cacheManager.initialize();
        return { success: true, settings: cacheManager.getSettings() };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-get-state', async () => {
    try {
        await cacheManager.initialize();
        return {
            entries: cacheManager.getAllEntries(),
            settings: cacheManager.getSettings()
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-save', async (event, entry: any) => {
    try {
        const settings = cacheManager.getSettings();
        if (!settings.enabled) {
            return { success: true, skipped: true };
        }
        // Override windowId with authoritative value from sender
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            entry.windowId = win.id;
        }
        scheduleCacheSave(entry);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-save-force', async (_event, entry: any) => {
    try {
        const settings = cacheManager.getSettings();
        if (!settings.enabled) {
            return { success: true, skipped: true };
        }
        await forceSave(entry);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-restore', async (_event, windowId: number) => {
    try {
        await cacheManager.initialize();
        const entry = cacheManager.getEntry(windowId);
        return entry || null;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-get-settings', async () => {
    try {
        await cacheManager.initialize();
        return cacheManager.getSettings();
    } catch (error) {
        return { enabled: true };
    }
});

ipcMain.handle('cache-set-settings', async (_event, settings: any) => {
    try {
        await cacheManager.saveSettings(settings);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-clear', async (_event, windowId?: number) => {
    try {
        if (windowId) {
            cacheManager.removeEntry(windowId);
        } else {
            cacheManager.clearAllEntries();
        }
        await cacheManager.saveCache();
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('set-active-tab', async (event, tabId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        windowActiveTabId.set(win.id, tabId);
    }
    return { success: true };
});

ipcMain.handle('cache-register-tab', async (event, _windowId: number, tabId: string) => {
    try {
        // Derive window ID from event.sender (authoritative) instead of trusting renderer
        const win = BrowserWindow.fromWebContents(event.sender);
        const windowId = win ? win.id : _windowId;
        const ids = windowTabIds.get(windowId) || [];
        if (!ids.includes(tabId)) {
            ids.push(tabId);
            windowTabIds.set(windowId, ids);
            console.log('[Main] Registered tab', tabId, 'for window', windowId, '- total tabs:', ids.length);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.handle('cache-unregister-tab', async (_event, windowId: number, tabId: string) => {
    try {
        const ids = windowTabIds.get(windowId);
        if (ids) {
            const filtered = ids.filter(id => id !== tabId);
            console.log('[Main] Unregistered tab', tabId, 'from window', windowId, '- remaining tabs:', filtered.length);
            if (filtered.length > 0) {
                windowTabIds.set(windowId, filtered);
            } else {
                windowTabIds.delete(windowId);
            }
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// ── AI Settings IPC Handlers ──────────────────────────────────────────

ipcMain.handle('ai-get-settings', async () => {
    return getAiManager().loadSettings();
});

ipcMain.handle('ai-set-settings', async (_event, settings: any) => {
    await getAiManager().saveSettings(settings);
    return { success: true };
});

ipcMain.handle('ai-test-connection', async (_event, settings: any) => {
    return getAiManager().testConnection(settings);
});

ipcMain.handle('ai-enhance-command', async (_event, request: { command: string }) => {
    return getAiManager().enhanceCommand(request.command);
});

// ── Git IPC Handlers ─────────────────────────────────────────────────

ipcMain.handle('git-is-repo', async (_event, cwd: string) => {
    return getGitManager().isGitRepo(cwd);
});

ipcMain.handle('git-init', async (_event, cwd: string) => {
    return getGitManager().initRepo(cwd);
});

ipcMain.handle('git-status', async (_event, cwd: string) => {
    return getGitManager().getStatus(cwd);
});

ipcMain.handle('git-log', async (_event, cwd: string, limit?: number) => {
    return getGitManager().getLog(cwd, limit);
});

ipcMain.handle('git-diff', async (_event, cwd: string, staged?: boolean) => {
    return getGitManager().getDiff(cwd, staged);
});

ipcMain.handle('git-diff-file', async (_event, cwd: string, file: string, staged?: boolean) => {
    return getGitManager().getFileDiff(cwd, file, staged);
});

ipcMain.handle('git-stage', async (_event, cwd: string, files: string[]) => {
    return getGitManager().stageFiles(cwd, files);
});

ipcMain.handle('git-unstage', async (_event, cwd: string, files: string[]) => {
    return getGitManager().unstageFiles(cwd, files);
});

ipcMain.handle('git-stage-all', async (_event, cwd: string) => {
    return getGitManager().stageAll(cwd);
});

ipcMain.handle('git-commit', async (_event, cwd: string, message: string) => {
    return getGitManager().commit(cwd, message);
});

ipcMain.handle('git-push', async (_event, cwd: string, remote?: string, branch?: string) => {
    return getGitManager().push(cwd, remote, branch);
});

ipcMain.handle('git-pull', async (_event, cwd: string, remote?: string, branch?: string) => {
    return getGitManager().pull(cwd, remote, branch);
});

ipcMain.handle('git-branches', async (_event, cwd: string) => {
    return getGitManager().getBranches(cwd);
});

ipcMain.handle('git-branch-create', async (_event, cwd: string, name: string) => {
    return getGitManager().createBranch(cwd, name);
});

ipcMain.handle('git-branch-switch', async (_event, cwd: string, name: string) => {
    return getGitManager().switchBranch(cwd, name);
});

ipcMain.handle('git-branch-delete', async (_event, cwd: string, name: string, force?: boolean) => {
    return getGitManager().deleteBranch(cwd, name, force);
});

ipcMain.handle('git-branch-merge', async (_event, cwd: string, branch: string) => {
    return getGitManager().mergeBranch(cwd, branch);
});

ipcMain.handle('git-remotes', async (_event, cwd: string) => {
    return getGitManager().getRemotes(cwd);
});

ipcMain.handle('git-remote-add', async (_event, cwd: string, name: string, url: string) => {
    return getGitManager().addRemote(cwd, name, url);
});

ipcMain.handle('git-remote-remove', async (_event, cwd: string, name: string) => {
    return getGitManager().removeRemote(cwd, name);
});

ipcMain.handle('git-remote-set-url', async (_event, cwd: string, name: string, url: string) => {
    return getGitManager().setRemoteUrl(cwd, name, url);
});

ipcMain.handle('git-clone', async (_event, url: string, targetDir: string, options?: { depth?: number }) => {
    return getGitManager().clone(url, targetDir, options);
});

ipcMain.handle('github-connect-pat', async (_event, token: string) => {
    return getGitManager().saveGitHubAuth(token, 'pat');
});

ipcMain.handle('github-disconnect', async () => {
    return getGitManager().disconnectGitHub();
});

ipcMain.handle('github-get-auth', async () => {
    return getGitManager().loadGitHubAuth();
});

ipcMain.handle('github-list-repos', async (_event, page?: number, perPage?: number) => {
    return getGitManager().listGitHubRepos(page, perPage);
});

ipcMain.handle('github-search-repos', async (_event, query: string) => {
    return getGitManager().searchGitHubRepos(query);
});

// Create a new Minty window with specific tabs
ipcMain.handle('create-window-with-tabs', async (_event, tabs: any[]) => {
    console.log('[IPC] create-window-with-tabs called with tabs:', tabs);
    try {
        const newWin = new BrowserWindow({
            title: 'Minty - Library Session',
            icon: iconPath,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
            frame: false,
            show: false,
            width: 1200,
            height: 800,
        });

        console.log('[IPC] New window created, loading URL...');

        if (app.isPackaged) {
            newWin.loadFile(path.join(process.env.DIST || '', 'index.html'), {
                hash: `libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`
            });
        } else {
            loadDevUrl(newWin, `?libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`);
        }

        const loadHandler = () => {
            console.log('[IPC] New window loaded, sending tabs data');
            try {
                if (newWin.isDestroyed()) return;
                const contents = newWin.webContents;
                if (!contents || contents.isDestroyed()) return;
                try {
                    contents.send('library-tabs-loaded', tabs);
                } catch {
                    // Send can fail if connection is broken
                }
            } catch (error) {
                console.warn('[IPC] Failed to send library-tabs-loaded:', error);
            } finally {
                // Cleanup listener safely
                try {
                    if (!newWin.isDestroyed() && !newWin.webContents.isDestroyed()) {
                        newWin.webContents.removeListener('did-finish-load', loadHandler);
                    }
                } catch {
                    // Ignore cleanup errors - window already destroyed
                }
            }
        };

        // Check if webContents exists before adding listener
        if (!newWin.isDestroyed() && newWin.webContents) {
            newWin.webContents.on('did-finish-load', loadHandler);
        }

        newWin.once('ready-to-show', () => {
            console.log('[IPC] New window ready to show');
            newWin.show();
        });

        windows.add(newWin);
        const tabIds = tabs.map((t: any) => t.id);
        windowTabIds.set(newWin.id, tabIds);

        // Capture window state before it's destroyed
        newWin.on('close', () => {
            if (newWin.isDestroyed()) return;

            try {
                const windowId = newWin.id;
                const windowTabIdsList = windowTabIds.get(windowId) || [];
                const bounds = newWin.getBounds();
                const isMaximized = newWin.isMaximized();

                if (windowTabIdsList.length > 0) {
                    const activeId = windowActiveTabId.get(windowId) || '';
                    const cacheTabs: any[] = [];
                    for (const tabId of windowTabIdsList) {
                        const cwd = tabDirectories.get(tabId);
                        if (cwd) {
                            cacheTabs.push({
                                id: tabId,
                                title: cwd.split('/').pop() || 'unknown',
                                cwd: cwd,
                                isActive: tabId === activeId,
                                type: 'terminal' as const
                            });
                        }
                    }

                    forceSave({
                        windowId,
                        timestamp: Date.now(),
                        windowState: {
                            x: bounds.x,
                            y: bounds.y,
                            width: bounds.width,
                            height: bounds.height,
                            isMaximized
                        },
                        tabs: cacheTabs,
                        activeTabId: activeId
                    }).catch(err => {
                        console.warn('[Main] Failed to save cache on window close:', err);
                    });
                }
                windowActiveTabId.delete(windowId);
            } catch (error) {
                console.warn('[Main] Error saving window state on close:', error);
            }
        });

        newWin.on('closed', () => {
            const windowId = newWin.id;
            windowTabIds.delete(windowId);
            windows.delete(newWin);
        });

        console.log('[IPC] Returning success');
        return { success: true, windowId: newWin.id };
    } catch (error) {
        console.error('[IPC] Failed to create window with tabs:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Cleanup on window close
app.on('window-all-closed', async () => {
    tabPtys.forEach((ptyProcess) => {
        ptyProcess.kill();
    });
    tabPtys.clear();

    // The 'close' event on each window already called forceSave() which stored
    // entries in cacheManager's memory via updateEntry(). By the time
    // 'window-all-closed' fires, the 'closed' event has already cleared
    // windowTabIds and windows, so we can't rebuild entries from those maps.
    // Instead, just flush the in-memory cache to disk.
    try {
        await cacheManager.saveCache();
        console.log('[Main] Cache flushed to disk on app close');
    } catch (err) {
        console.warn('[Main] Failed to flush cache on app close:', err);
    }

    windowTabIds.clear();
    windowActiveTabId.clear();

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const win = createWindow()
        win?.show()
    }
})

app.whenReady().then(async () => {
    await cacheManager.initialize();
    const splash = createSplashWindow();
    const mainWin = createWindow();

    // Close splash when main window is ready, with a minimum 1.5s display time
    const splashStart = Date.now();
    let shown = false;

    const showMainWindow = () => {
        if (shown) return;
        shown = true;
        const elapsed = Date.now() - splashStart;
        const remaining = Math.max(0, 1500 - elapsed);
        setTimeout(() => {
            if (!splash.isDestroyed()) splash.close();
            if (!mainWin.isDestroyed() && !mainWin.isVisible()) mainWin.show();
        }, remaining);
    };

    mainWin.once('ready-to-show', showMainWindow);

    // Safety: if ready-to-show never fires, force-show after 8 seconds
    setTimeout(() => {
        if (!shown) {
            console.warn('[Main] ready-to-show timeout — force-showing window');
            showMainWindow();
        }
    }, 8000);
})
