import { Pencil, Trash } from '@phosphor-icons/react';
import type { GitRemote } from '@/types/git';

interface Props {
  remote: GitRemote;
  onEdit: (name: string) => void;
  onRemove: (name: string) => void;
}

export function GitRemoteItem({ remote, onEdit, onRemove }: Props) {
  return (
    <div className="group px-3 py-2 hover:bg-accent/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{remote.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
          <button
            onClick={() => onEdit(remote.name)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Edit URL"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onRemove(remote.name)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-red-500"
            title="Remove"
          >
            <Trash size={12} />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
        {remote.fetchUrl}
      </p>
    </div>
  );
}
