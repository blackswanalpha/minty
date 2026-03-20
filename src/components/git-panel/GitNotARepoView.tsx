import { GitBranch } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';

export function GitNotARepoView() {
  const initRepo = useGitStore(s => s.initRepo);
  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );

  const handleInit = async () => {
    if (activeTab?.cwd) {
      await initRepo(activeTab.cwd);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <GitBranch size={48} className="text-muted-foreground/40 mb-4" />
      <h3 className="text-sm font-medium text-foreground mb-1">
        Not a Git Repository
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        The current directory is not tracked by Git.
      </p>
      <button
        onClick={handleInit}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Initialize Repository
      </button>
    </div>
  );
}
