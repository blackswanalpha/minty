import { useEffect } from 'react';
import { FileExplorerToolbar } from './FileExplorerToolbar';
import { FileExplorerList } from './FileExplorerList';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FileExplorerPanel() {
  const isOpen = useFileExplorerStore((s) => s.isOpen);
  const isLoading = useFileExplorerStore((s) => s.isLoading);
  const error = useFileExplorerStore((s) => s.error);
  const currentPath = useFileExplorerStore((s) => s.currentPath);
  const navigateTo = useFileExplorerStore((s) => s.navigateTo);
  const loadDirectory = useFileExplorerStore((s) => s.loadDirectory);

  const activeTab = useTerminalStore((s) =>
    s.tabs.find((t) => t.id === s.activeTabId)
  );

  // Sync with active tab's cwd
  useEffect(() => {
    if (!isOpen || !activeTab?.cwd) return;
    // Only navigate if the cwd actually changed (tab switch or cd)
    if (activeTab.cwd !== currentPath) {
      navigateTo(activeTab.cwd);
    }
  }, [activeTab?.id, activeTab?.cwd, isOpen]);

  // Refresh when toggled open
  useEffect(() => {
    if (isOpen && activeTab?.cwd && !currentPath) {
      navigateTo(activeTab.cwd);
    }
  }, [isOpen]);

  if (error) {
    return (
      <div className="h-full flex flex-col bg-background">
        <FileExplorerToolbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-sm">
            <p className="text-destructive mb-2">{error}</p>
            <button
              onClick={() => activeTab?.cwd && loadDirectory(activeTab.cwd)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <FileExplorerToolbar />
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <FileExplorerList />
        </ScrollArea>
      )}
    </div>
  );
}
