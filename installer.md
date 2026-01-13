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
