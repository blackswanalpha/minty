import { Plus, Minus } from '@phosphor-icons/react';
import type { GitFileChange } from '@/types/git';

const statusColors: Record<string, string> = {
  modified: 'text-yellow-500',
  added: 'text-green-500',
  deleted: 'text-red-500',
  renamed: 'text-blue-500',
  untracked: 'text-green-400',
  conflicted: 'text-orange-500',
};

const statusLabels: Record<string, string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  renamed: 'R',
  untracked: 'U',
  conflicted: 'C',
};

interface Props {
  file: GitFileChange;
  onToggleStage: (file: GitFileChange) => void;
  onViewDiff: (file: GitFileChange) => void;
}

export function GitFileChangeItem({ file, onToggleStage, onViewDiff }: Props) {
  const fileName = file.path.split('/').pop() || file.path;
  const dirPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';

  return (
    <div className="group flex items-center gap-1.5 px-3 py-1 hover:bg-accent/30 transition-colors text-xs">
      <span className={`font-mono font-bold text-[10px] w-3 shrink-0 ${statusColors[file.status] || 'text-muted-foreground'}`}>
        {statusLabels[file.status] || '?'}
      </span>
      <button
        onClick={() => onViewDiff(file)}
        className="flex-1 min-w-0 text-left truncate text-foreground/80 hover:text-foreground"
        title={file.path}
      >
        <span>{fileName}</span>
        {dirPath && <span className="text-muted-foreground ml-1">{dirPath}/</span>}
      </button>
      <button
        onClick={() => onToggleStage(file)}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
        title={file.staged ? 'Unstage' : 'Stage'}
      >
        {file.staged ? <Minus size={12} /> : <Plus size={12} />}
      </button>
    </div>
  );
}
