import { useGitStore } from '@/stores/gitStore';
import { GitPanelToolbar } from './GitPanelToolbar';
import { GitNotARepoView } from './GitNotARepoView';
import { GitChangesSection } from './GitChangesSection';
import { GitCommitsSection } from './GitCommitsSection';
import { GitBranchesSection } from './GitBranchesSection';
import { GitRemotesSection } from './GitRemotesSection';
import { GitCloneSection } from './GitCloneSection';
import { GitDiffViewer } from './GitDiffViewer';

export function GitPanel() {
  const isRepo = useGitStore(s => s.isRepo);
  const activeSection = useGitStore(s => s.activeSection);
  const error = useGitStore(s => s.error);

  const renderSection = () => {
    // Clone section works regardless of repo status
    if (activeSection === 'clone') return <GitCloneSection />;

    if (!isRepo) return <GitNotARepoView />;

    switch (activeSection) {
      case 'changes': return <GitChangesSection />;
      case 'commits': return <GitCommitsSection />;
      case 'branches': return <GitBranchesSection />;
      case 'remotes': return <GitRemotesSection />;
      default: return <GitChangesSection />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <GitPanelToolbar />
      {error && (
        <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20">
          <p className="text-[10px] text-destructive">{error}</p>
        </div>
      )}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderSection()}
      </div>
      <GitDiffViewer />
    </div>
  );
}
