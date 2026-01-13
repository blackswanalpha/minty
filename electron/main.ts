import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import os from 'node:os'
import * as pty from 'node-pty'

// Track PTY instances and directories per terminal tab
const tabPtys: Map<string, pty.IPty> = new Map()
const tabDirectories: Map<string, string> = new Map()

// Set app identity early
app.setName('Minty');
if (process.platform === 'linux') {
    app.setAppUserModelId('Minty');
}

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
const iconPath = path.resolve(process.env.VITE_PUBLIC || '', 'logo.png');

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

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

function createWindow() {
    win = new BrowserWindow({
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

    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
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
}

// Window controls
ipcMain.on('toggle-devtools', () => {
    if (win?.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
    } else {
        win?.webContents.openDevTools();
    }
});

// Create new window handler
ipcMain.handle('create-new-window', async () => {
    try {
        const newWin = new BrowserWindow({
            title: 'Minty',
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

        if (VITE_DEV_SERVER_URL) {
            newWin.loadURL(VITE_DEV_SERVER_URL);
        } else {
            if (!app.isPackaged) {
                const fallbackUrl = 'http://localhost:5174';
                newWin.loadURL(fallbackUrl);
            } else {
                newWin.loadFile(path.join(process.env.DIST || '', 'index.html'));
            }
        }

        newWin.once('ready-to-show', () => {
            newWin.show();
        });

        return { success: true, windowId: newWin.id };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Create new tab handler
ipcMain.handle('create-new-tab', async () => {
    try {
        const tabId = Date.now().toString();
        const homeDir = os.homedir();
        tabDirectories.set(tabId, homeDir);

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
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-output', { tabId, data });
            }
        });

        ptyProcess.onExit(({ exitCode }) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-exit', { tabId, exitCode });
            }
            tabPtys.delete(tabId);
        });

        // Send tab-created event to renderer
        if (win && !win.isDestroyed()) {
            win.webContents.send('tab-created', tabId, homeDir, homeDir.split('/').pop() || 'home');
        }

        return { success: true, tabId, cwd: homeDir };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

ipcMain.on('window-minimize', () => {
    win?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
        win?.unmaximize();
    } else {
        win?.maximize();
    }
});

ipcMain.on('window-close', () => {
    win?.close();
});

// Get home directory
ipcMain.handle('get-home-directory', () => {
    return os.homedir();
});

// Get current working directory for a tab
ipcMain.handle('get-cwd', (_event, tabId: string) => {
    return tabDirectories.get(tabId) || os.homedir();
});

// Set current working directory for a tab
ipcMain.handle('set-cwd', (_event, tabId: string, cwd: string) => {
    tabDirectories.set(tabId, cwd);
    return cwd;
});

// Create persistent PTY session for a tab
ipcMain.handle('create-pty-session', (_event, tabId: string) => {
    // Kill existing PTY if any
    const existingPty = tabPtys.get(tabId);
    if (existingPty) {
        existingPty.kill();
    }

    const homeDir = os.homedir();
    tabDirectories.set(tabId, homeDir);

    const shell = getDefaultShell();
    const env = buildEnv();

    try {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: homeDir,
            env: env as { [key: string]: string }
        });

        tabPtys.set(tabId, ptyProcess);

        // Stream output to renderer
        ptyProcess.onData((data) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-output', { tabId, data });
            }
        });

        // Handle PTY exit
        ptyProcess.onExit(({ exitCode }) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-exit', { tabId, exitCode });
            }
            tabPtys.delete(tabId);
        });

        return { success: true, cwd: homeDir };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create PTY session',
            cwd: homeDir
        };
    }
});

// Initialize a new tab (legacy support + creates PTY)
ipcMain.handle('init-tab', (_event, tabId: string) => {
    const homeDir = os.homedir();
    tabDirectories.set(tabId, homeDir);

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
            cwd: homeDir,
            env: env as { [key: string]: string }
        });

        tabPtys.set(tabId, ptyProcess);

        ptyProcess.onData((data) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-output', { tabId, data });
            }
        });

        ptyProcess.onExit(({ exitCode }) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-exit', { tabId, exitCode });
            }
            tabPtys.delete(tabId);
        });
    } catch (err) {
        console.error('Failed to create PTY:', err);
    }

    return homeDir;
});

// Remove tab and cleanup PTY
ipcMain.handle('remove-tab', (_event, tabId: string) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.kill();
        tabPtys.delete(tabId);
    }
    tabDirectories.delete(tabId);
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
        const shellArgs = process.platform === 'win32'
            ? ['/c', command]
            : ['-l', '-c', command];

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
ipcMain.handle('open-tab-with-directory', async (_event: any, cwd: string, title?: string) => {
    try {
        const newId = Date.now().toString();
        tabDirectories.set(newId, cwd);

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
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-output', { tabId: newId, data });
            }
        });

        ptyProcess.onExit(({ exitCode }) => {
            if (win && !win.isDestroyed()) {
                win.webContents.send('pty-exit', { tabId: newId, exitCode });
            }
            tabPtys.delete(newId);
        });

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

        newWin.webContents.on('did-finish-load', () => {
            console.log('[IPC] New window loaded, sending tabs data');
            // Send tabs data to the new window
            newWin.webContents.send('library-tabs-loaded', tabs);
        });

        newWin.once('ready-to-show', () => {
            console.log('[IPC] New window ready to show');
            newWin.show();
        });

        newWin.on('closed', () => {
            console.log('[IPC] New window closed');
        });

        console.log('[IPC] Returning success');
        return { success: true, windowId: newWin.id };
    } catch (error) {
        console.error('[IPC] Failed to create window with tabs:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});

// Cleanup on window close
app.on('window-all-closed', () => {
    tabPtys.forEach((ptyProcess) => {
        ptyProcess.kill();
    });
    tabPtys.clear();

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
        win?.show()
    }
})

app.whenReady().then(async () => {
    const splash = createSplashWindow();
    createWindow();

    setTimeout(() => {
        splash.close();
        win?.show();
    }, 3000);
})
