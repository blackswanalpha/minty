import { useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { GitBranchItem } from './GitBranchItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GitBranchesSection() {
  const branches = useGitStore(s => s.branches);
  const loadBranches = useGitStore(s => s.loadBranches);
  const createBranch = useGitStore(s => s.createBranch);
  const switchBranch = useGitStore(s => s.switchBranch);
  const deleteBranch = useGitStore(s => s.deleteBranch);
  const mergeBranch = useGitStore(s => s.mergeBranch);
  const activeTab = useTerminalStore(s =>
    s.tabs.find(t => t.id === s.activeTabId)
  );
  const cwd = activeTab?.cwd || '';

  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (cwd) {
      loadBranches(cwd);
    }
  }, [cwd, loadBranches]);

  const handleCreate = async () => {
    if (!newBranchName.trim() || !cwd) return;
    await createBranch(cwd, newBranchName.trim());
    setNewBranchName('');
    setShowNewBranch(false);
  };

  const localBranches = branches.filter(b => !b.name.startsWith('remotes/'));
  const remoteBranches = branches.filter(b => b.name.startsWith('remotes/'));

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-border/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Branches ({localBranches.length})
        </span>
        <button
          onClick={() => setShowNewBranch(!showNewBranch)}
          className="p-0.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
          title="New Branch"
        >
          <Plus size={14} />
        </button>
      </div>

      {showNewBranch && (
        <div className="px-3 py-2 border-b border-border/50 flex gap-1.5">
          <input
            type="text"
            value={newBranchName}
            onChange={e => setNewBranchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Branch name..."
            className="flex-1 text-xs bg-secondary/50 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!newBranchName.trim()}
            className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {/* Local branches */}
        {localBranches.map(branch => (
          <GitBranchItem
            key={branch.name}
            branch={branch}
            onSwitch={name => switchBranch(cwd, name)}
            onDelete={name => deleteBranch(cwd, name)}
            onMerge={name => mergeBranch(cwd, name)}
          />
        ))}

        {/* Remote branches */}
        {remoteBranches.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border/50 mt-1">
              Remote ({remoteBranches.length})
            </div>
            {remoteBranches.map(branch => (
              <GitBranchItem
                key={branch.name}
                branch={branch}
                onSwitch={name => switchBranch(cwd, name)}
                onDelete={name => deleteBranch(cwd, name)}
                onMerge={name => mergeBranch(cwd, name)}
              />
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
