import { FolderSimple, SplitHorizontal, GearSix, GitBranch } from '@phosphor-icons/react';
import { Command, Keyboard } from 'lucide-react';
import { GitHubProfilePopover } from '@/components/git-panel/GitHubProfilePopover';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { useAiSettingsStore } from '@/stores/aiSettingsStore';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
import { useKeyboardShortcutsStore } from '@/stores/keyboardShortcutsStore';
import { AISettingsModal } from '@/components/settings/AISettingsModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ToolsSidebar = () => {
  const toggleFileExplorer = useFileExplorerStore((s) => s.toggle);
  const isFileExplorerOpen = useFileExplorerStore((s) => s.isOpen);
  const toggleGitPanel = useGitStore((s) => s.toggle);
  const isGitPanelOpen = useGitStore((s) => s.isOpen);
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const activeTab = useTerminalStore((s) => s.tabs.find(t => t.id === s.activeTabId));
  const splitPane = useTerminalStore((s) => s.splitPane);

  const isWelcome = activeTab?.type === 'welcome';
  const openAiSettings = useAiSettingsStore((s) => s.openModal);
  const toggleCommandPalette = useCommandPaletteStore((s) => s.toggle);
  const openShortcutsModal = useKeyboardShortcutsStore((s) => s.openModal);

  return (
    <>
      <aside className="fixed left-0 top-8 bottom-0 w-14 border-r border-border bg-background/50 backdrop-blur-sm z-40 flex flex-col items-center py-4 gap-4">
        <div className="hover:scale-110 transition-transform duration-200 cursor-pointer">
          <img src="./logo.png" alt="Minty Logo" className="w-8 h-8 object-contain" />
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (isGitPanelOpen) {
                    useGitStore.getState().close();
                  }
                  toggleFileExplorer();
                }}
                className={`p-2 rounded-md transition-colors ${
                  isFileExplorerOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <FolderSimple weight={isFileExplorerOpen ? 'fill' : 'regular'} size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">File Explorer</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (isFileExplorerOpen) {
                    useFileExplorerStore.getState().close();
                  }
                  toggleGitPanel();
                }}
                className={`p-2 rounded-md transition-colors ${
                  isGitPanelOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <GitBranch weight={isGitPanelOpen ? 'fill' : 'regular'} size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Source Control</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => splitPane(activeTabId)}
                disabled={isWelcome}
                className={`p-2 rounded-md transition-colors ${
                  isWelcome
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <SplitHorizontal size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Split Terminal</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCommandPalette}
                className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Command className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Command Palette (Ctrl+Shift+P)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mt-auto flex flex-col items-center gap-2">
          <GitHubProfilePopover />
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={openShortcutsModal}
                  className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <Keyboard className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Keyboard Shortcuts (Ctrl+Shift+K)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={openAiSettings}
                  className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <GearSix size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">AI Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      <AISettingsModal />
    </>
  );
};
