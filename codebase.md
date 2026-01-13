# Codebase Dump

## File: .gitignore
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

## File: README.md
```
# 🍃 Minty Terminal

Minty is a modern, lightweight, and highly customizable terminal emulator built with **Electron**, **React**, and **Vite**. It focuses on speed, aesthetics, and a smooth developer experience.

![Minty Logo](public/logo.png)

## ✨ Features

- **🚀 Performance**: Fast startup and low latency powered by `node-pty` and `xterm.js`.
- **🎨 Customization**: Beautiful dark mode with vibrant accents and glassmorphism.
- **📑 Tabbed Interface**: Manage multiple terminal sessions with ease.
- **🛠 Multi-platform**: Native support for Linux, Windows, and macOS.
- **📂 Persistent Sessions**: Keeps track of your working directories across tabs.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite 7](https://vite.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Electron**: [Electron 39](https://www.electronjs.org/)
- **Terminal Core**: [xterm.js](https://xtermjs.org/), [node-pty](https://github.com/microsoft/node-pty)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Animations**: [GSAP](https://gsap.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/minty-app/minty.git
    cd minty/minty-main
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run in development mode**:
    ```bash
    npm run dev
    ```

## 📦 Building for Production

To create production-ready installers for your current platform:

```bash
npm run dist
```

For detailed information on app distribution and asset preparation, please refer to:
- 📖 [Installer Development Guide](installer.md)
- 📝 [Custom Icon Walkthrough](.gemini/antigravity/brain/48f76379-03e5-4a94-a8c4-79b2620499a2/walkthrough.md)

## 📁 Project Structure

```text
├── electron/         # Electron main process & preload scripts
├── src/              # React frontend source code
│   ├── components/   # UI components (terminal, sidebar, etc.)
│   ├── lib/          # Utilities and hooks
│   └── main.tsx      # React entry point
├── public/           # Static assets (icons, splash screen)
├── build/            # Distribution resources (app icons)
└── package.json      # Dependencies and build configuration
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help make Minty even better.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

```

## File: components.json
```
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "default",
    "rsc": false,
    "tsx": true,
    "tailwind": {
        "config": "tailwind.config.js",
        "css": "src/index.css",
        "baseColor": "slate",
        "cssVariables": true,
        "prefix": ""
    },
    "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
    }
}
```

## File: eslint.config.js
```
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

```

## File: index.html
```
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/logo.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:*; frame-src 'self';">
  <title>minty</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

## File: installer.md
```
# Minty Installer Development Guide

This document outlines the process for creating installers for the Minty Terminal Emulator across different platforms (Linux, Windows, macOS).

## Prerequisites

- **Node.js**: Ensure you have a recent version of Node.js installed.
- **npm**: Standard package manager.
- **Platform Specifics**:
    - **Linux**: Building `.deb` or `AppImage` typically requires `p7zip-full` and other standard build tools.
    - **Windows**: Can be built from Linux/macOS using Wine, but native building is recommended.
    - **macOS**: Must be built on macOS for signed DMGs.

## Build Scripts

The following scripts are defined in `package.json`:

- `npm run build`: Compiles the React frontend and Electron main process.
- `npm run pack`: Packages the app into a directory for testing without creating a full installer.
- `npm run dist`: Builds the full installers/exchanges for the current platform.

## Configuration

We use `electron-builder` for packaging. The configuration is located in the `build` section of `package.json`.

### Key Settings

- **Output Directory**: `dist_electron`
- **Build Resources**: `build/` (contains icons)
- **Linux Targets**: `AppImage`, `deb`
- **Windows Target**: `nsis` (Setup installer)
- **macOS Target**: `dmg`

## Step-by-Step Instructions

## Asset Preparation

Preparing high-quality assets is crucial for a professional look and feel. Below are the specific requirements and methods for each platform.

### 1. Source Image Requirements
- **Format**: PNG with transparency.
- **Resolution**: Minimum 1024x1024 pixels.
- **Naming**: `icon.png` in the `build/` root.

### 2. Generating Multi-size Icons
Electron-builder requires specific formats for different operating systems. You can automate this process using a tool like `electron-icon-builder`.

#### Using Automation (Recommended)
You can add a temporary script to generate all sizes:
```bash
npx electron-icon-builder --input=./public/logo.png --output=./build --flatten
```
This will populate `build/icons/` with all the required sizes for Linux and generate `icon.ico` and `icon.icns`.

#### Platform Specific Formats
- **Windows (`.ico`)**: A single file containing multiple sizes (16, 32, 48, 64, 128, 256).
- **macOS (`.icns`)**: High-resolution icon set for Retina displays.
- **Linux (`.png`)**: A folder of PNGs in `build/icons/` named by resolution (e.g., `512x512.png`).

### 3. Splash Screen Assets
If you use a splash screen (as seen in `electron/main.ts`):
- **HTML**: `public/splash.html`
- **Image**: Should be lightweight for fast loading.

### 4. Verification Check
Before building, ensure the following structure exists:
```text
build/
├── icon.ico (Windows)
├── icon.icns (macOS)
└── icons/ (Linux)
    ├── 16x16.png
    ├── 32x32.png
    ├── ...
    └── 512x512.png
```

### 2. Run the Build
Before packaging, you must compile the source code:
```bash
npm run build
```

### 3. Create Installers
Run the distribution command:
```bash
npm run dist
```
The resulting installers will be located in the `dist_electron/` folder.

## Troubleshooting

### Linux Metadata Issues
If the `.deb` installer fails to launch with a proper icon in the dock, ensure:
- `StartupWMClass` in the desktop entry matches the `productName` in `package.json`.
- `app.setAppUserModelId('Minty')` is called in `electron/main.ts`.

### Native Dependencies
If you add native modules (like `node-pty`), ensure they are rebuilt for the target architecture using:
```bash
npm run rebuild
```
*(Note: `electron-rebuild` is included in devDependencies)*.

```

## File: minty.desktop
```
[Desktop Entry]
Name=Minty
Comment=Modern Terminal Emulator
Exec=minty
Icon=minty
Type=Application
Terminal=false
Categories=Development;System;TerminalEmulator;
StartupWMClass=Minty

```

## File: package.json
```
{
  "name": "minty",
  "private": true,
  "version": "0.1.0",
  "description": "Modern Terminal Emulator built with Electron and React",
  "author": "Minty Authors <contact@minty.app>",
  "homepage": "https://github.com/minty-app/minty",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run dev:electron\"",
    "dev:electron": "tsc -p tsconfig.electron.json && electron . --no-sandbox",
    "build": "tsc -b && vite build && tsc -p tsconfig.electron.json",
    "dist": "npm run build && electron-builder",
    "pack": "npm run build && electron-builder --dir",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "build": {
    "appId": "com.minty.app",
    "productName": "Minty",
    "copyright": "Copyright © 2026",
    "directories": {
      "output": "dist_electron",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "package.json"
    ],
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "maintainer": "Minty Authors <contact@minty.app>",
      "category": "TerminalEmulator",
      "icon": "build/icons",
      "executableName": "minty"
    },
    "win": {
      "target": [
        "nsis"
      ],
      "icon": "build/icon.ico",
      "executableName": "minty"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build/icon.ico",
      "uninstallerIcon": "build/icon.ico",
      "artifactName": "${productName}-Setup-${version}.${ext}"
    },
    "mac": {
      "target": [
        "dmg"
      ],
      "icon": "build/icon.icns"
    }
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.16",
    "@types/uuid": "^10.0.0",
    "@xterm/addon-fit": "^0.11.0",
    "@xterm/xterm": "^6.0.0",
    "axios": "^1.13.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "gsap": "^3.14.2",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.562.0",
    "next-themes": "^0.4.6",
    "node-pty": "^1.1.0",
    "react": "^19.2.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.70.0",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^7.12.0",
    "recharts": "^3.6.0",
    "socket.io": "^4.8.3",
    "socket.io-client": "^4.8.3",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^13.0.0",
    "vaul": "^1.1.2",
    "zod": "^4.3.5",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "concurrently": "^9.2.1",
    "cross-env": "^10.1.0",
    "electron": "^39.2.7",
    "electron-builder": "^26.4.0",
    "electron-rebuild": "^3.2.9",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

## File: postcss.config.mjs
```
export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
}

```

## File: tsconfig.app.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "types": [
      "vite/client"
    ],
    "skipLibCheck": true,
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "src"
  ]
}
```

## File: tsconfig.electron.json
```
{
    "compilerOptions": {
        "target": "ESNext",
        "useDefineForClassFields": true,
        "module": "commonjs",
        "moduleResolution": "Node",
        "strict": true,
        "sourceMap": true,
        "resolveJsonModule": true,
        "isolatedModules": false,
        "esModuleInterop": true,
        "noEmit": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "outDir": "dist-electron",
        "skipLibCheck": true
    },
    "include": [
        "electron"
    ]
}
```

## File: tsconfig.json
```
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

## File: tsconfig.node.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}

```

## File: vite.config.ts
```
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

```

## File: cli/package.json
```
{
    "name": "minty-cli",
    "version": "0.1.0",
    "description": "CLI tool for Minty application",
    "main": "src/index.js",
    "type": "module",
    "bin": {
        "minty": "./bin/minty.js"
    },
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
        "minty",
        "cli",
        "agent"
    ],
    "author": "Minty Authors",
    "license": "ISC",
    "dependencies": {
        "commander": "^12.0.0",
        "chalk": "^5.3.0",
        "fast-glob": "^3.3.2"
    }
}
```

## File: dist-electron/main.js
```
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
// Track PTY instances and directories per terminal tab
const tabPtys = new Map();
const tabDirectories = new Map();
// Set app identity early
electron_1.app.setName('Minty');
if (process.platform === 'linux') {
    electron_1.app.setAppUserModelId('Minty');
}
process.env.DIST = node_path_1.default.join(__dirname, '../dist');
process.env.VITE_PUBLIC = electron_1.app.isPackaged ? process.env.DIST : node_path_1.default.join(process.env.DIST, '../public');
const iconPath = node_path_1.default.resolve(process.env.VITE_PUBLIC || '', 'logo.png');
let win;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
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
function createWindow() {
    win = new electron_1.BrowserWindow({
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
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        // Fallback for dev environment without env var
        if (!electron_1.app.isPackaged) {
            win.loadURL('http://localhost:5173');
            console.log('Loading from localhost:5173 (fallback)');
        }
        else {
            win.loadFile(node_path_1.default.join(process.env.DIST || '', 'index.html'));
        }
    }
}
// IPC Handlers for window controls
electron_1.ipcMain.on('toggle-devtools', () => {
    if (win?.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
    }
    else {
        win?.webContents.openDevTools();
    }
});
electron_1.ipcMain.on('window-minimize', () => {
    win?.minimize();
});
electron_1.ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
        win?.unmaximize();
    }
    else {
        win?.maximize();
    }
});
electron_1.ipcMain.on('window-close', () => {
    win?.close();
});
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
electron_1.ipcMain.handle('create-pty-session', (_event, tabId) => {
    // Kill existing PTY if any
    const existingPty = tabPtys.get(tabId);
    if (existingPty) {
        existingPty.kill();
    }
    const homeDir = node_os_1.default.homedir();
    tabDirectories.set(tabId, homeDir);
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
electron_1.ipcMain.handle('init-tab', (_event, tabId) => {
    const homeDir = node_os_1.default.homedir();
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
            env: env
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
electron_1.ipcMain.handle('open-tab-with-directory', async (_event, cwd, title) => {
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
            env: env
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
        createWindow();
        win?.show();
    }
});
electron_1.app.whenReady().then(async () => {
    const splash = createSplashWindow();
    createWindow();
    setTimeout(() => {
        splash.close();
        win?.show();
    }, 3000);
});
//# sourceMappingURL=main.js.map
```

## File: dist-electron/main.js.map
```
{"version":3,"file":"main.js","sourceRoot":"","sources":["../electron/main.ts"],"names":[],"mappings":"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"}
```

## File: dist-electron/preload.js
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Increase max listeners to prevent warnings with multiple tabs
electron_1.ipcRenderer.setMaxListeners(50);
// Store listeners for cleanup
const listeners = new Map();
// Expose IPC API to renderer process
electron_1.contextBridge.exposeInMainWorld('ipcRenderer', {
    // Listen to events from main process
    on(channel, callback) {
        const wrappedCallback = (...args) => {
            // Remove IpcRendererEvent and pass only remaining arguments  
            const [, ...rest] = args; // Skip first arg (IpcRendererEvent)
            callback(...rest);
        };
        if (!listeners.has(channel)) {
            listeners.set(channel, new Set());
        }
        listeners.get(channel).add(callback);
        electron_1.ipcRenderer.on(channel, wrappedCallback);
        callback.__wrapped = wrappedCallback;
    },
    // Remove listener
    off(channel, callback) {
        const wrappedCallback = callback.__wrapped;
        if (wrappedCallback) {
            electron_1.ipcRenderer.removeListener(channel, wrappedCallback);
        }
        listeners.get(channel)?.delete(callback);
    },
    // Remove all listeners for a channel
    removeAllListeners(channel) {
        electron_1.ipcRenderer.removeAllListeners(channel);
        listeners.delete(channel);
    },
    // Send message to main process (fire and forget)
    send(channel, ...args) {
        electron_1.ipcRenderer.send(channel, ...args);
    },
    // Send message and wait for response
    invoke(channel, ...args) {
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    // Send sync message (blocking - use sparingly)
    sendSync(channel, ...args) {
        return electron_1.ipcRenderer.sendSync(channel, ...args);
    }
});
//# sourceMappingURL=preload.js.map
```

## File: dist-electron/preload.js.map
```
{"version":3,"file":"preload.js","sourceRoot":"","sources":["../electron/preload.ts"],"names":[],"mappings":";;AAAA,uCAAqD;AAErD,gEAAgE;AAChE,sBAAW,CAAC,eAAe,CAAC,EAAE,CAAC,CAAA;AAE/B,8BAA8B;AAC9B,MAAM,SAAS,GAAG,IAAI,GAAG,EAA6C,CAAA;AAEtE,qCAAqC;AACrC,wBAAa,CAAC,iBAAiB,CAAC,aAAa,EAAE;IAC3C,qCAAqC;IACrC,EAAE,CAAC,OAAe,EAAE,QAAsC;QACtD,MAAM,eAAe,GAAG,CAAC,GAAG,IAAe,EAAE,EAAE;YAC3C,8DAA8D;YAC9D,MAAM,CAAC,EAAE,GAAG,IAAI,CAAC,GAAG,IAAI,CAAC,CAAC,oCAAoC;YAC9D,QAAQ,CAAC,GAAG,IAAI,CAAC,CAAC;QACtB,CAAC,CAAC;QAEF,IAAI,CAAC,SAAS,CAAC,GAAG,CAAC,OAAO,CAAC,EAAE,CAAC;YAC1B,SAAS,CAAC,GAAG,CAAC,OAAO,EAAE,IAAI,GAAG,EAAE,CAAC,CAAA;QACrC,CAAC;QACD,SAAS,CAAC,GAAG,CAAC,OAAO,CAAE,CAAC,GAAG,CAAC,QAAQ,CAAC,CAAA;QAErC,sBAAW,CAAC,EAAE,CAAC,OAAO,EAAE,eAAe,CAAC,CAGnC;QAAE,QAAyD,CAAC,SAAS,GAAG,eAAe,CAAA;IAChG,CAAC;IAED,kBAAkB;IAClB,GAAG,CAAC,OAAe,EAAE,QAAsC;QACvD,MAAM,eAAe,GAAI,QAAyD,CAAC,SAAS,CAAA;QAC5F,IAAI,eAAe,EAAE,CAAC;YAClB,sBAAW,CAAC,cAAc,CAAC,OAAO,EAAE,eAAe,CAAC,CAAA;QACxD,CAAC;QACD,SAAS,CAAC,GAAG,CAAC,OAAO,CAAC,EAAE,MAAM,CAAC,QAAQ,CAAC,CAAA;IAC5C,CAAC;IAED,qCAAqC;IACrC,kBAAkB,CAAC,OAAe;QAC9B,sBAAW,CAAC,kBAAkB,CAAC,OAAO,CAAC,CAAA;QACvC,SAAS,CAAC,MAAM,CAAC,OAAO,CAAC,CAAA;IAC7B,CAAC;IAED,iDAAiD;IACjD,IAAI,CAAC,OAAe,EAAE,GAAG,IAAe;QACpC,sBAAW,CAAC,IAAI,CAAC,OAAO,EAAE,GAAG,IAAI,CAAC,CAAA;IACtC,CAAC;IAED,qCAAqC;IACrC,MAAM,CAAC,OAAe,EAAE,GAAG,IAAe;QACtC,OAAO,sBAAW,CAAC,MAAM,CAAC,OAAO,EAAE,GAAG,IAAI,CAAC,CAAA;IAC/C,CAAC;IAED,+CAA+C;IAC/C,QAAQ,CAAC,OAAe,EAAE,GAAG,IAAe;QACxC,OAAO,sBAAW,CAAC,QAAQ,CAAC,OAAO,EAAE,GAAG,IAAI,CAAC,CAAA;IACjD,CAAC;CACJ,CAAC,CAAA"}
```

## File: dist_electron/builder-debug.yml
```
x64:
  firstOrDefaultFilePatterns:
    - '!**/node_modules/**'
    - '!build{,/**/*}'
    - '!dist_electron{,/**/*}'
    - dist/**/*
    - dist-electron/**/*
    - package.json
    - '!**/*.{iml,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,suo,xproj,cc,d.ts,mk,a,o,obj,forge-meta,pdb}'
    - '!**/._*'
    - '!**/electron-builder.{yaml,yml,json,json5,toml,ts}'
    - '!**/{.git,.hg,.svn,CVS,RCS,SCCS,__pycache__,.DS_Store,thumbs.db,.gitignore,.gitkeep,.gitattributes,.npmignore,.idea,.vs,.flowconfig,.jshintrc,.eslintrc,.circleci,.yarn-integrity,.yarn-metadata.json,yarn-error.log,yarn.lock,package-lock.json,npm-debug.log,pnpm-lock.yaml,bun.lock,bun.lockb,appveyor.yml,.travis.yml,circle.yml,.nyc_output,.husky,.github,electron-builder.env}'
    - '!.yarn{,/**/*}'
    - '!.editorconfig'
    - '!.yarnrc.yml'
  nodeModuleFilePatterns:
    - '**/*'
    - dist/**/*
    - dist-electron/**/*
    - package.json

```

## File: dist_electron/builder-effective-config.yaml
```
directories:
  output: dist_electron
  buildResources: build
appId: com.minty.app
productName: Minty
copyright: Copyright © 2026
files:
  - filter:
      - dist/**/*
      - dist-electron/**/*
      - package.json
linux:
  target:
    - AppImage
    - deb
  maintainer: Minty Authors <contact@minty.app>
  category: TerminalEmulator
  icon: build/icons
  executableName: minty
win:
  target:
    - nsis
  icon: build/icon.ico
  executableName: minty
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  artifactName: ${productName}-Setup-${version}.${ext}
mac:
  target:
    - dmg
  icon: build/icon.icns
electronVersion: 39.2.7

```

## File: electron/main.ts
```
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
            win.loadURL('http://localhost:5173');
            console.log('Loading from localhost:5173 (fallback)');
        } else {
            win.loadFile(path.join(process.env.DIST || '', 'index.html'))
        }
    }
}

// IPC Handlers for window controls
ipcMain.on('toggle-devtools', () => {
    if (win?.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
    } else {
        win?.webContents.openDevTools();
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

```

## File: electron/preload.ts
```
import { contextBridge, ipcRenderer } from 'electron'

// Increase max listeners to prevent warnings with multiple tabs
ipcRenderer.setMaxListeners(50)

// Store listeners for cleanup
const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

// Expose IPC API to renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
    // Listen to events from main process
    on(channel: string, callback: (...args: unknown[]) => void) {
        const wrappedCallback = (...args: unknown[]) => {
            // Remove IpcRendererEvent and pass only remaining arguments  
            const [, ...rest] = args; // Skip first arg (IpcRendererEvent)
            callback(...rest);
        };

        if (!listeners.has(channel)) {
            listeners.set(channel, new Set())
        }
        listeners.get(channel)!.add(callback)

        ipcRenderer.on(channel, wrappedCallback)

            // Store the wrapped callback for removal
            ; (callback as { __wrapped?: (...args: unknown[]) => void }).__wrapped = wrappedCallback
    },

    // Remove listener
    off(channel: string, callback: (...args: unknown[]) => void) {
        const wrappedCallback = (callback as { __wrapped?: (...args: unknown[]) => void }).__wrapped
        if (wrappedCallback) {
            ipcRenderer.removeListener(channel, wrappedCallback)
        }
        listeners.get(channel)?.delete(callback)
    },

    // Remove all listeners for a channel
    removeAllListeners(channel: string) {
        ipcRenderer.removeAllListeners(channel)
        listeners.delete(channel)
    },

    // Send message to main process (fire and forget)
    send(channel: string, ...args: unknown[]) {
        ipcRenderer.send(channel, ...args)
    },

    // Send message and wait for response
    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
        return ipcRenderer.invoke(channel, ...args)
    },

    // Send sync message (blocking - use sparingly)
    sendSync(channel: string, ...args: unknown[]): unknown {
        return ipcRenderer.sendSync(channel, ...args)
    }
})

```

## File: public/placeholder.svg
```
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" fill="none"><rect width="1200" height="1200" fill="#EAEAEA" rx="3"/><g opacity=".5"><g opacity=".5"><path fill="#FAFAFA" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/></g><path stroke="url(#a)" stroke-width="2.418" d="M0-1.209h553.581" transform="scale(1 -1) rotate(45 1163.11 91.165)"/><path stroke="url(#b)" stroke-width="2.418" d="M404.846 598.671h391.726"/><path stroke="url(#c)" stroke-width="2.418" d="M599.5 795.742V404.017"/><path stroke="url(#d)" stroke-width="2.418" d="m795.717 796.597-391.441-391.44"/><path fill="#fff" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/><g clip-path="url(#e)"><path fill="#666" fill-rule="evenodd" d="M616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181V586.58Zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181-.071.072Zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146.146.147Z" clip-rule="evenodd"/></g><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/></g><defs><linearGradient id="a" x1="554.061" x2="-.48" y1=".083" y2=".087" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="796.912" x2="404.507" y1="599.963" y2="599.965" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="c" x1="600.792" x2="600.794" y1="403.677" y2="796.082" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="d" x1="404.85" x2="796.972" y1="403.903" y2="796.02" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><clipPath id="e"><path fill="#fff" d="M581.364 580.535h38.689v38.689h-38.689z"/></clipPath></defs></svg>
```

## File: public/robots.txt
```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

```

## File: public/splash.html
```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minty</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000000;
            color: #ffffff;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            user-select: none;
        }

        .container {
            text-align: center;
            opacity: 0;
            animation: fadeIn 0.5s ease-in forwards;
        }

        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite ease-in-out;
        }

        .title {
            font-size: 24px;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 14px;
            color: #888;
        }

        .loading-bar {
            width: 200px;
            height: 2px;
            background: #333;
            margin-top: 30px;
            position: relative;
            overflow: hidden;
            border-radius: 2px;
        }

        .loading-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0%;
            background: #ffffff;
            animation: load 2.5s ease-in-out forwards;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.8;
            }

            50% {
                transform: scale(1.05);
                opacity: 1;
            }

            100% {
                transform: scale(1);
                opacity: 0.8;
            }
        }

        @keyframes load {
            0% {
                width: 0%;
            }

            50% {
                width: 70%;
            }

            100% {
                width: 100%;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <img src="./logo.png" alt="Logo" class="logo">
        <div class="title">MINTY</div>
        <div class="subtitle">AI-Powered Development Environment</div>
        <div class="loading-bar">
            <div class="loading-progress"></div>
        </div>
    </div>
</body>

</html>
```

## File: src/App.css
```
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```

## File: src/App.tsx
```
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

```

## File: src/index.css
```
@import "tailwindcss";

@plugin "tailwindcss-animate";

.app-region-drag {
  -webkit-app-region: drag;
}

.app-region-no-drag {
  -webkit-app-region: no-drag;
}

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-terminal-green: hsl(var(--terminal-green));
  --color-terminal-cyan: hsl(var(--terminal-cyan));
  --color-terminal-amber: hsl(var(--terminal-amber));
  --color-terminal-purple: hsl(var(--terminal-purple));
  --color-terminal-red: hsl(var(--terminal-red));

  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-pulse-glow: pulse-glow 2s ease-in-out infinite;

  @keyframes accordion-down {
    from {
      height: 0;
    }

    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }

    to {
      height: 0;
    }
  }

  @keyframes pulse-glow {

    0%,
    100% {
      box-shadow: 0 0 20px hsl(175 80% 50% / 0.4);
    }

    50% {
      box-shadow: 0 0 40px hsl(175 80% 50% / 0.6);
    }
  }
}

@layer base {
  :root {
    --background: 220 20% 4%;
    --foreground: 210 40% 96%;

    --card: 220 20% 7%;
    --card-foreground: 210 40% 96%;

    --popover: 220 20% 7%;
    --popover-foreground: 210 40% 96%;

    --primary: 175 80% 50%;
    --primary-foreground: 220 20% 4%;

    --secondary: 220 20% 12%;
    --secondary-foreground: 210 40% 96%;

    --muted: 220 15% 15%;
    --muted-foreground: 215 20% 55%;

    --accent: 175 80% 50%;
    --accent-foreground: 220 20% 4%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;

    --border: 220 15% 18%;
    --input: 220 15% 18%;
    --ring: 175 80% 50%;

    --radius: 0.5rem;

    --terminal-green: 142 70% 55%;
    --terminal-cyan: 175 80% 50%;
    --terminal-amber: 38 92% 50%;
    --terminal-purple: 280 70% 60%;
    --terminal-red: 0 75% 60%;

    --glow-cyan: 0 0 20px hsl(175 80% 50% / 0.4);
    --glow-cyan-strong: 0 0 40px hsl(175 80% 50% / 0.6);

    --sidebar-background: 220 20% 4%;
    --sidebar-foreground: 210 40% 96%;
    --sidebar-primary: 175 80% 50%;
    --sidebar-primary-foreground: 220 20% 4%;
    --sidebar-accent: 220 20% 12%;
    --sidebar-accent-foreground: 210 40% 96%;
    --sidebar-border: 220 15% 18%;
    --sidebar-ring: 175 80% 50%;
  }

  .dark {
    --background: 220 20% 4%;
    --foreground: 210 40% 96%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }

  code,
  pre,
  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--secondary));
  border-radius: var(--radius);
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--terminal-green) / 0.5);
  border-radius: var(--radius);
  border: 2px solid hsl(var(--secondary));
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--terminal-green));
}

@layer components {
  .terminal-window {
    @apply bg-card rounded-lg border border-border overflow-hidden;
    box-shadow: var(--glow-cyan);
  }

  .terminal-header {
    @apply flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border;
  }

  .terminal-dot {
    @apply w-3 h-3 rounded-full;
  }

  .terminal-body {
    @apply p-4 font-mono text-sm leading-relaxed;
  }

  .glow-text {
    text-shadow: var(--glow-cyan);
  }

  .glow-border {
    box-shadow: var(--glow-cyan);
  }

  .glow-border-strong {
    box-shadow: var(--glow-cyan-strong);
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary via-[hsl(var(--terminal-green))] to-primary bg-clip-text text-transparent;
  }

  .command-line::before {
    content: '$ ';
    @apply text-primary;
  }

  .cursor-blink {
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  .fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .typing-animation {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 2s steps(40, end);
  }

  @keyframes typing {
    from {
      width: 0;
    }

    to {
      width: 100%;
    }
  }
}

@layer utilities {
  .text-terminal-green {
    color: hsl(var(--terminal-green));
  }

  .text-terminal-cyan {
    color: hsl(var(--terminal-cyan));
  }

  .text-terminal-amber {
    color: hsl(var(--terminal-amber));
  }

  .text-terminal-purple {
    color: hsl(var(--terminal-purple));
  }

  .text-terminal-red {
    color: hsl(var(--terminal-red));
  }

  .bg-grid-pattern {
    background-image:
      linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
    background-size: 40px 40px;
  }
}
```

## File: src/main.tsx
```
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

```

## File: src/vite-env.d.ts
```
/// <reference types="vite/client" />

interface CommandResult {
    success: boolean;
    output: string;
    error: string;
    cwd: string;
    exitCode?: number;
}

interface Window {
    ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, callback: (...args: unknown[]) => void) => void;
        off: (channel: string, callback: (...args: unknown[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        invoke: (channel: string, ...args: unknown[]) => Promise<string | unknown>;
        sendSync: (channel: string, ...args: unknown[]) => unknown;
    };
}

```

## File: src-original-backup/App.css
```
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```

## File: src-original-backup/App.tsx
```
import React from 'react';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';

function App() {
  const [activeModal, setActiveModal] = React.useState<string | null>(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'chat':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="+1234567890" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea placeholder="Hello! I'm interested in..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-24" />
            </div>
            <button className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
              Generate Link
            </button>
          </div>
        );
      case 'auto-reply':
        return (
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">Configure automated responses for incoming messages.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Welcome Message</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full text-blue-600 font-medium text-sm hover:underline mt-2">
              + Add New Rule
            </button>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-6">
            <div className="inline-block p-4 rounded-full bg-purple-50 mb-4">
              <span className="text-4xl">📈</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">No Data Yet</h4>
            <p className="text-gray-500 mt-2 text-sm">Start sharing your links to see engagement metrics here.</p>
            <button className="mt-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors">
              Refresh Data
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'chat': return 'Create Click to Chat Link';
      case 'auto-reply': return 'Automated Replies';
      case 'analytics': return 'Button Analytics';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 pointer-events-auto select-none">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">WhatsApp Button Features</h2>
          <p className="text-gray-500 mt-2">Manage your WhatsApp integration settings and buttons here.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Cards */}
          <div
            onClick={() => setActiveModal('chat')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-green-200 group"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600 text-2xl group-hover:scale-110 transition-transform">
              📱
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">Click to Chat</h3>
            <p className="text-sm text-gray-600">Create direct links for users to message you on WhatsApp.</p>
          </div>

          <div
            onClick={() => setActiveModal('auto-reply')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-blue-200 group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 text-2xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">Automated Replies</h3>
            <p className="text-sm text-gray-600">Set up quick replies for common customer inquiries.</p>
          </div>

          <div
            onClick={() => setActiveModal('analytics')}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-6 border border-gray-100 hover:border-purple-200 group"
          >
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600 text-2xl group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors">Analytics</h3>
            <p className="text-sm text-gray-600">Track clicks and engagement on your WhatsApp buttons.</p>
          </div>
        </div>
      </main>

      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default App;

```

## File: src-original-backup/Index_backup.tsx
```
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { InstallSection } from "@/components/InstallSection";
import { CommandsSection } from "@/components/CommandsSection";
import { Footer } from "@/components/Footer";
import { ToolsSidebar } from "@/components/ToolsSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToolsSidebar />
      <div className="pl-14">
        <HeroSection />
        <FeaturesSection />
        <InstallSection />
        <CommandsSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;

```

## File: src-original-backup/index.css
```
@import "tailwindcss";

html,
body,
#root {
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
  /* Prevent body scroll, use inner containers */
}
```

## File: src-original-backup/main.tsx
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## File: cli/bin/minty.js
```
#!/usr/bin/env node

import('../src/index.js');

```

## File: cli/src/index.js
```
import {Command} from 'commander';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import glob from 'fast-glob';

const program = new Command();

program
    .name('minty')
    .description('Minty CLI tool for codebase indexing')
    .version('0.1.0');

// Simple heuristic to check if file is binary
async function isBinaryFile(filepath) {
    try {
        const handle = await fs.open(filepath, 'r');
        const buffer = Buffer.alloc(4096);
        const {bytesRead} = await handle.read(buffer, 0, 4096, 0);
        await handle.close();

        // Check for null bytes
        for (let i = 0; i < bytesRead; i++) {
            if (buffer[i] === 0) {
                return true;
            }
        }
        return false;
    } catch (error) {
        return false; // dynamic files or access errors
    }
}

program
    .command('index')
    .description('Index the current directory')
    .argument('[directory]', 'Directory to index', '.')
    .option('--full', 'Include full file content in .minty file', true) // Default true for agents
    .action(async (directory, options) => {
        try {
            const targetDir = path.resolve(process.cwd(), directory);
            console.log(chalk.blue(`Indexing directory: ${targetDir}`));

            try {
                const stats = await fs.stat(targetDir);
                if (!stats.isDirectory()) {
                    console.error(chalk.red('Error: Target path is not a directory'));
                    process.exit(1);
                }
            } catch (err) {
                console.error(chalk.red(`Error: Directory not found: ${targetDir}`));
                process.exit(1);
            }

            const mintyFilePath = path.join(targetDir, '.minty');
            const markdownFilePath = path.join(targetDir, 'codebase.md');

            let projectId = crypto.randomUUID();
            try {
                const existingContent = await fs.readFile(mintyFilePath, 'utf-8');
                const existingConfig = JSON.parse(existingContent);
                if (existingConfig.projectId) {
                    projectId = existingConfig.projectId;
                }
            } catch (e) {
                // Ignore
            }

            console.log(chalk.gray('Scanning files...'));
            // Using fast-glob which respects .gitignore if we configure it, or we manually check
            // fast-glob doesn't automatically read .gitignore, we'd need another lib or manual config.
            // For now, let's use standard exclude patterns.
            const filePaths = await glob('**/*', {
                cwd: targetDir,
                ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.minty', '**/codebase.md', '**/package-lock.json', '**/yarn.lock'],
                dot: true,
                onlyFiles: true
            });

            console.log(chalk.green(`Found ${filePaths.length} files. Processing content...`));

            const processedFiles = [];
            let totalTokens = 0;
            let codebaseMarkdown = `# Codebase Dump\n\n`;

            for (const filePath of filePaths) {
                const fullPath = path.join(targetDir, filePath);
                const stats = await fs.stat(fullPath);

                // Skip large files (> 1MB)
                if (stats.size > 1024 * 1024) {
                    console.log(chalk.yellow(`Skipping large file: ${filePath}`));
                    continue;
                }

                if (await isBinaryFile(fullPath)) {
                    console.log(chalk.yellow(`Skipping binary file: ${filePath}`));
                    continue;
                }

                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const tokens = Math.ceil(content.length / 4); // Rough estimation
                    totalTokens += tokens;

                    processedFiles.push({
                        path: filePath,
                        size: stats.size,
                        tokens: tokens,
                        lastModified: stats.mtime.toISOString(),
                        content: content
                    });

                    // Append to markdown
                    codebaseMarkdown += `## File: ${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;

                } catch (readErr) {
                    console.error(chalk.red(`Failed to read ${filePath}: ${readErr.message}`));
                }
            }

            const config = {
                version: '1.1.0',
                lastScanned: new Date().toISOString(),
                projectId: projectId,
                totalFiles: processedFiles.length,
                totalTokens: totalTokens,
                files: processedFiles
            };

            // Write .minty (JSON)
            await fs.writeFile(mintyFilePath, JSON.stringify(config, null, 2));

            // Write codebase.md (Markdown for LLM)
            await fs.writeFile(markdownFilePath, codebaseMarkdown);

            console.log(chalk.green('Indexing complete!'));
            console.log(chalk.white(`- .minty (JSON Data): ${mintyFilePath}`));
            console.log(chalk.white(`- codebase.md (LLM Context): ${markdownFilePath}`));
            console.log(chalk.cyan(`Total Tokens (Est): ${totalTokens}`));

        } catch (error) {
            console.error(chalk.red('Error indexing directory:'), error.message);
            process.exit(1);
        }
    });

program.parse();

```

## File: dist_electron/linux-unpacked/LICENSE.electron.txt
```
Copyright (c) Electron contributors
Copyright (c) 2013-2020 GitHub Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

```

## File: dist_electron/linux-unpacked/vk_swiftshader_icd.json
```
{"file_format_version": "1.0.0", "ICD": {"library_path": "./libvk_swiftshader.so", "api_version": "1.0.5"}}
```

## File: src/components/CodeBlock.tsx
```
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock = ({ code, language = "bash", title }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-card border border-border overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
          <span className="text-sm text-muted-foreground font-mono">{title}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}
      <div className="relative group">
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-foreground">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? <Check className="w-4 h-4 text-terminal-green" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

```

## File: src/components/CommandsSection.tsx
```
import { ChevronRight } from "lucide-react";

const commands = [
  {
    name: "init",
    description: "Initialize a new project with AI-ready configuration",
    usage: "lovable init <project-name> [--template <template>]",
    flags: ["--template, -t", "--force, -f", "--git"],
  },
  {
    name: "generate",
    description: "Generate code using AI based on natural language",
    usage: "lovable generate <type> <name> [options]",
    flags: ["--with-tests", "--with-docs", "--dry-run"],
  },
  {
    name: "refactor",
    description: "Intelligently refactor existing code",
    usage: "lovable refactor <file|directory> [options]",
    flags: ["--aggressive", "--preserve-comments", "--interactive"],
  },
  {
    name: "chat",
    description: "Start an interactive AI chat session",
    usage: 'lovable chat [message]',
    flags: ["--model", "--context", "--save"],
  },
  {
    name: "deploy",
    description: "Deploy your project to the cloud",
    usage: "lovable deploy [options]",
    flags: ["--preview", "--production", "--provider"],
  },
  {
    name: "analyze",
    description: "Analyze code for improvements and issues",
    usage: "lovable analyze [path]",
    flags: ["--security", "--performance", "--accessibility"],
  },
];

export const CommandsSection = () => {
  return (
    <section id="commands" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Command </span>
            <span className="gradient-text">Reference</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive documentation for all available commands.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {commands.map((cmd, index) => (
            <div
              key={cmd.name}
              className="group p-5 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <code className="text-lg font-mono font-semibold text-primary">
                      lovable {cmd.name}
                    </code>
                  </div>
                  <p className="text-muted-foreground mb-3">{cmd.description}</p>
                  <code className="block px-3 py-2 rounded bg-secondary text-sm font-mono text-foreground mb-3">
                    {cmd.usage}
                  </code>
                  <div className="flex flex-wrap gap-2">
                    {cmd.flags.map((flag) => (
                      <span
                        key={flag}
                        className="px-2 py-1 rounded bg-secondary/50 text-xs font-mono text-muted-foreground"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

```

## File: src/components/ErrorBoundary.tsx
```
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// For functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
```

## File: src/components/FeatureCard.tsx
```
import { type LucideIcon } from "lucide-react";


interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  command?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  command,
}: FeatureCardProps) => {
  return (
    <div className="group relative p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:glow-border">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            {description}
          </p>
          {command && (
            <code className="inline-block px-3 py-1.5 rounded bg-secondary text-primary text-xs font-mono">
              {command}
            </code>
          )}
        </div>
      </div>
    </div>
  );
};

```

## File: src/components/FeaturesSection.tsx
```
import { FeatureCard } from "./FeatureCard";
import {
  Wand2,
  GitBranch,
  Rocket,
  Shield,
  Layers,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Code Generation",
    description: "Generate components, functions, and entire features using natural language prompts powered by advanced AI models.",
    command: "minty generate",
  },
  {
    icon: GitBranch,
    title: "Smart Refactoring",
    description: "Intelligently refactor and optimize your codebase while maintaining functionality and improving performance.",
    command: "minty refactor",
  },
  {
    icon: Rocket,
    title: "Instant Deploy",
    description: "Deploy your projects with a single command. Get instant preview URLs and production deployments.",
    command: "minty deploy",
  },
  {
    icon: Shield,
    title: "Type Safety",
    description: "Generate type-safe code with full TypeScript support. Automatic type inference and validation.",
    command: "minty types",
  },
  {
    icon: Layers,
    title: "Project Templates",
    description: "Scaffold new projects from curated templates optimized for AI-assisted development workflows.",
    command: "minty init",
  },
  {
    icon: MessageSquare,
    title: "Interactive Mode",
    description: "Chat with AI agents directly in your terminal. Get suggestions, explanations, and code reviews.",
    command: "minty chat",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Powerful </span>
            <span className="gradient-text">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to supercharge your development workflow with AI-powered automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

```

## File: src/components/Footer.tsx
```
import { Github, Twitter, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <img src="/logo.png" alt="Minty Logo" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-mono font-bold text-primary">
              Minty
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Changelog
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contributing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 Minty Team. Built with ❤️ for AI agents.</p>
        </div>
      </div>
    </footer>
  );
};

```

## File: src/components/HeroSection.tsx
```
import { Terminal } from "./Terminal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Command } from "lucide-react";

const terminalLines = [
  { type: "command" as const, content: "npx minty init my-project", delay: 800 },
  { type: "output" as const, content: "✓ Creating project structure...", delay: 400 },
  { type: "output" as const, content: "✓ Initializing AI agent context...", delay: 400 },
  { type: "output" as const, content: "✓ Setting up development environment...", delay: 400 },
  { type: "command" as const, content: "minty generate component Button", delay: 600 },
  { type: "output" as const, content: "✓ Generated src/components/Button.tsx", delay: 300 },
  { type: "output" as const, content: "✓ Added tests and documentation", delay: 300 },
  { type: "command" as const, content: "minty deploy --preview", delay: 500 },
  { type: "output" as const, content: "✓ Preview deployed at https://preview.minty.dev/abc123", delay: 400 },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terminal-purple/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Built for AI coding agents</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text glow-text text-primary">Minty</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              The command-line interface for AI-powered development. Generate, refactor, and deploy code with intelligent agents.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border group">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:border-primary/50">
                <Command className="w-4 h-4 mr-2" />
                View Commands
              </Button>
            </div>

            {/* Quick install */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <code className="font-mono text-sm">
                <span className="text-primary">$</span>{" "}
                <span className="text-foreground">npm install -g @minty/cli</span>
              </code>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Terminal lines={terminalLines} className="animate-pulse-glow" />
          </div>
        </div>
      </div>
    </section>
  );
};

```

## File: src/components/InstallSection.tsx
```
import { CodeBlock } from "./CodeBlock";
import { Terminal, Package, Settings } from "lucide-react";

const installCode = `# Install globally with npm
npm install -g @lovable/cli

# Or use npx directly
npx @lovable/cli init my-project

# Verify installation
lovable --version`;

const configCode = `# lovable.config.json
{
  "project": "my-awesome-app",
  "ai": {
    "model": "gpt-4",
    "temperature": 0.7
  },
  "deploy": {
    "provider": "vercel",
    "branch": "main"
  }
}`;

const usageCode = `# Initialize a new project
lovable init my-project --template react-ts

# Generate a component
lovable generate component UserProfile --with-tests

# Start interactive chat
lovable chat "Help me optimize this function"

# Deploy to preview
lovable deploy --preview`;

export const InstallSection = () => {
  return (
    <section id="install" className="py-24 bg-secondary/20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Quick </span>
            <span className="gradient-text">Start</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get up and running in seconds. Install the CLI and start building with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Install */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">1. Install</h3>
            </div>
            <CodeBlock code={installCode} title="terminal" />
          </div>

          {/* Configure */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">2. Configure</h3>
            </div>
            <CodeBlock code={configCode} language="json" title="lovable.config.json" />
          </div>

          {/* Use */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-primary/10">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">3. Build</h3>
            </div>
            <CodeBlock code={usageCode} title="terminal" />
          </div>
        </div>
      </div>
    </section>
  );
};

```

## File: src/components/NavLink.tsx
```
import { NavLink as RouterNavLink, type NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

```

## File: src/components/Navbar.tsx
```
import { Github, Book, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <img src="/logo.png" alt="Minty Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-mono font-bold text-lg text-primary">
              Minty
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#install" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Install
            </a>
            <a href="#commands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Commands
            </a>
            <Link to="/terminal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terminal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Book className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border" asChild>
              <Link to="/terminal">
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

```

## File: src/components/Terminal.tsx
```
import { useState, useEffect } from "react";

interface TerminalLine {
  type: "command" | "output" | "comment";
  content: string;
  delay?: number;
}

interface TerminalProps {
  lines: TerminalLine[];
  className?: string;
}

export const Terminal = ({ lines, className = "" }: TerminalProps) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const delay = lines[visibleLines]?.delay || 500;
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, lines]);

  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-terminal-red" />
        <div className="terminal-dot bg-terminal-amber" />
        <div className="terminal-dot bg-terminal-green" />
        <span className="ml-3 text-muted-foreground text-sm font-mono">
          lovable-cli
        </span>
      </div>
      <div className="terminal-body min-h-[200px]">
        {lines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className="mb-1">
            {line.type === "command" && (
              <span className="command-line text-foreground">{line.content}</span>
            )}
            {line.type === "output" && (
              <span className="text-terminal-green">{line.content}</span>
            )}
            {line.type === "comment" && (
              <span className="text-muted-foreground">{line.content}</span>
            )}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block w-2 h-4 bg-primary cursor-blink" />
        )}
      </div>
    </div>
  );
};

```

## File: src/components/ToolModal.tsx
```
import { useState } from "react";
import { Send, Copy, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { enhancePrompt } from "@/lib/agentTools";

interface ToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: {
    id: string;
    label: string;
    placeholder: string;
    description: string;
    icon: React.ElementType;
  };
}

export const ToolModal = ({ open, onOpenChange, tool }: ToolModalProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!tool) return null;

  const Icon = tool.icon;



  // ... inside ToolModal component

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      if (tool.id === 'enhance') {
        const cwd = await window.ipcRenderer.invoke('get-cwd', 'active-tab-id-placeholder') as string; // Ideally we pass the actual tab ID or just get active. 
        // Since accessing tab ID might be complex here without prop drilling, let's assume we want project root or let main process default to simple CWD.
        // Actually, `get-cwd` needs a tabId. 
        // Let's rely on a new or existing method to get "current project root" or similar if possible. 
        // For now, let's try to get Home dir or let user specify? Use '.' for current working directory of the app?
        // Wait, the user wants context of the *codebase*.
        // Let's assume the user has opened the project in the terminal.
        // We can fetch the active tab from a store if we had access, but `ToolModal` is isolated.
        // Let's try to pass `.` (current directory of the process) which might be the project root in dev.

        // BETTER: We can just ask the main process for the "last active directory" or "default cwd".
        // Let's use `.` for now as it maps to where the app was started (usually project root) or handle it in main.

        const enhanced = await enhancePrompt(input, '.');
        setOutput(enhanced);

        toast({
          title: "Prompt Enhanced",
          description: "Your prompt has been enriched with codebase context.",
        });
      } else {
        // Simulate processing for other tools
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOutput(`[${tool.label}] Processed output:\n\n${input}\n\n---\nGenerated with lovable-cli v1.0.0`);

        toast({
          title: "Processing complete",
          description: `${tool.label} has finished processing your input.`,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "Output has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {tool.label}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">
              Input
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.placeholder}
              className="min-h-[150px] font-mono text-sm bg-background border-border resize-none focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Process
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {output && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-sm font-mono text-muted-foreground">
                  Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border font-mono text-sm whitespace-pre-wrap text-foreground max-h-[300px] overflow-y-auto custom-scrollbar">
                {output}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

```

## File: src/components/ToolsSidebar.tsx
```
import { useState } from "react";
import { Sparkles, Bug, Terminal, Bot, GitBranch, Settings, Wrench, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolModal } from "./ToolModal";

export type ToolType = "enhance" | "bug" | "debugger" | "codereview" | "system" | "taskflow" | "settings";

interface Tool {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  placeholder: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: "enhance",
    icon: Sparkles,
    label: "Enhance Prompt",
    placeholder: "Paste your prompt here to enhance it with better context, clarity, and specificity...",
    description: "Transform vague prompts into detailed, actionable instructions"
  },
  {
    id: "bug",
    icon: Bug,
    label: "Bug Reports",
    placeholder: "Describe the bug you encountered:\n\n1. Expected behavior:\n2. Actual behavior:\n3. Steps to reproduce:\n4. Environment details:",
    description: "Generate structured bug reports from descriptions"
  },
  {
    id: "debugger",
    icon: Terminal,
    label: "Debugger",
    placeholder: "Paste your error message, stack trace, or problematic code here...",
    description: "Analyze errors and suggest fixes"
  },
  {
    id: "codereview",
    icon: Code,
    label: "Code Review",
    placeholder: "Paste your code here for review:\n\n- Code quality assessment\n- Performance suggestions\n- Security vulnerabilities\n- Best practices recommendations",
    description: "Get comprehensive code reviews and improvement suggestions"
  },
  {
    id: "system",
    icon: Bot,
    label: "System Assist",
    placeholder: "Describe system prompt or assistant behavior you want to create...",
    description: "Generate optimized system prompts for AI agents"
  },
  {
    id: "taskflow",
    icon: GitBranch,
    label: "Taskflow",
    placeholder: "Describe the feature flow:\n\n- User story:\n- Acceptance criteria:\n- Technical requirements:",
    description: "Break down features into structured task flows"
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    placeholder: "Configure your CLI preferences and API settings...",
    description: "Customize your lovable-cli experience"
  }
];

export const ToolsSidebar = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <>
      <aside className="fixed left-0 top-8 bottom-0 w-14 border-r border-border bg-background/50 backdrop-blur-sm z-40 flex flex-col items-center py-4 gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className="mb-4 hover:scale-110 transition-transform duration-200 cursor-pointer">
            <img src="./logo.png" alt="Minty Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="p-2 mb-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="w-8 h-px bg-border mb-2" />
        </div>

        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Tooltip key={tool.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 transition-all duration-200 ${isActive
                    ? "bg-primary/20 text-primary glow-border"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-border">
                <p className="font-mono text-xs">{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </aside>

      <ToolModal
        open={!!activeTool}
        onOpenChange={(open) => !open && setActiveTool(null)}
        tool={activeToolData}
      />
    </>
  );
};

```

## File: src/components/WelcomePage.tsx
```

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { useTerminalStore } from "@/stores/terminalStore";

export const WelcomePage = () => {
    const addTab = useTerminalStore(state => state.addTab);
    const homeDir = useTerminalStore(state => state.homeDir);

    useEffect(() => {
        console.log("[WelcomePage] Mounted");
    }, []);

    const handleNewTerminal = () => {
        const id = window.crypto.randomUUID();
        addTab({
            id,
            title: 'home',
            cwd: homeDir,
            isReady: false,
            type: 'terminal'
        });
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full text-center space-y-8">

                {/* Hero Section */}
                <div className="space-y-4">
                    <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome to Minty
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your intelligent, agentic terminal workspace. Manage projects, execute commands, and track your codebase with AI-powered tools.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleNewTerminal}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <TerminalIcon className="w-5 h-5" />
                                New Terminal
                            </CardTitle>
                            <CardDescription>Open a standard terminal session</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group opacity-60">
                        {/* Placeholder for future functionality */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <FolderOpen className="w-5 h-5" />
                                Open Project
                            </CardTitle>
                            <CardDescription>Browse and open local projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <span className="text-sm text-muted-foreground">Coming Soon</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group opacity-60">
                        {/* Placeholder for future agent tools */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                <Sparkles className="w-5 h-5" />
                                Agent Tools
                            </CardTitle>
                            <CardDescription>Run automated codebase analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md group-hover:bg-primary/5 transition-colors">
                                <span className="text-sm text-muted-foreground">Explore Tools</span>
                            </div>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    );
};

```

## File: src/hooks/use-mobile.tsx
```
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

## File: src/hooks/use-toast.ts
```
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };

```

## File: src/hooks/useDirectorySync.ts
```
import { useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';

export const useDirectorySync = () => {
  const { tabs, updateTab, homeDir, isInitialized } = useTerminalStore();

  // Get directory name from path for tab title
  const getDirectoryName = useCallback((path: string, homePath: string): string => {
    if (path === homePath) return '~';
    if (path === '/') return 'root';
    return path.split('/').pop() || 'unknown';
  }, []);

  useEffect(() => {
    if (!isInitialized || tabs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all(tabs.map(async tab => {
          try {
            const currentCwd = (await window.ipcRenderer.invoke('get-cwd', tab.id)) as string;
            if (currentCwd !== tab.cwd) {
              const dirName = getDirectoryName(currentCwd, homeDir);
              updateTab(tab.id, { cwd: currentCwd, title: dirName });
            }
          } catch (error) {
            console.warn(`Failed to sync directory for tab ${tab.id}:`, error);
          }
        }));
      } catch (error) {
        console.error('Directory sync interval error:', error);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [tabs, isInitialized, updateTab, getDirectoryName, homeDir]);
};
```

## File: src/lib/agentTools.ts
```

// Agent Tools Library for Minty

interface MintyConfig {
    version: string;
    lastScanned: string;
    projectId?: string;
    // potentially add file hash or other metadata here
}

/**
 * Tracks the codebase by creating or updating a .minty file in the specified directory.
 * @param directoryPath The absolute path to the directory to track.
 * @returns Object containing success status and message.
 */
export const trackCodebase = async (directoryPath: string): Promise<{ success: boolean; message: string; path?: string }> => {
    try {
        // We need to use IPC to perform file system operations from the renderer
        // Assuming 'write-file' and 'read-file' or similar exist, or we invoke a specific handler.
        // For now, I will assume we can use the existing 'write-file' IPC or similar if available,
        // or arguably this logic should be in the main process and exposed via a specific IPC channel.

        // However, looking at the codebase, it seems we might need to rely on the main process to do the actual writing 
        // if 'fs' is not available directly in the renderer (which it shouldn't be).

        // Let's assume we invoke a command on the main process.
        // Since I don't see a generic 'write-file' exposed in `window.ipcRenderer`, 
        // I should probably implement the logic to CALL the main process, 
        // OR this file is meant to run IN the main process. 

        // Given the request "tool call for an agent that will read files... have .minty file created",
        // This looks like it should be callable from the frontend (where the agent might "live" conceptually in the UI)
        // or backend. 

        // Let's implement the logic to invoke the main process to write the file.
        // I will check main.ts to see what is exposed.

        // WAIT: I should check main.ts first to see what IPC handlers are available.
        // I'll proceed with writing a draft that uses a hypothetical 'agent-track-codebase' IPC, then I will update main.ts to support it if needed.
        // Actually, looking at the plan: "Design logic for agent tool...".

        // Let's write the renderer-side logic here.

        const config: MintyConfig = {
            version: '1.0.0',
            lastScanned: new Date().toISOString(),
            projectId: window.crypto.randomUUID()
        };

        const filePath = `${directoryPath}/.minty`;
        const content = JSON.stringify(config, null, 2);

        // Invoke main process to write file
        // We'll need to ensure main.ts handles 'write-file' or similar.
        // Checking previous tools: I haven't seen main.ts content yet fully.

        // I'll write this to use a new IPC channel 'create-minty-file'.

        const result = await window.ipcRenderer.invoke('create-minty-file', { path: filePath, content }) as { success: boolean; message: string; path?: string };
        return result;

    } catch (error) {
        console.error('Failed to track codebase:', error);
        return { success: false, message: `Error: ${error}` };
    }
};

/**
 * Enhances a prompt by indexing the codebase and retrieving context.
 * @param prompt The original user prompt.
 * @param directoryPath The directory to index and read context from.
 * @returns The enhanced prompt string or error message.
 */
export const enhancePrompt = async (prompt: string, directoryPath: string): Promise<string> => {
    try {
        // 1. Run Indexing
        // We'll rely on the main process to execute the CLI
        const indexResult = await window.ipcRenderer.invoke('run-minty-index', directoryPath) as { success: boolean; output?: string; error?: string };

        if (!indexResult.success) {
            console.error('Indexing failed:', indexResult.error);
            return `Failed to enhance prompt: Error indexing codebase. ${indexResult.error}`;
        }

        // 2. Read Context
        const contextResult = await window.ipcRenderer.invoke('read-codebase-context', directoryPath) as { success: boolean; content?: string; error?: string };

        if (!contextResult.success || !contextResult.content) {
            console.error('Reading context failed:', contextResult.error);
            return `Failed to enhance prompt: Could not read codebase context. ${contextResult.error}`;
        }

        // 3. Construct Enhanced Prompt
        // Simple strategy: Append context to the prompt
        // We might want to truncate context if it's too massive, but let's trust the CLI to have done some filtering or the user to handle it.
        // For better UX, we'll wrap it nicely.

        const enhancedPrompt = `${prompt}\n\n---\n\n### Codebase Context\n\nThe following is a context dump of the current codebase to assist in answering the request:\n\n${contextResult.content}`;

        return enhancedPrompt;

    } catch (error) {
        console.error('Enhance prompt error:', error);
        return `Error enhancing prompt: ${error}`;
    }
};

```

## File: src/lib/libraryStorage.ts
```
interface LibraryItem {
  id: string;
  name: string;
  description: string;
  type: 'commands' | 'templates' | 'workflows' | 'sessions';
  content: any;
  category: string;
  tags: string[];
  usage?: number;
  createdAt: string;
}

class LibraryStorage {
  private static readonly STORAGE_KEY = 'minty-library';

  static getAll(): LibraryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading library:', error);
      return [];
    }
  }

  static save(item: LibraryItem): void {
    try {
      const items = this.getAll();
      const existingIndex = items.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        items[existingIndex] = { ...item, usage: (items[existingIndex].usage || 0) + 1 };
      } else {
        items.push({ ...item, usage: 0 });
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving to library:', error);
    }
  }

  static delete(id: string): void {
    try {
      const items = this.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from library:', error);
    }
  }

  static search(query: string, category: string = 'All'): LibraryItem[] {
    const items = this.getAll();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => {
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      const matchesCategory = category === 'All' || item.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }

  static getCategories(): string[] {
    const items = this.getAll();
    return ['All', ...Array.from(new Set(items.map(item => item.category)))];
  }

  static getTypes(): string[] {
    const items = this.getAll();
    return ['All', ...Array.from(new Set(items.map(item => item.type)))];
  }
}

export { LibraryStorage, type LibraryItem };
```

## File: src/lib/ptyEventManager.ts
```
// Global PTY Event Manager - Single listener approach to prevent memory leaks
// Only 2 listeners are registered globally (pty-output and pty-exit)
// Callbacks are dispatched based on tabId

type PtyOutputCallback = (data: string) => void;
type PtyExitCallback = (exitCode: number) => void;

interface TabCallbacks {
  onOutput?: PtyOutputCallback;
  onExit?: PtyExitCallback;
}

class PtyEventManager {
  private callbacks: Map<string, TabCallbacks> = new Map();
  private initialized = false;
  private outputListener: ((...args: unknown[]) => void) | null = null;
  private exitListener: ((...args: unknown[]) => void) | null = null;

  initialize() {
    if (this.initialized || typeof window === 'undefined' || !window.ipcRenderer) {
      return;
    }

    this.initialized = true;

    // Single global listener for pty-output with cleanup reference
    this.outputListener = (...args: unknown[]) => {
      const data = args[0] as { tabId: string; data: string };
      const tabCallbacks = this.callbacks.get(data.tabId);
      if (tabCallbacks?.onOutput) {
        tabCallbacks.onOutput(data.data);
      }
    };
    window.ipcRenderer.on('pty-output', this.outputListener);

    // Single global listener for pty-exit with cleanup reference
    this.exitListener = (...args: unknown[]) => {
      const data = args[0] as { tabId: string; exitCode: number };
      const tabCallbacks = this.callbacks.get(data.tabId);
      if (tabCallbacks?.onExit) {
        tabCallbacks.onExit(data.exitCode);
      }
    };
    window.ipcRenderer.on('pty-exit', this.exitListener);

    console.log('[PtyEventManager] Initialized with global listeners');
  }

  register(tabId: string, callbacks: TabCallbacks) {
    this.initialize();
    
    // Clean up existing registration if any
    if (this.callbacks.has(tabId)) {
      console.warn(`[PtyEventManager] Tab ${tabId} already registered, updating callbacks`);
    }
    
    this.callbacks.set(tabId, callbacks);
    console.log(`[PtyEventManager] Registered tab: ${tabId}`);
  }

  unregister(tabId: string) {
    this.callbacks.delete(tabId);
    console.log(`[PtyEventManager] Unregistered tab: ${tabId}`);
  }

  updateCallbacks(tabId: string, callbacks: Partial<TabCallbacks>) {
    const existing = this.callbacks.get(tabId) || {};
    this.callbacks.set(tabId, { ...existing, ...callbacks });
  }

getRegisteredTabs(): string[] {
    return Array.from(this.callbacks.keys());
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.outputListener && typeof window !== 'undefined' && window.ipcRenderer) {
      window.ipcRenderer.off('pty-output', this.outputListener);
    }
    if (this.exitListener && typeof window !== 'undefined' && window.ipcRenderer) {
      window.ipcRenderer.off('pty-exit', this.exitListener);
    }
    this.callbacks.clear();
    this.initialized = false;
    this.outputListener = null;
    this.exitListener = null;
    console.log('[PtyEventManager] Cleaned up all listeners');
  }

  }

// Singleton instance
export const ptyEventManager = new PtyEventManager();

```

## File: src/lib/utils.ts
```
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

## File: src/pages/Index.tsx
```
import { useEffect, useCallback } from "react";
import { ToolsSidebar } from "@/components/ToolsSidebar";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { TerminalStatusBar } from "@/components/terminal/TerminalStatusBar";
import { TerminalToolbar } from "@/components/terminal/TerminalToolbar";
import { XTerminal } from "@/components/terminal/XTerminal";
import { WelcomePage } from "@/components/WelcomePage";
import { useTerminalStore } from "@/stores/terminalStore";
import { useDirectorySync } from "@/hooks/useDirectorySync";


const Index = () => {
  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const homeDir = useTerminalStore(state => state.homeDir);
  const isInitialized = useTerminalStore(state => state.isInitialized);

  const setHomeDir = useTerminalStore(state => state.setHomeDir);
  const setInitialized = useTerminalStore(state => state.setInitialized);
  const addTab = useTerminalStore(state => state.addTab);

  const activeTab = useTerminalStore(state =>
    state.tabs.find(t => t.id === state.activeTabId)
  );

  useEffect(() => {
    console.log('[Index] State check:', {
      tabsCount: tabs.length,
      activeTabId,
      isInitialized,
      hasActiveTab: !!activeTab
    });
  }, [tabs.length, activeTabId, isInitialized, !!activeTab]);

  // Get directory name from path for tab title
  const getDirectoryName = useCallback((path: string, homePath: string): string => {
    if (path === homePath) return '~';
    if (path === '/') return 'root';
    return path.split('/').pop() || 'unknown';
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (isInitialized) return;

    const initTerminal = async () => {
      console.log('[Index] initTerminal started');
      try {
        // 1. Get Home Directory
        let home: string;
        try {
          home = (await window.ipcRenderer.invoke('get-home-directory')) as string;
        } catch (e) {
          console.warn('[Index] get-home-directory failed, using fallback', e);
          home = '/home';
        }
        setHomeDir(home);

        // 2. Prepare Initial Tab
        const initialTabId = window.crypto.randomUUID();
        console.log('[Index] Initializing tab:', initialTabId);

        // 3. Initialize PTY in Main Process
        try {
          await window.ipcRenderer.invoke('init-tab', initialTabId);
        } catch (e) {
          console.error('[Index] init-tab IPC failed', e);
        }

        // 4. Update Store
        console.log('[Index] Adding initial tab: Welcome');
        addTab({
          id: initialTabId,
          title: 'Welcome',
          cwd: home,
          isReady: true,
          type: 'welcome'
        });

        console.log('[Index] Initialization complete, setting isInitialized=true');
        setInitialized(true);
      } catch (error) {
        console.error('[Index] Critical initialization error:', error);
        // Absolute fallback
        const fallbackId = 'fallback-' + Date.now();
        addTab({
          id: fallbackId,
          title: 'Welcome (Offline)',
          cwd: '/home',
          isReady: true,
          type: 'welcome'
        });
        setHomeDir('/home');
        setInitialized(true);
      }
    };

    initTerminal();
  }, [isInitialized, setHomeDir, getDirectoryName, addTab, setInitialized]);

  // Handle cross-tab events (e.g. from Library)
  useEffect(() => {
    const handleTabCreated = (...args: unknown[]) => {
      console.log('[Index] tab-created event received:', args);
      const [, tabId, cwd, title] = args as [unknown, string, string, string];
      const dirName = getDirectoryName(cwd, homeDir);
      addTab({
        id: tabId,
        title: title || dirName,
        cwd: cwd,
        isReady: false
      });
    };

    window.ipcRenderer.on('tab-created', handleTabCreated);
    return () => {
      window.ipcRenderer.removeAllListeners('tab-created');
    };
  }, [homeDir, getDirectoryName, addTab]);

  // Use custom hook for directory synchronization
  useDirectorySync();

  const handleClear = useCallback(() => {
    if (activeTabId) {
      window.ipcRenderer.invoke('send-input', activeTabId, 'clear\n');
    }
  }, [activeTabId]);

  // Show loading state ONLY while initialization is in progress
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <span className="text-muted-foreground">Initializing terminal...</span>
        </div>
      </div>
    );
  }

  // If initialized but no tab (should not happen normally)
  if (!activeTab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
          <h2 className="text-xl font-semibold mb-2">Failed to load terminal</h2>
          <p className="text-muted-foreground mb-4">The terminal session could not be established.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <ToolsSidebar />
      <div className="flex-1 pl-14 flex flex-col">
        <TerminalToolbar />
        <TerminalHeader onClear={handleClear} />
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'block' : 'hidden'}`}
              style={{ height: '100%' }}
            >
              <div className="h-full w-full">
                {tab.type === 'welcome' ? (
                  <WelcomePage />
                ) : (
                  <XTerminal
                    tabId={tab.id}
                    isActive={tab.id === activeTabId}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <TerminalStatusBar />
      </div>
    </div>
  );
};

export default Index;
```

## File: src/pages/NotFound.tsx
```
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

```

## File: src/stores/terminalStore.ts
```
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Tab {
  id: string;
  title: string;
  cwd: string;
  isReady: boolean;
  type?: 'terminal' | 'welcome';
}

interface TerminalState {
  tabs: Tab[];
  activeTabId: string;
  homeDir: string;
  isInitialized: boolean;

  // Actions
  setHomeDir: (homeDir: string) => void;
  setInitialized: (initialized: boolean) => void;
  addTab: (tab: Partial<Tab> & { title: string; cwd: string }) => string;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
  getActiveTab: () => Tab | undefined;
  clearAllTabs: () => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  tabs: [],
  activeTabId: '',
  homeDir: '',
  isInitialized: false,

  setHomeDir: (homeDir: string) => {
    try {
      set({ homeDir });
    } catch (error) {
      console.error('Failed to set home directory:', error);
    }
  },

  setInitialized: (initialized: boolean) => {
    try {
      set({ isInitialized: initialized });
    } catch (error) {
      console.error('Failed to set initialization state:', error);
    }
  },

  addTab: (tabData) => {
    try {
      const id = tabData.id || uuidv4();
      const newTab: Tab = {
        isReady: false,
        ...tabData,
        id
      };

      set((state) => {
        const newTabs = [...state.tabs, newTab];
        return {
          tabs: newTabs,
          activeTabId: id
        };
      });

      return id;
    } catch (error) {
      console.error('Failed to add tab:', error);
      throw error;
    }
  },

  removeTab: (id) => {
    try {
      set((state) => {
        if (state.tabs.length === 1) return state; // Don't remove last tab

        const newTabs = state.tabs.filter(t => t.id !== id);
        let newActiveTabId = state.activeTabId;

        if (state.activeTabId === id) {
          const closedIndex = state.tabs.findIndex(t => t.id === id);
          const newActiveIndex = Math.max(0, closedIndex - 1);
          newActiveTabId = newTabs[newActiveIndex]?.id || '';
        }

        return {
          tabs: newTabs,
          activeTabId: newActiveTabId
        };
      });
    } catch (error) {
      console.error('Failed to remove tab:', error);
    }
  },

  updateTab: (id, updates) => {
    try {
      set((state) => ({
        tabs: state.tabs.map(tab =>
          tab.id === id ? { ...tab, ...updates } : tab
        )
      }));
    } catch (error) {
      console.error('Failed to update tab:', error);
    }
  },

  setActiveTab: (id) => {
    try {
      set({ activeTabId: id });
    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
  },

  getActiveTab: () => {
    try {
      const state = get();
      return state.tabs.find(t => t.id === state.activeTabId);
    } catch (error) {
      console.error('Failed to get active tab:', error);
      return undefined;
    }
  },

  clearAllTabs: () => {
    try {
      set({ tabs: [], activeTabId: '' });
    } catch (error) {
      console.error('Failed to clear tabs:', error);
    }
  }
}));
```

## File: src-original-backup/assets/react.svg
```
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
```

## File: src-original-backup/components/Modal.tsx
```
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;

```

## File: src-original-backup/components/Sidebar.tsx
```
import React, { useState } from 'react';

const Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('whatsapp');

    return (
        <div className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Minty
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Main Menu
                </div>

                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveItem('whatsapp')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeItem === 'whatsapp'
                                ? 'bg-gray-800 text-white border-l-4 border-green-500 shadow-md'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3 text-xl">💬</span>
                        WhatsApp Button Features
                    </button>

                    <button
                        onClick={() => setActiveItem('settings')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeItem === 'settings'
                                ? 'bg-gray-800 text-white border-l-4 border-blue-500 shadow-md'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3 text-xl">⚙️</span>
                        Settings
                    </button>
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-gray-400">Pro Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

```

## File: src-original-backup/lib/utils.ts
```
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

```

## File: dist_electron/linux-unpacked/resources/apparmor-profile
```
abi <abi/4.0>,
include <tunables/global>

profile "minty" "/opt/Minty/minty" flags=(unconfined) {
  userns,

  # Site-specific additions and overrides. See local/README for details.
  include if exists <local/minty>
}
```

## File: src/components/terminal/LibraryModal.tsx
```
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, FileText, Terminal, GitBranch, Package, Settings, Trash2, Copy, Play, Library as LibraryIcon, FolderOpen, Monitor } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LibraryStorage, type LibraryItem } from "@/lib/libraryStorage";

interface LibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  commands: Terminal,
  templates: GitBranch,
  workflows: Package,
  sessions: Monitor,
  command: Terminal,
  script: FileText,
  snippet: Package,
  template: GitBranch,
  config: Settings,
  alias: Terminal
};

const typeColors = {
  commands: 'bg-blue-100 text-blue-800 border-blue-200',
  templates: 'bg-green-100 text-green-800 border-green-200',
  workflows: 'bg-purple-100 text-purple-800 border-purple-200',
  sessions: 'bg-orange-100 text-orange-800 border-orange-200',
  command: 'bg-blue-100 text-blue-800 border-blue-200',
  script: 'bg-green-100 text-green-800 border-green-200',
  snippet: 'bg-purple-100 text-purple-800 border-purple-200',
  template: 'bg-orange-100 text-orange-800 border-orange-200',
  config: 'bg-gray-100 text-gray-800 border-gray-200',
  alias: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

export const LibraryModal = ({ open, onOpenChange }: LibraryModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  useEffect(() => {
    if (open) {
      setLibraryItems(LibraryStorage.getAll());
    }
  }, [open]);

  const categories = LibraryStorage.getCategories();
  const types = LibraryStorage.getTypes();

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleExecute = (item: LibraryItem) => {
    if (item.type === 'sessions' && item.content?.tabs) {
      // Handle saved sessions - create new tabs for each
      item.content.tabs.forEach((tab: any) => {
        window.ipcRenderer.invoke('open-tab-with-directory', tab.cwd, tab.title).then((result: any) => {
          if (result.success) {
            // Notify the main component to add the tab
            window.ipcRenderer.send('tab-created', result.tabId, result.cwd, result.title);
          }
        });
      });
    } else {
      // Handle commands, templates, workflows
      const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
      window.ipcRenderer.invoke('send-input', 'active', content + '\n');
    }
    LibraryStorage.save({ ...item, usage: (item.usage || 0) + 1 });
    onOpenChange(false);
  };

  const handleCopy = (item: LibraryItem) => {
    const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2);
    navigator.clipboard.writeText(content);
  };

  const handleDelete = (itemId: string) => {
    LibraryStorage.delete(itemId);
    setLibraryItems(LibraryStorage.getAll());
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const renderSessionContent = (content: any) => {
    if (!content?.tabs) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FolderOpen className="w-4 h-4" />
          {content.tabs.length} Tab{content.tabs.length !== 1 ? 's' : ''}
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {content.tabs.map((tab: any, index: number) => (
            <div key={tab.id || index} className="flex items-center justify-between bg-muted/50 rounded p-2 text-xs">
              <div className="flex items-center gap-2 truncate flex-1">
                <Terminal className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{tab.title}</span>
              </div>
              <div className="font-mono text-muted-foreground truncate max-w-40">
                {tab.cwd}
              </div>
            </div>
          ))}
        </div>
        {content.savedAt && (
          <div className="text-xs text-muted-foreground pt-2">
            Saved: {new Date(content.savedAt).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LibraryIcon className="w-5 h-5" />
            Terminal Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search commands, templates, sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {types.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Library Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {filteredItems.map((item) => {
                const Icon = typeIcons[item.type] || Folder;
                const colorClass = typeColors[item.type];

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <Badge className={`text-xs ${colorClass}`}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item);
                          }}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute(item);
                          }}
                          title="Execute/Load"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm mb-2 truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                    {/* Content Preview */}
                    <div className="mb-3 min-h-[60px] max-h-[80px] overflow-hidden">
                      {item.type === 'sessions' ? (
                        <div className="text-xs text-muted-foreground">
                          <Monitor className="w-4 h-4 mr-2" />
                          Open Saved Tabs
                        </div>
                      ) : (
                        <div className="text-xs font-mono bg-muted/30 rounded p-2 truncate">
                          {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <div className="flex items-center gap-2">
                        {item.usage !== undefined && (
                          <span>Used {item.usage}x</span>
                        )}
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters, or save some tabs to get started
                </p>
              </div>
            )}
          </div>

          {/* Selected Item Detail */}
          {selectedItem && (
            <>
              <Separator />
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selectedItem.name}</h3>
                    <Badge className={typeColors[selectedItem.type]}>
                      {selectedItem.type}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedItem.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {selectedItem.type === 'sessions' ? (
                  renderSessionContent(selectedItem.content)
                ) : (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                      {typeof selectedItem.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem.content, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedItem.type === 'sessions' ? (
                    <Button
                      onClick={() => handleExecute(selectedItem)}
                      className="flex-1"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Open Saved Tabs
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleExecute(selectedItem)}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute in Terminal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(selectedItem)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## File: src/components/terminal/SaveTabsModal.tsx
```
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";

interface TabData {
  id: string;
  title: string;
  cwd: string;
}

interface SaveTabsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveTabsModal = ({ open, onOpenChange }: SaveTabsModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'commands' | 'templates' | 'workflows' | 'sessions'>('sessions');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Get current tabs from IPC
  const [currentTabs, setCurrentTabs] = useState<TabData[]>([]);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      // Get current tabs from main process
      const tabs = await window.ipcRenderer.invoke('get-current-tabs') as TabData[];

      const libraryItem = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        type,
        tags,
        content: {
          tabs: tabs || currentTabs,
          savedAt: new Date().toISOString(),
          version: '1.0'
        },
        category: type,
        usage: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Save to local storage directly
      import('@/lib/libraryStorage').then(({ LibraryStorage }) => {
        LibraryStorage.save(libraryItem);
      });

      // Reset form
      setName('');
      setDescription('');
      setType('sessions');
      setTags([]);
      setCurrentTag('');

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save tabs:', error);
    }
  };

  const loadCurrentTabs = async () => {
    try {
      const tabs = await window.ipcRenderer.invoke('get-current-tabs') as TabData[];
      setCurrentTabs(tabs);
    } catch (error) {
      console.error('Failed to load current tabs:', error);
    }
  };

  // Load tabs when modal opens
  useEffect(() => {
    if (open) {
      loadCurrentTabs();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Current Tabs to Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Current Tabs Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <Label className="text-sm font-medium mb-3 block">Current Tabs ({currentTabs.length})</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {currentTabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center justify-between bg-background rounded p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{tab.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate max-w-40">
                    {tab.cwd}
                  </div>
                </div>
              ))}
              {currentTabs.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No active tabs found
                </div>
              )}
            </div>
          </div>

          {/* Save Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Web Development Setup, Database Management"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this tab collection is for..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Sessions - Saved Tab Collections</SelectItem>
                  <SelectItem value="workflows">Workflows - Multi-step Processes</SelectItem>
                  <SelectItem value="templates">Templates - Reusable Setups</SelectItem>
                  <SelectItem value="commands">Commands - Quick Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || currentTabs.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Library
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## File: src/components/terminal/SplashScreen.tsx
```
import { useState, useEffect } from "react";
import {
  Rocket,
  Sparkles,
  Code2,
  Zap,
  ArrowRight,
  Command,
  Cpu,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentStep < 3) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Intelligent code generation & enhancement"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized build & deploy pipelines"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Smart Debugging",
      description: "AI-assisted error detection & fixes"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Deploy Anywhere",
      description: "One-click deployment to any platform"
    }
  ];

  const loadingSteps = [
    { text: "Initializing AI engine...", icon: <Cpu className="w-4 h-4" /> },
    { text: "Loading development tools...", icon: <Command className="w-4 h-4" /> },
    { text: "Connecting to cloud services...", icon: <Globe className="w-4 h-4" /> },
    { text: "Ready to code!", icon: <Rocket className="w-4 h-4" /> }
  ];

  const getContentClass = () => {
    return showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
  };

  const getStepClass = (index: number) => {
    return index <= currentStep ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4';
  };

  const getIconClass = (index: number) => {
    if (index < currentStep) return 'bg-terminal-green/20 text-terminal-green';
    if (index === currentStep) return 'bg-primary/20 text-primary animate-pulse';
    return 'bg-muted text-muted-foreground';
  };

  const getTextClass = (index: number) => {
    if (index < currentStep) return 'text-terminal-green';
    if (index === currentStep) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getFeatureClass = () => {
    return showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  };

  const getCtaClass = () => {
    return currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-terminal-purple/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-terminal-cyan/3 rounded-full blur-[150px]" />
      </div>

      {/* Main content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-700 ${getContentClass()}`}>
        {/* Logo section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-terminal-purple/20 border border-primary/30 mb-6 relative">
            <img src="/logo.png" alt="Minty Logo" className="w-16 h-16 object-contain" />
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text glow-text">Minty</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            The AI-powered command line interface for modern development
          </p>
        </div>

        {/* Loading steps */}
        <div className="mb-12 space-y-3">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center justify-center gap-3 transition-all duration-500 ${getStepClass(index)}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`p-1.5 rounded-full ${getIconClass(index)}`}>
                {step.icon}
              </div>
              <span className={`text-sm font-mono ${getTextClass(index)}`}>
                {step.text}
              </span>
              {index < currentStep && (
                <span className="text-terminal-green">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-500 group ${getFeatureClass()}`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-700 ${getCtaClass()}`}>
          <Button
            size="lg"
            onClick={onComplete}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border group px-8"
          >
            Launch Terminal
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-secondary border border-border font-mono text-xs">Enter</kbd> or click to continue
          </p>
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>Built with love by Minty Team</span>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

```

## File: src/components/terminal/TerminalContent.tsx
```
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalContentProps {
  history: Array<{ type: 'input' | 'output' | 'error' | 'success'; content: string }>;
  onCommand: (command: string) => void;
  onClear: () => void;
  onInput?: (input: string) => void;
  onInterrupt?: () => void;
  cwd?: string;
  isExecuting?: boolean;
  isInteractive?: boolean;
}

export const TerminalContent = ({
  history,
  onCommand,
  onClear,
  onInput,
  onInterrupt,
  cwd = '~',
  isExecuting = false,
  isInteractive = false
}: TerminalContentProps) => {
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputCommands = history
    .filter(h => h.type === 'input')
    .map(h => h.content.replace('$ ', ''));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount and when not executing
  useEffect(() => {
    if (!isExecuting) {
      inputRef.current?.focus();
    }
  }, [isExecuting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+C - interrupt
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (onInterrupt) {
        onInterrupt();
      }
      return;
    }

    // Ctrl+L - clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
      return;
    }

    // Ctrl+D - EOF
    if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      if (onInput) {
        onInput('\x04');
      }
      return;
    }

    if (e.key === 'Enter') {
      if (currentInput.toLowerCase().trim() === 'clear') {
        onClear();
      } else {
        onCommand(currentInput);
      }
      setCurrentInput("");
      setCommandHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputCommands.length > 0) {
        const newIndex = commandHistoryIndex < inputCommands.length - 1
          ? commandHistoryIndex + 1
          : commandHistoryIndex;
        setCommandHistoryIndex(newIndex);
        setCurrentInput(inputCommands[inputCommands.length - 1 - newIndex] || "");
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryIndex > 0) {
        const newIndex = commandHistoryIndex - 1;
        setCommandHistoryIndex(newIndex);
        setCurrentInput(inputCommands[inputCommands.length - 1 - newIndex] || "");
      } else {
        setCommandHistoryIndex(-1);
        setCurrentInput("");
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion could be added here
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-foreground';
      case 'success':
        return 'text-terminal-green';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className="flex-1 bg-background cursor-text"
      onClick={focusInput}
    >
      <ScrollArea className="h-[calc(100vh-140px)]" ref={scrollRef}>
        <div className="p-4 font-mono text-sm leading-relaxed">
          {history.map((line, index) => (
            <div key={index} className={`${getLineClass(line.type)} whitespace-pre-wrap`}>
              {line.content}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center gap-2 mt-1">
            {!isInteractive && (
              <>
                <span className="text-terminal-green">{cwd}</span>
                <span className="text-primary">$</span>
              </>
            )}
            {isExecuting && !isInteractive ? (
              <span className="text-muted-foreground animate-pulse">executing...</span>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-foreground font-mono caret-primary"
                  autoFocus
                  spellCheck={false}
                  placeholder={isInteractive ? "" : ""}
                />
                <span className="w-2 h-5 bg-primary cursor-blink" />
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

```

## File: src/components/terminal/TerminalHeader.tsx
```
import { useRef } from "react";
import { Terminal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTerminalStore } from "@/stores/terminalStore";

interface TerminalHeaderProps {
  onClear: () => void;
}

// Helper to format path for display (replace home with ~)
const formatPath = (fullPath: string, homePath: string): string => {
  if (!fullPath) return '~';
  if (fullPath === homePath) return '~';
  if (fullPath.startsWith(homePath + '/')) {
    return '~' + fullPath.slice(homePath.length);
  }
  return fullPath;
};

export const TerminalHeader = ({
  onClear
}: TerminalHeaderProps) => {
  const { tabs, activeTabId, setActiveTab, removeTab, homeDir, getActiveTab } = useTerminalStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = getActiveTab();

  // Debug CWD display
  if (activeTab) {
    console.log('[TerminalHeader] Debug:', { cwd: activeTab.cwd, homeDir, formatted: formatPath(activeTab.cwd, homeDir) });
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleCloseTab = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.ipcRenderer.invoke('remove-tab', id);
    } catch { /* ignore */ }
    removeTab(id);
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/30">
        <div className="flex items-center gap-1 w-full max-w-[calc(100vw-150px)]">
          <button
            onClick={scrollLeft}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1 overflow-x-hidden no-scrollbar flex-1 scroll-smooth"
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-t border-t border-x cursor-pointer group min-w-[120px] max-w-[200px] shrink-0",
                  activeTabId === tab.id
                    ? "bg-card border-border"
                    : "bg-transparent border-transparent hover:bg-card/50"
                )}
              >
                <Terminal className={cn("w-3 h-3 shrink-0", activeTabId === tab.id ? "text-primary" : "text-muted-foreground")} />
                <span className={cn(
                  "text-xs font-mono truncate flex-1",
                  activeTabId === tab.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {tab.title}
                </span>
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-sm hover:bg-secondary",
                    activeTabId === tab.id ? "opacity-100" : ""
                  )}
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 text-sm font-mono border-t border-border/50">
        <span className="text-terminal-green">{formatPath(activeTab?.cwd || '', homeDir)}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-primary">bash</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Output
          </button>
        </div>
      </div>
    </div>
  );
};

```

## File: src/components/terminal/TerminalStatusBar.tsx
```
import { Cpu, Wifi, Battery, Clock, Terminal, Package, MemoryStick } from "lucide-react";
import { useState, useEffect } from "react";
import { useTerminalStore } from "@/stores/terminalStore";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline' | 'weak';
  batteryLevel: number;
  processCount: number;
}

export const TerminalStatusBar = () => {
  const [time, setTime] = useState(new Date());
  const [sessionStart] = useState(new Date());
  const { tabs } = useTerminalStore();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpuUsage: 8,
    memoryUsage: 45,
    networkStatus: 'online',
    batteryLevel: 100,
    processCount: 156
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate system monitoring updates
    const systemTimer = setInterval(() => {
      setSystemInfo(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkStatus: Math.random() > 0.9 ? 'weak' : 'online',
        batteryLevel: Math.max(0, prev.batteryLevel - 0.1),
        processCount: Math.max(100, prev.processCount + Math.floor((Math.random() - 0.5) * 10))
      }));
    }, 5000);
    return () => clearInterval(systemTimer);
  }, []);

  const getSessionDuration = () => {
    const diff = time.getTime() - sessionStart.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getNetworkIcon = () => {
    switch (systemInfo.networkStatus) {
      case 'offline': return 'text-red-500';
      case 'weak': return 'text-yellow-500';
      default: return 'text-terminal-green';
    }
  };

  const getBatteryColor = () => {
    if (systemInfo.batteryLevel < 20) return 'text-red-500';
    if (systemInfo.batteryLevel < 50) return 'text-yellow-500';
    return 'text-terminal-green';
  };

  return (
    <div className="bg-secondary/50 border-t border-border px-4 py-1.5 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4">
        <span className="text-terminal-green flex items-center gap-1">
          <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse" />
          {systemInfo.networkStatus === 'offline' ? 'Offline' : 'Connected'}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Session: {getSessionDuration()}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          Tabs: {tabs.length}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Package className="w-3 h-3" />
          {systemInfo.processCount} processes
        </span>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {Math.round(systemInfo.cpuUsage)}%
        </span>
        <span className="flex items-center gap-1">
          <MemoryStick className="w-3 h-3" />
          {Math.round(systemInfo.memoryUsage)}%
        </span>
        <span className={`flex items-center gap-1 ${getNetworkIcon()}`}>
          <Wifi className="w-3 h-3" />
          {systemInfo.networkStatus === 'offline' ? 'Offline' :
            systemInfo.networkStatus === 'weak' ? 'Weak' : 'Strong'}
        </span>
        <span className={`flex items-center gap-1 ${getBatteryColor()}`}>
          <Battery className="w-3 h-3" />
          {Math.round(systemInfo.batteryLevel)}%
        </span>
        <span className="text-foreground">
          {time.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

```

## File: src/components/terminal/TerminalToolbar.tsx
```
import { Minus, Maximize2, X, Plus, Library, Play } from "lucide-react";
import { useState, useCallback } from "react";
import { LibraryModal } from "./LibraryModal";
import { SaveTabsModal } from "./SaveTabsModal";
import { useTerminalStore } from "@/stores/terminalStore";

export const TerminalToolbar = () => {
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [saveTabsOpen, setSaveTabsOpen] = useState(false);
    const { addTab, homeDir } = useTerminalStore();

    const handleMinimize = () => {
        window.ipcRenderer.send('window-minimize');
    };

    const handleMaximize = () => {
        window.ipcRenderer.send('window-maximize');
    };

    const handleClose = () => {
        window.ipcRenderer.send('window-close');
    };

    const handleAddTab = useCallback(async () => {
        try {
            const { v4: uuidv4 } = await import('uuid');
            const newId = uuidv4();

            const cwd = (await window.ipcRenderer.invoke('init-tab', newId)) as string;
            const dirName = cwd.split('/').pop() || 'home';
            addTab({
                id: newId,
                title: dirName,
                cwd: cwd,
                isReady: false
            });
        } catch (error) {
            console.error('Failed to create tab:', error);
            const { v4: uuidv4 } = await import('uuid');
            const fallbackId = uuidv4();
            const fallbackCwd = homeDir || '/home';
            addTab({
                id: fallbackId,
                title: 'home',
                cwd: fallbackCwd,
                isReady: false
            });
        }
    }, [addTab, homeDir]);

    return (
        <div className="h-8 bg-card border-b border-border flex items-center justify-between px-2 select-none app-region-drag">
            <div className="flex items-center gap-2 app-region-no-drag">
                {/* Placeholder for left side toolbar items if needed */}
            </div>

            <div className="flex items-center gap-2 app-region-no-drag">
                <button
                    onClick={handleAddTab}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                    title="New Tab"
                >
                    <Plus className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setLibraryOpen(true)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                    title="Terminal Library"
                >
                    <Library className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setSaveTabsOpen(true)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                    title="Save Current Tabs"
                >
                    <Play className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-border mx-1" />

                <button
                    onClick={handleMinimize}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
                <button
                    onClick={handleClose}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <LibraryModal
                open={libraryOpen}
                onOpenChange={setLibraryOpen}
            />
            <SaveTabsModal
                open={saveTabsOpen}
                onOpenChange={setSaveTabsOpen}
            />
        </div>
    );
};

```

## File: src/components/terminal/XTerminal.tsx
```
import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { ptyEventManager } from '@/lib/ptyEventManager';
import { useTerminalStore } from '@/stores/terminalStore';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  tabId: string;
  isActive: boolean;
}

export const XTerminal = ({ tabId, isActive }: XTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initializedRef = useRef(false);


  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return;

    initializedRef.current = true;

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0a0a0a',
        foreground: '#e4e4e7',
        cursor: '#22c55e',
        cursorAccent: '#0a0a0a',
        selectionBackground: '#3f3f46',
        black: '#18181b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      allowProposedApi: true,
      scrollback: 10000,
      convertEol: true,
      rightClickSelectsWord: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal in container
    term.open(terminalRef.current);

    // Store refs
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Fit to container after a small delay
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 50);

    // Handle user input - send directly to PTY
    term.onData((data) => {
      window.ipcRenderer.invoke('send-input', tabId, data);
    });

    // Register with global event manager (no new listeners created)
    ptyEventManager.register(tabId, {
      onOutput: (data: string) => {
        if (xtermRef.current) {
          xtermRef.current.write(data);
        }
      },
      onExit: (exitCode: number) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\r\n[Process exited with code ${exitCode}]`);
        }
      }
    });

    // Handle selection change - manual copy on selection for better UX
    term.onSelectionChange(() => {
      if (term.hasSelection()) {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).catch(err => {
            console.warn('Failed to copy selection:', err);
          });
        }
      }
    });

    // Focus terminal when active - but only if not already focused to avoid clearing selection
    if (isActive && xtermRef.current) {
      const isFocused = document.activeElement?.closest('.xterm-container');
      if (!isFocused) {
        xtermRef.current.focus();
      }
    }

    // Update readiness in store
    const { updateTab } = useTerminalStore.getState();
    updateTab(tabId, { isReady: true });

    // Cleanup function
    return () => {
      // Unregister from event manager
      ptyEventManager.unregister(tabId);

      // Dispose terminal
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
      if (fitAddonRef.current) {
        fitAddonRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [tabId, isActive]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current && isActive) {
        try {
          fitAddonRef.current.fit();
          const dims = fitAddonRef.current.proposeDimensions();
          if (dims) {
            window.ipcRenderer.invoke('resize-pty', tabId, dims.cols, dims.rows);
          }
        } catch (e) {
          console.warn('Fit error:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (isActive) {
          setTimeout(handleResize, 50);
        }
      });
      resizeObserver.observe(terminalRef.current);
    }

    // Initial fit when becoming active
    if (isActive) {
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 300); // Second fit for good measure
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [tabId, isActive]);


  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-[#0a0a0a] xterm-container"
      onContextMenu={() => {
        // Right click to paste if there's no selection, or just let the default context menu show
        // For a more native feel, we'll implement a simple one or just handle paste
        if (xtermRef.current) {
          if (!xtermRef.current.hasSelection()) {
            // If no selection, paste on right click (common terminal behavior)
            navigator.clipboard.readText().then(text => {
              if (text) {
                window.ipcRenderer.invoke('send-input', tabId, text);
              }
            });
          }
        }
      }}
      style={{
        padding: '8px',
        minHeight: '300px',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
  );
};

```

## File: src/components/ui/accordion.tsx
```
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

## File: src/components/ui/alert-dialog.tsx
```
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```

## File: src/components/ui/alert.tsx
```
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

```

## File: src/components/ui/aspect-ratio.tsx
```
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

```

## File: src/components/ui/avatar.tsx
```
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

```

## File: src/components/ui/badge.tsx
```
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

```

## File: src/components/ui/breadcrumb.tsx
```
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
  <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

## File: src/components/ui/button.tsx
```
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

## File: src/components/ui/calendar.tsx
```
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

```

## File: src/components/ui/card.tsx
```
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

```

## File: src/components/ui/carousel.tsx
```
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };

```

## File: src/components/ui/chart.tsx
```
import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                  const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
                  return color ? `  --color-${key}: ${color};` : null;
                })
                .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  any
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>;
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item: any, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & any
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item: any) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };

```

## File: src/components/ui/checkbox.tsx
```
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

```

## File: src/components/ui/collapsible.tsx
```
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

## File: src/components/ui/command.tsx
```
import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

## File: src/components/ui/context-menu.tsx
```
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

## File: src/components/ui/dialog.tsx
```
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

```

## File: src/components/ui/drawer.tsx
```
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

## File: src/components/ui/dropdown-menu.tsx
```
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

```

## File: src/components/ui/form.tsx
```
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };

```

## File: src/components/ui/hover-card.tsx
```
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

```

## File: src/components/ui/input-otp.tsx
```
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

## File: src/components/ui/input.tsx
```
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

```

## File: src/components/ui/label.tsx
```
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

```

## File: src/components/ui/menubar.tsx
```
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};

```

## File: src/components/ui/navigation-menu.tsx
```
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

```

## File: src/components/ui/pagination.tsx
```
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

```

## File: src/components/ui/popover.tsx
```
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };

```

## File: src/components/ui/progress.tsx
```
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

```

## File: src/components/ui/radio-group.tsx
```
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

```

## File: src/components/ui/resizable.tsx
```
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

```

## File: src/components/ui/scroll-area.tsx
```
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

```

## File: src/components/ui/select.tsx
```
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

```

## File: src/components/ui/separator.tsx
```
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

```

## File: src/components/ui/sheet.tsx
```
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

```

## File: src/components/ui/sidebar.tsx
```
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
        )}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
        >
          {children}
        </div>
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className,
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"
        className={cn(
          "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        data-sidebar="separator"
        className={cn("mx-2 w-auto bg-sidebar-border", className)}
        {...props}
      />
    );
  },
);
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ className, ...props }, ref) => (
  <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
        "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90% (seeded with component name for consistency)
  const width = React.useMemo(() => {
    // Use a simple hash of the component name to generate consistent "random" width
    const seed = className ? className.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const randomish = (seed * 9301 + 49297) % 233280;
    return `${(randomish % 40) + 50}%`;
  }, [className]);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

## File: src/components/ui/skeleton.tsx
```
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };

```

## File: src/components/ui/slider.tsx
```
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

```

## File: src/components/ui/sonner.tsx
```
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

```

## File: src/components/ui/switch.tsx
```
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

```

## File: src/components/ui/table.tsx
```
import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />,
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

```

## File: src/components/ui/tabs.tsx
```
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

## File: src/components/ui/textarea.tsx
```
import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

```

## File: src/components/ui/toast.tsx
```
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

```

## File: src/components/ui/toaster.tsx
```
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

```

## File: src/components/ui/toggle-group.tsx
```
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

```

## File: src/components/ui/toggle.tsx
```
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

```

## File: src/components/ui/tooltip.tsx
```
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

## File: src/components/ui/use-toast.ts
```
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };

```

