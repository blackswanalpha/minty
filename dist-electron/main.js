"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const pty = __importStar(require("node-pty"));
const electron_updater_1 = require("electron-updater");
// Track PTY instances and directories per terminal tab
const tabPtys = new Map();
const tabDirectories = new Map();
// Track which window owns which tab (Tab ID -> Window WebContents ID)
const tabWindows = new Map();
// Set app identity early
electron_1.app.setName('Minty');
if (process.platform === 'linux') {
    electron_1.app.setAppUserModelId('Minty');
}
process.env.DIST = node_path_1.default.join(__dirname, '../dist');
process.env.VITE_PUBLIC = electron_1.app.isPackaged ? process.env.DIST : node_path_1.default.join(process.env.DIST, '../public');
const iconPath = node_path_1.default.resolve(process.env.VITE_PUBLIC || '', 'logo.png');
// Keep track of all windows to close app when all are closed
const windows = new Set();
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
// Configure AutoUpdater
electron_updater_1.autoUpdater.autoDownload = false;
electron_updater_1.autoUpdater.autoInstallOnAppQuit = true;
function setupAutoUpdater(win) {
    electron_updater_1.autoUpdater.on('checking-for-update', () => {
        win.webContents.send('update-checking');
    });
    electron_updater_1.autoUpdater.on('update-available', (info) => {
        win.webContents.send('update-available', info);
    });
    electron_updater_1.autoUpdater.on('update-not-available', (info) => {
        win.webContents.send('update-not-available', info);
    });
    electron_updater_1.autoUpdater.on('error', (err) => {
        win.webContents.send('update-error', err.message);
    });
    electron_updater_1.autoUpdater.on('download-progress', (progressObj) => {
        win.webContents.send('download-progress', progressObj);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
        win.webContents.send('update-downloaded', info);
    });
}
// IPC handlers for updater
electron_1.ipcMain.handle('check-for-updates', () => {
    return electron_updater_1.autoUpdater.checkForUpdates();
});
electron_1.ipcMain.handle('download-update', () => {
    return electron_updater_1.autoUpdater.downloadUpdate();
});
electron_1.ipcMain.handle('quit-and-install', () => {
    electron_updater_1.autoUpdater.quitAndInstall();
});
// Get the user's default shell
function getDefaultShell() {
    if (process.platform === 'win32') {
        return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/bash';
}
// Build environment with all common paths for CLI tools
function buildEnv() {
    const homeDir = node_os_1.default.homedir();
    const env = { ...process.env };
    // Common paths where CLI tools are installed
    const additionalPaths = [
        node_path_1.default.join(homeDir, '.local', 'bin'),
        node_path_1.default.join(homeDir, '.cargo', 'bin'),
        node_path_1.default.join(homeDir, '.npm-global', 'bin'),
        node_path_1.default.join(homeDir, 'go', 'bin'),
        node_path_1.default.join(homeDir, '.deno', 'bin'),
        node_path_1.default.join(homeDir, '.bun', 'bin'),
        node_path_1.default.join(homeDir, 'bin'),
        '/usr/local/bin',
        '/usr/bin',
        '/bin',
        '/usr/sbin',
        '/sbin',
        '/snap/bin',
        '/opt/homebrew/bin',
        '/home/linuxbrew/.linuxbrew/bin',
    ];
    const existingPath = env.PATH || '';
    const newPaths = additionalPaths.filter(p => !existingPath.includes(p)).join(':');
    env.PATH = newPaths ? `${newPaths}:${existingPath}` : existingPath;
    env.HOME = homeDir;
    env.USER = node_os_1.default.userInfo().username;
    env.TERM = 'xterm-256color';
    env.COLORTERM = 'truecolor';
    return env;
}
function createSplashWindow() {
    const splash = new electron_1.BrowserWindow({
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
    splash.loadFile(node_path_1.default.join(process.env.VITE_PUBLIC || '', 'splash.html'));
    splash.center();
    return splash;
}
function sendToWindow(tabId, channel, ...args) {
    const webContentsId = tabWindows.get(tabId);
    if (webContentsId) {
        const contents = electron_2.default.webContents.fromId(webContentsId);
        if (contents && !contents.isDestroyed()) {
            contents.send(channel, ...args);
        }
    }
}
// Need to import electron to use webContents.fromId later if not imported top-level
const electron_2 = __importDefault(require("electron"));
function createWindow() {
    const win = new electron_1.BrowserWindow({
        title: 'Minty',
        icon: iconPath,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        },
        frame: false,
        show: false,
    });
    windows.add(win);
    // Initialize updater events for this window
    setupAutoUpdater(win);
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        // Fallback for dev environment without env var
        if (!electron_1.app.isPackaged) {
            const fallbackUrl = 'http://localhost:5173';
            win.loadURL(fallbackUrl);
            console.log('Loading from ' + fallbackUrl + ' (fallback)');
        }
        else {
            win.loadFile(node_path_1.default.join(process.env.DIST || '', 'index.html'));
        }
    }
    win.once('ready-to-show', () => {
        win.show();
        // Check for updates on startup
        if (electron_1.app.isPackaged) { // Check only in production
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        }
    });
    win.on('closed', () => {
        windows.delete(win);
    });
    return win;
}
// Window controls - need to handle for key window or sender
electron_1.ipcMain.on('toggle-devtools', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
        }
        else {
            win.webContents.openDevTools();
        }
    }
});
electron_1.ipcMain.on('window-minimize', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
});
electron_1.ipcMain.on('window-maximize', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
        win?.unmaximize();
    }
    else {
        win?.maximize();
    }
});
electron_1.ipcMain.on('window-close', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    win?.close();
});
// Create new window handler
electron_1.ipcMain.handle('create-new-window', async () => {
    try {
        const newWin = createWindow(); // Use same function
        return { success: true, windowId: newWin.id };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Create new tab handler
electron_1.ipcMain.handle('create-new-tab', async (event) => {
    try {
        const tabId = Date.now().toString();
        const homeDir = node_os_1.default.homedir();
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
            env: env
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
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Old window handlers removed
// Get home directory
electron_1.ipcMain.handle('get-home-directory', () => {
    return node_os_1.default.homedir();
});
// Get current working directory for a tab
electron_1.ipcMain.handle('get-cwd', (_event, tabId) => {
    return tabDirectories.get(tabId) || node_os_1.default.homedir();
});
// Set current working directory for a tab
electron_1.ipcMain.handle('set-cwd', (_event, tabId, cwd) => {
    tabDirectories.set(tabId, cwd);
    return cwd;
});
// Create persistent PTY session for a tab
// Create persistent PTY session for a tab
electron_1.ipcMain.handle('create-pty-session', (event, tabId) => {
    // Kill existing PTY if any
    const existingPty = tabPtys.get(tabId);
    if (existingPty) {
        existingPty.kill();
    }
    const homeDir = node_os_1.default.homedir();
    tabDirectories.set(tabId, homeDir);
    // Register window
    tabWindows.set(tabId, event.sender.id);
    const shell = getDefaultShell();
    const env = buildEnv();
    try {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 120,
            rows: 30,
            cwd: homeDir,
            env: env
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
        return { success: true, cwd: homeDir };
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create PTY session',
            cwd: homeDir
        };
    }
});
// Initialize a new tab (legacy support + creates PTY)
// Initialize a new tab (legacy support + creates PTY)
electron_1.ipcMain.handle('init-tab', (event, tabId) => {
    const homeDir = node_os_1.default.homedir();
    tabDirectories.set(tabId, homeDir);
    // Register window
    tabWindows.set(tabId, event.sender.id);
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
            env: env
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
    }
    catch (err) {
        console.error('Failed to create PTY:', err);
    }
    return homeDir;
});
// Remove tab and cleanup PTY
electron_1.ipcMain.handle('remove-tab', (_event, tabId) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.kill();
        tabPtys.delete(tabId);
    }
    tabDirectories.delete(tabId);
    return true;
});
// Send input to PTY (for interactive commands)
electron_1.ipcMain.handle('send-input', (_event, tabId, input) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.write(input);
        return { success: true };
    }
    return { success: false, error: 'No active PTY session' };
});
// Send command to PTY (writes command + newline)
electron_1.ipcMain.handle('send-command', (_event, tabId, command) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.write(command + '\n');
        return { success: true };
    }
    return { success: false, error: 'No active PTY session' };
});
// Resize PTY
electron_1.ipcMain.handle('resize-pty', (_event, tabId, cols, rows) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        ptyProcess.resize(cols, rows);
        return { success: true };
    }
    return { success: false };
});
// Send signal to PTY (e.g., Ctrl+C)
electron_1.ipcMain.handle('send-signal', (_event, tabId, signal) => {
    const ptyProcess = tabPtys.get(tabId);
    if (ptyProcess) {
        if (signal === 'SIGINT') {
            ptyProcess.write('\x03'); // Ctrl+C
        }
        else if (signal === 'SIGTSTP') {
            ptyProcess.write('\x1A'); // Ctrl+Z
        }
        else if (signal === 'EOF') {
            ptyProcess.write('\x04'); // Ctrl+D
        }
        return { success: true };
    }
    return { success: false };
});
// Execute command (legacy mode - non-interactive, returns when complete)
electron_1.ipcMain.handle('execute-command', async (_event, command, tabId) => {
    const cwd = tabDirectories.get(tabId) || node_os_1.default.homedir();
    const trimmedCmd = command.trim();
    // Handle cd command specially to track directory changes
    const cdMatch = trimmedCmd.match(/^cd\s*(.*)?$/);
    if (cdMatch) {
        const targetPath = cdMatch[1]?.trim() || node_os_1.default.homedir();
        let newPath;
        if (targetPath === '' || targetPath === '~') {
            newPath = node_os_1.default.homedir();
        }
        else if (targetPath === '-') {
            newPath = cwd;
        }
        else if (targetPath.startsWith('~')) {
            if (targetPath === '~' || targetPath === '~/') {
                newPath = node_os_1.default.homedir();
            }
            else {
                newPath = node_path_1.default.join(node_os_1.default.homedir(), targetPath.slice(2));
            }
        }
        else if (node_path_1.default.isAbsolute(targetPath)) {
            newPath = targetPath;
        }
        else {
            newPath = node_path_1.default.resolve(cwd, targetPath);
        }
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
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
        }
        catch {
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
                env: env
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
        }
        catch (err) {
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
electron_1.ipcMain.handle('list-commands', async () => {
    const env = buildEnv();
    const pathDirs = (env.PATH || '').split(':');
    const commands = [];
    const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
    for (const dir of pathDirs) {
        try {
            const files = await fs.readdir(dir);
            commands.push(...files);
        }
        catch {
            // Directory doesn't exist or isn't readable
        }
    }
    return [...new Set(commands)].sort();
});
// Check if a specific command exists
electron_1.ipcMain.handle('command-exists', async (_event, command) => {
    const env = buildEnv();
    const pathDirs = (env.PATH || '').split(':');
    const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
    for (const dir of pathDirs) {
        try {
            const cmdPath = node_path_1.default.join(dir, command);
            await fs.access(cmdPath, (await Promise.resolve().then(() => __importStar(require('node:fs')))).constants.X_OK);
            return { exists: true, path: cmdPath };
        }
        catch {
            // Command not found in this directory
        }
    }
    return { exists: false, path: null };
});
// Get system info
electron_1.ipcMain.handle('get-system-info', () => {
    return {
        platform: process.platform,
        arch: node_os_1.default.arch(),
        hostname: node_os_1.default.hostname(),
        username: node_os_1.default.userInfo().username,
        shell: getDefaultShell(),
        homeDir: node_os_1.default.homedir(),
        tempDir: node_os_1.default.tmpdir()
    };
});
// Get current tabs for saving
electron_1.ipcMain.handle('get-current-tabs', () => {
    const tabs = [];
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
electron_1.ipcMain.handle('save-to-library', async (_event, _libraryItem) => {
    try {
        // Use localStorage through the renderer process
        // This will be handled in the renderer process
        return { success: true };
    }
    catch (error) {
        console.error('Failed to save to library:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Open tab with specific directory
// Open tab with specific directory
electron_1.ipcMain.handle('open-tab-with-directory', async (event, cwd, title) => {
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
            env: env
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
        // Send tab info back to renderer
        return { success: true, tabId: newId, cwd, title: title || cwd.split('/').pop() };
    }
    catch (error) {
        console.error('Failed to open tab with directory:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Create .minty file for agent tracking
electron_1.ipcMain.handle('create-minty-file', async (_event, { path: filePath, content }) => {
    try {
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true, message: 'File created successfully' };
    }
    catch (error) {
        console.error('Failed to create .minty file:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Run minty index (Enhance Prompt)
electron_1.ipcMain.handle('run-minty-index', async (_event, targetDir) => {
    try {
        console.log(`[IPC] Running minty index on: ${targetDir}`);
        // Determine path to cli/src/index.js
        // In dev: project_root/cli/src/index.js
        // We can try to guess it relative to __dirname or process.cwd()
        // Assuming we are running from project root in dev
        let cliPath = node_path_1.default.resolve(process.cwd(), 'cli/src/index.js');
        // Check if file exists
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        try {
            await fs.access(cliPath);
        }
        catch {
            // Fallback for production/packaged execution might differ, 
            // but for now we focus on the active development workspace.
            console.warn(`[IPC] Could not find CLI at ${cliPath}, trying to locate...`);
            // Attempt to locate if CWD is deeper
            cliPath = node_path_1.default.resolve(__dirname, '../../cli/src/index.js'); // Heuristic
        }
        const cp = await Promise.resolve().then(() => __importStar(require('node:child_process')));
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
                }
                else {
                    console.error('[IPC] Minty CLI failed:', errorOutput);
                    resolve({ success: false, error: errorOutput || 'Unknown CLI error' });
                }
            });
        });
    }
    catch (error) {
        console.error('Failed to run minty index:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Read codebase context
electron_1.ipcMain.handle('read-codebase-context', async (_event, targetDir) => {
    try {
        const contextPath = node_path_1.default.join(targetDir, 'codebase.md');
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        // Check if exists
        try {
            await fs.access(contextPath);
        }
        catch {
            return { success: false, error: 'codebase.md not found. Please index the directory first.' };
        }
        const content = await fs.readFile(contextPath, 'utf-8');
        // Limit content size if huge? For now read all.
        // Maybe truncate if > 100KB for the prompt context to avoid blowing up tokens too much blindly.
        // Let's take the first 50KB or just return it all and let frontend decide.
        // Implementation Plan said "summary/snippet", but reading full file gives frontend flexibility.
        return { success: true, content };
    }
    catch (error) {
        console.error('Failed to read codebase context:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Library storage path - use app data directory
const getLibraryPath = () => {
    return node_path_1.default.join(electron_1.app.getPath('userData'), 'library');
};
// Ensure library directory exists
const ensureLibraryDir = async () => {
    const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
    const libPath = getLibraryPath();
    try {
        await fs.access(libPath);
    }
    catch {
        await fs.mkdir(libPath, { recursive: true });
    }
    return libPath;
};
// Save library item to JSON file
electron_1.ipcMain.handle('library-save', async (_event, item) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = node_path_1.default.join(libPath, `${item.id}.json`);
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        await fs.writeFile(filePath, JSON.stringify(item, null, 2), 'utf-8');
        return { success: true, id: item.id };
    }
    catch (error) {
        console.error('Failed to save library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Load all library items
electron_1.ipcMain.handle('library-load-all', async () => {
    try {
        const libPath = await ensureLibraryDir();
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        try {
            await fs.access(libPath);
        }
        catch {
            return { success: true, items: [] };
        }
        const files = await fs.readdir(libPath);
        const items = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = node_path_1.default.join(libPath, file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    items.push(JSON.parse(content));
                }
                catch (err) {
                    console.error(`Failed to read library file ${file}:`, err);
                }
            }
        }
        return { success: true, items };
    }
    catch (error) {
        console.error('Failed to load library items:', error);
        return { success: false, items: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Load single library item
electron_1.ipcMain.handle('library-load', async (_event, id) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = node_path_1.default.join(libPath, `${id}.json`);
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        try {
            await fs.access(filePath);
        }
        catch {
            return { success: false, error: 'Item not found' };
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, item: JSON.parse(content) };
    }
    catch (error) {
        console.error('Failed to load library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Delete library item
electron_1.ipcMain.handle('library-delete', async (_event, id) => {
    try {
        const libPath = await ensureLibraryDir();
        const filePath = node_path_1.default.join(libPath, `${id}.json`);
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs/promises')));
        try {
            await fs.unlink(filePath);
            return { success: true };
        }
        catch {
            return { success: false, error: 'Item not found' };
        }
    }
    catch (error) {
        console.error('Failed to delete library item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Create a new Minty window with specific tabs
electron_1.ipcMain.handle('create-window-with-tabs', async (_event, tabs) => {
    console.log('[IPC] create-window-with-tabs called with tabs:', tabs);
    try {
        const newWin = new electron_1.BrowserWindow({
            title: 'Minty - Library Session',
            icon: iconPath,
            webPreferences: {
                preload: node_path_1.default.join(__dirname, 'preload.js'),
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
        }
        else {
            if (!electron_1.app.isPackaged) {
                const fallbackUrl = 'http://localhost:5174';
                newWin.loadURL(`${fallbackUrl}?libraryTabs=${encodeURIComponent(JSON.stringify(tabs))}`);
            }
            else {
                newWin.loadFile(node_path_1.default.join(process.env.DIST || '', 'index.html'), {
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
    }
    catch (error) {
        console.error('[IPC] Failed to create window with tabs:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
});
// Cleanup on window close
electron_1.app.on('window-all-closed', () => {
    tabPtys.forEach((ptyProcess) => {
        ptyProcess.kill();
    });
    tabPtys.clear();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        const win = createWindow();
        win?.show();
    }
});
electron_1.app.whenReady().then(async () => {
    const splash = createSplashWindow();
    const mainWin = createWindow();
    setTimeout(() => {
        splash.close();
        mainWin?.show();
    }, 3000);
});
//# sourceMappingURL=main.js.map