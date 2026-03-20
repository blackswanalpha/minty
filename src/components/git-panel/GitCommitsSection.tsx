import { useEffect } from 'react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { GitCommitItem } from './GitCommitItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GitCommitsSection() {
  const commits = useGitStore(s => s.commits);
  const loadCommits = useGitStore(s => s.loadCommits);
  const isLoading = useGitStore(s => s.isLoading);
  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );
  const cwd = activeTab?.cwd || '';

  useEffect(() => {
    if (cwd) {
      loadCommits(cwd, 50);
    }
  }, [cwd, loadCommits]);

  if (isLoading && commits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Loading commits...</span>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">No commits yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {commits.map(commit => (
        <GitCommitItem key={commit.hash} commit={commit} />
      ))}
      {commits.length >= 50 && (
        <button
          onClick={() => loadCommits(cwd, commits.length + 50)}
          className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Load more...
        </button>
      )}
    </ScrollArea>
  );
}
