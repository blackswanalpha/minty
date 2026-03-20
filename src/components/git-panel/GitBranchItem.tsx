import { ArrowsLeftRight, Trash, GitMerge } from '@phosphor-icons/react';
import type { GitBranch } from '@/types/git';

interface Props {
  branch: GitBranch;
  onSwitch: (name: string) => void;
  onDelete: (name: string) => void;
  onMerge: (name: string) => void;
}

export function GitBranchItem({ branch, onSwitch, onDelete, onMerge }: Props) {
  const isRemote = branch.name.startsWith('remotes/');

  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 hover:bg-accent/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {branch.current && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className={`text-xs truncate ${branch.current ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
            {branch.name}
          </span>
        </div>
        {branch.tracking && (
          <span className="text-[10px] text-muted-foreground truncate block">
            {branch.tracking}
          </span>
        )}
      </div>
      {!branch.current && !isRemote && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
          <button
            onClick={() => onSwitch(branch.name)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Switch to branch"
          >
            <ArrowsLeftRight size={12} />
          </button>
          <button
            onClick={() => onMerge(branch.name)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Merge into current"
          >
            <GitMerge size={12} />
          </button>
          <button
            onClick={() => onDelete(branch.name)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-red-500"
            title="Delete branch"
          >
            <Trash size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
