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
