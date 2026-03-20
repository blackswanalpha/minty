import { ArrowsClockwise, GitBranch as GitBranchIcon } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';

const sections = [
  { id: 'changes' as const, label: 'Changes' },
  { id: 'commits' as const, label: 'History' },
  { id: 'branches' as const, label: 'Branches' },
  { id: 'remotes' as const, label: 'Remotes' },
  { id: 'clone' as const, label: 'Clone' },
] as const;

export function GitPanelToolbar() {
  const activeSection = useGitStore(s => s.activeSection);
  const setActiveSection = useGitStore(s => s.setActiveSection);
  const refreshStatus = useGitStore(s => s.refreshStatus);
  const status = useGitStore(s => s.status);
  const githubAuth = useGitStore(s => s.githubAuth);
  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );

  const handleRefresh = () => {
    if (activeTab?.cwd) {
      refreshStatus(activeTab.cwd);
    }
  };

  return (
    <div className="border-b border-border">
      {/* Branch display & actions */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <GitBranchIcon size={14} className="shrink-0" />
          <span className="truncate font-medium text-foreground">
            {status?.branch || 'No branch'}
          </span>
          {(status?.ahead ?? 0) > 0 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary">
              ↑{status!.ahead}
            </span>
          )}
          {(status?.behind ?? 0) > 0 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-orange-500/10 text-orange-500">
              ↓{status!.behind}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {githubAuth.isConnected && (
            githubAuth.user?.avatarUrl ? (
              <img
                src={githubAuth.user.avatarUrl}
                alt={githubAuth.user.login}
                className="w-5 h-5 rounded-full"
                title={`GitHub: @${githubAuth.user.login}`}
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500" title="GitHub Connected" />
            )
          )}
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <ArrowsClockwise size={14} />
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-t border-border">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 px-1 py-1.5 text-[10px] font-medium transition-colors border-b-2 ${
              activeSection === section.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
