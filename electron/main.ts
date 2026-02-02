import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import os from 'node:os'
import * as pty from 'node-pty'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { cacheManager } from './cache/cacheManager'
import { scheduleCacheSave, forceSave, saveAllWindows } from './cache/cacheWorker'

// Configure Logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Track PTY instances and directories per terminal tab
const tabPtys: Map<string, pty.IPty> = new Map()
const tabDirectories: Map<string, string> = new Map()
// Track which window owns which tab (Tab ID -> Window WebContents ID)
const tabWindows: Map<string, number> = new Map()

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
            const contents = electron.webContents.fromId(webContentsId);
            if (contents && !contents.isDestroyed()) {
                contents.send(channel, ...args);
            }
        } catch (error) {
            console.warn(`Failed to send message to tab ${tabId}:`, error);
        }
    }
}

// Need to import electron to use webContents.fromId later if not imported top-level
import electron from 'electron';

function createWindow() {
    const win = new BrowserWindow({
        title: 'Minty',
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
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

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // Fallback for dev environment without env var
        if (!app.isPackaged) {
            const fallbackUrl = 'http://localhost:5173';
            win.loadURL(fallbackUrl);
            console.log('Loading from ' + fallbackUrl + ' (fallback)');
        } else {
            win.loadFile(path.join(process.env.DIST || '', 'index.html'))
        }
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
                const tabs: any[] = [];
                for (const tabId of windowTabIdsList) {
                    const cwd = tabDirectories.get(tabId);
                    console.log('[Main] Processing tab', tabId, 'cwd:', cwd);
                    if (cwd) {
                        tabs.push({
                            id: tabId,
                            title: cwd.split('/').pop() || 'unknown',
                            cwd: cwd,
                            isActive: false,
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
                    activeTabId: ''
                }).catch(err => {
                    console.warn('[Main] Failed to save cache on window close:', err);
                });
            }
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
        const newWin = createWindow(); // Use same function
        return { success: true, windowId: newWin.id };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Create new tab handler
ipcMain.handle('create-new-tab', async (event) => {
    try {
        const tabId = Date.now().toString();
        const homeDir = os.homedir();
        tabDirectories.set(tabId, homeDir);

        // Register window mapping
        tabWindows.set(tabId, event.sender.id);

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

        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
            sendToWindow(tabId, 'pty-exit', { tabId, exitCode });
            tabPtys.delete(tabId);
            tabWindows.delete(tabId);
        });

        // Send tab-created event to renderer
        event.sender.send('tab-created', tabId, homeDir, homeDir.split('/').pop() || 'home');

        return { success: true, tabId, cwd: homeDir };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Old window handlers removed


// Get home directory
ipcMain.handle('get-home-directory', () => {
    return os.homedir();
});

// Get current window ID
ipcMain.handle('get-window-id', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.id : null;
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

    // For Linux: use /proc to read shell's cwd (completely invisible!)
    if (process.platform === 'linux') {
        try {
            const pid = (ptyProcess as any).pid;
            if (pid) {
                const fs = await import('node:fs/promises');
                // Read /proc/[pid]/cwd symlink which points to current working directory
                const cwd = await fs.readlink(`/proc/${pid}/cwd`);
                if (cwd && cwd !== tabDirectories.get(tabId)) {
                    console.log('[Main] Directory changed for tab', tabId, ':', cwd);
                    tabDirectories.set(tabId, cwd);
                }
                return cwd;
            }
        } catch (error) {
            // Fallback to tracked directory if /proc reading fails
            console.warn('[Main] Failed to read /proc for tab', tabId, ':', error);
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

// Create persistent PTY session for a tab
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

        // Stream output to renderer
        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        // Handle PTY exit
        ptyProcess.onExit(({ exitCode }) => {
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

        ptyProcess.onData((data) => {
            sendToWindow(tabId, 'pty-output', { tabId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
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
            newPath = cwd;
        } else if (targetPath.startsWith('~')) {
            if (targetPath === '~' || targetPath === '~/') {
                newPath = os.homedir();
            } else {
                newPath = path.join(os.homedir(), targetPath.slice(2));
            }
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
// Open tab with specific directory
ipcMain.handle('open-tab-with-directory', async (event: any, cwd: string, title?: string) => {
    try {
        const newId = Date.now().toString();
        tabDirectories.set(newId, cwd);

        // Register window
        tabWindows.set(newId, event.sender.id);

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

        ptyProcess.onData((data) => {
            sendToWindow(newId, 'pty-output', { tabId: newId, data });
        });

        ptyProcess.onExit(({ exitCode }) => {
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

ipcMain.handle('cache-save', async (_event, entry: any) => {
    try {
        const settings = cacheManager.getSettings();
        if (!settings.enabled) {
            return { success: true, skipped: true };
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

ipcMain.handle('cache-register-tab', async (_event, windowId: number, tabId: string) => {
    try {
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

// Create a new Minty window with specific tabs
ipcMain.handle('create-window-with-tabs', async (_event, tabs: any[]) => {
    console.log('[IPC] create-window-with-tabs called with tabs:', tabs);
    try {
        const newWin = new BrowserWindow({
            title: 'Minty - Library Session',
            icon: iconPath,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: true,
            },
            frame: false,
            show: false,
            width: 1200,
            height: 800,
        });

        console.log('[IPC] New window created, loading URL...');

        if (VITE_DEV_SERVER_URL) {
            newWin.loadURL(`${VITE_DEV_SERVER_URL}?libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`);
        } else {
            if (!app.isPackaged) {
                const fallbackUrl = 'http://localhost:5174';
                newWin.loadURL(`${fallbackUrl}?libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`);
            } else {
                newWin.loadFile(path.join(process.env.DIST || '', 'index.html'), {
                    hash: `libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`
                });
            }
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
                    const cacheTabs: any[] = [];
                    for (const tabId of windowTabIdsList) {
                        const cwd = tabDirectories.get(tabId);
                        if (cwd) {
                            cacheTabs.push({
                                id: tabId,
                                title: cwd.split('/').pop() || 'unknown',
                                cwd: cwd,
                                isActive: false,
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
                        activeTabId: ''
                    }).catch(err => {
                        console.warn('[Main] Failed to save cache on window close:', err);
                    });
                }
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

    const entries: any[] = [];
    for (const win of windows) {
        // Skip destroyed windows
        if (win.isDestroyed()) {
            continue;
        }

        try {
            const windowId = win.id;
            const windowTabIdsList = windowTabIds.get(windowId) || [];
            const bounds = win.getBounds();
            const isMaximized = win.isMaximized();

            if (windowTabIdsList.length > 0) {
                const cacheTabs: any[] = [];
                for (const tabId of windowTabIdsList) {
                    const cwd = tabDirectories.get(tabId);
                    if (cwd) {
                        cacheTabs.push({
                            id: tabId,
                            title: cwd.split('/').pop() || 'unknown',
                            cwd: cwd,
                            isActive: false,
                            type: 'terminal' as const
                        });
                    }
                }

                entries.push({
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
                    activeTabId: ''
                });
            }
        } catch (error) {
            // Window was destroyed while processing
            console.warn('[Main] Window destroyed during save:', error);
        }
    }

    await saveAllWindows(entries).catch(err => {
        console.warn('[Main] Failed to save all windows cache:', err);
    });
    windowTabIds.clear();

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

    setTimeout(() => {
        splash.close();
        mainWin?.show();
    }, 3000);
})
