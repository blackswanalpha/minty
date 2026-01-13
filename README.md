<div align="center">

![Minty Logo](public/logo.png)

</div>

# 🍃 Minty Terminal

Minty is a modern, lightweight, and highly customizable terminal emulator built with **Electron**, **React**, and **Vite**. It focuses on speed, aesthetics, and a smooth developer experience.



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

1.  **Clone the reposaitory**:
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
