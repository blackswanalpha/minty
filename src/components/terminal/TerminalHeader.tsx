import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useTerminalStore } from "@/stores/terminalStore";
import { SortableTab } from "./SortableTab";

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
  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const setActiveTab = useTerminalStore(state => state.setActiveTab);
  const removeTab = useTerminalStore(state => state.removeTab);
  const reorderTabs = useTerminalStore(state => state.reorderTabs);
  const homeDir = useTerminalStore(state => state.homeDir);
  const getActiveTab = useTerminalStore(state => state.getActiveTab);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = getActiveTab();
  const [shellName, setShellName] = useState('shell');

  useEffect(() => {
    window.ipcRenderer.invoke('get-system-info').then((info: any) => {
      if (info?.shell) {
        setShellName(info.shell.split('/').pop() || 'shell');
      }
    }).catch(() => {});
  }, []);

  // Debug CWD display
  if (activeTab) {
    console.log('[TerminalHeader] Debug:', { cwd: activeTab.cwd, homeDir, formatted: formatPath(activeTab.cwd, homeDir) });
  }

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleCloseTab = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    try {
      if (tab?.panes && tab.panes.length > 0) {
        // Clean up all pane PTYs
        await Promise.all(tab.panes.map(pane =>
          window.ipcRenderer.invoke('remove-tab', pane.id).catch(() => {})
        ));
      } else {
        await window.ipcRenderer.invoke('remove-tab', id);
      }
    } catch { /* ignore */ }
    removeTab(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(active.id as string, over.id as string);
    }
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
              <div
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex items-center gap-1 overflow-x-scroll scrollbar-none flex-1"
              >
                {tabs.map((tab) => (
                  <SortableTab
                    key={tab.id}
                    tab={tab}
                    isActive={activeTabId === tab.id}
                    onActivate={setActiveTab}
                    onClose={handleCloseTab}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

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
        <span className="text-primary">{shellName}</span>
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
