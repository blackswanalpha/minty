import { Fragment } from 'react';
import { X } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { XTerminal } from './XTerminal';
import { useTerminalStore, type Tab } from '@/stores/terminalStore';

interface TerminalPaneGroupProps {
  tab: Tab;
  isActive: boolean;
}

export const TerminalPaneGroup = ({ tab, isActive }: TerminalPaneGroupProps) => {
  const getPanes = useTerminalStore(state => state.getPanes);
  const closePane = useTerminalStore(state => state.closePane);
  const setActivePane = useTerminalStore(state => state.setActivePane);

  const panes = getPanes(tab.id);
  const activePaneId = tab.activePaneId || tab.id;
  const showPaneUI = panes.length > 1;

  // Always render ResizablePanelGroup so the DOM tree stays stable across
  // single → multi pane transitions and XTerminal instances are never remounted.
  return (
    <ResizablePanelGroup direction="horizontal">
      {panes.map((pane, index) => (
        <Fragment key={pane.id}>
          {index > 0 && <ResizableHandle />}
          <ResizablePanel id={pane.id} minSize={15}>
            <div
              className={`flex flex-col h-full ${
                showPaneUI && isActive && pane.id === activePaneId
                  ? 'border-t-2 border-primary'
                  : showPaneUI
                    ? 'border-t-2 border-transparent'
                    : ''
              }`}
              onClick={() => showPaneUI && setActivePane(tab.id, pane.id)}
            >
              {/* Pane header — always in DOM to keep child positions stable; hidden for single pane */}
              <div className={`items-center justify-between px-2 py-0.5 bg-secondary/30 text-xs text-muted-foreground shrink-0 ${
                showPaneUI ? 'flex' : 'hidden'
              }`}>
                <span className="truncate">{pane.cwd.split('/').pop() || 'terminal'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closePane(tab.id, pane.id);
                  }}
                  className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {/* Terminal container */}
              <div className="flex-1 relative">
                <XTerminal
                  tabId={pane.id}
                  isActive={isActive && pane.id === activePaneId}
                />
              </div>
            </div>
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  );
};
