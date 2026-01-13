import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { Terminal, Package, Settings, Scissors, Copy, Clipboard, Plus } from "lucide-react";
import { showClipboardToast, type ClipboardAction } from "./ui/clipboard-toast";
import { WindowModal, WindowModalDemo } from "./ui/window-modal";

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
  const [windowModalOpen, setWindowModalOpen] = useState(false);

  const handleClipboardAction = (action: ClipboardAction, content?: string) => {
    showClipboardToast({ action, content });
  };

  return (
    <>
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Install</h3>
              </div>
              <CodeBlock code={installCode} title="terminal" />
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleClipboardAction("copy", installCode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  Copy
                </button>
                <button
                  onClick={() => handleClipboardAction("cut", "npm install -g @lovable/cli")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  Cut
                </button>
                <button
                  onClick={() => handleClipboardAction("paste")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                  Paste
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">2. Configure</h3>
              </div>
              <CodeBlock code={configCode} language="json" title="lovable.config.json" />
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleClipboardAction("copy", configCode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  Copy
                </button>
                <button
                  onClick={() => handleClipboardAction("cut", "project settings")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  Cut
                </button>
                <button
                  onClick={() => handleClipboardAction("paste")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                  Paste
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Terminal className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">3. Build</h3>
              </div>
              <CodeBlock code={usageCode} title="terminal" />
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleClipboardAction("copy", usageCode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  Copy
                </button>
                <button
                  onClick={() => handleClipboardAction("cut", "build commands")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  Cut
                </button>
                <button
                  onClick={() => handleClipboardAction("paste")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                >
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                  Paste
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-lg border border-border bg-card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Window & Tab Management
            </h3>
            <p className="text-muted-foreground mb-4">
              Organize your workflow with multiple windows and tabs. Click below to try the feature.
            </p>
            <WindowModalDemo onOpenChange={setWindowModalOpen} />
          </div>
        </div>
      </section>

      <WindowModal open={windowModalOpen} onOpenChange={setWindowModalOpen} />
    </>
  );
};
