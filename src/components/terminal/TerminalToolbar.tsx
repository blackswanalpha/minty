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
