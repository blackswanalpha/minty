import { ArrowUp, ArrowDown, Check, Plus } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { GitFileChangeItem } from './GitFileChangeItem';
import type { GitFileChange } from '@/types/git';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GitChangesSection() {
  const status = useGitStore(s => s.status);
  const commitMessage = useGitStore(s => s.commitMessage);
  const setCommitMessage = useGitStore(s => s.setCommitMessage);
  const commit = useGitStore(s => s.commit);
  const push = useGitStore(s => s.push);
  const pull = useGitStore(s => s.pull);
  const stageFiles = useGitStore(s => s.stageFiles);
  const unstageFiles = useGitStore(s => s.unstageFiles);
  const stageAll = useGitStore(s => s.stageAll);
  const loadDiff = useGitStore(s => s.loadDiff);
  const isCommitting = useGitStore(s => s.isCommitting);
  const isPushing = useGitStore(s => s.isPushing);
  const isPulling = useGitStore(s => s.isPulling);

  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );
  const cwd = activeTab?.cwd || '';

  const handleToggleStage = (file: GitFileChange) => {
    if (file.staged) {
      unstageFiles(cwd, [file.path]);
    } else {
      stageFiles(cwd, [file.path]);
    }
  };

  const handleViewDiff = (file: GitFileChange) => {
    loadDiff(cwd, file.path, file.staged);
  };

  const handleCommit = () => commit(cwd);
  const handlePush = () => push(cwd);
  const handlePull = () => pull(cwd);
  const handleStageAll = () => stageAll(cwd);

  const stagedFiles = status?.staged || [];
  const unstagedFiles = [...(status?.unstaged || []), ...(status?.untracked || [])];
  const conflictedFiles = status?.conflicted || [];
  const totalChanges = stagedFiles.length + unstagedFiles.length + conflictedFiles.length;

  if (totalChanges === 0 && !status?.ahead && !status?.behind) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">
          No changes detected
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {/* Conflicted Files */}
        {conflictedFiles.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-orange-500 flex items-center justify-between">
              <span>Conflicts ({conflictedFiles.length})</span>
            </div>
            {conflictedFiles.map(file => (
              <GitFileChangeItem
                key={`c-${file.path}`}
                file={file}
                onToggleStage={handleToggleStage}
                onViewDiff={handleViewDiff}
              />
            ))}
          </div>
        )}

        {/* Staged Files */}
        {stagedFiles.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Staged ({stagedFiles.length})
            </div>
            {stagedFiles.map(file => (
              <GitFileChangeItem
                key={`s-${file.path}`}
                file={file}
                onToggleStage={handleToggleStage}
                onViewDiff={handleViewDiff}
              />
            ))}
          </div>
        )}

        {/* Unstaged / Untracked Files */}
        {unstagedFiles.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Changes ({unstagedFiles.length})</span>
              <button
                onClick={handleStageAll}
                className="p-0.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Stage All"
              >
                <Plus size={12} />
              </button>
            </div>
            {unstagedFiles.map(file => (
              <GitFileChangeItem
                key={`u-${file.path}`}
                file={file}
                onToggleStage={handleToggleStage}
                onViewDiff={handleViewDiff}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Commit area */}
      <div className="border-t border-border p-2 space-y-2">
        <textarea
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          className="w-full text-xs bg-secondary/50 border border-border rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          rows={2}
        />
        <div className="flex gap-1.5">
          <button
            onClick={handleCommit}
            disabled={isCommitting || stagedFiles.length === 0 || !commitMessage.trim()}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={12} />
            {isCommitting ? 'Committing...' : 'Commit'}
          </button>
          <button
            onClick={handlePush}
            disabled={isPushing}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Push"
          >
            <ArrowUp size={12} />
            {status?.ahead ? <span className="text-[10px]">{status.ahead}</span> : null}
          </button>
          <button
            onClick={handlePull}
            disabled={isPulling}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Pull"
          >
            <ArrowDown size={12} />
            {status?.behind ? <span className="text-[10px]">{status.behind}</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
