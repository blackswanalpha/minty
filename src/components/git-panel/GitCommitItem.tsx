import type { GitCommit } from '@/types/git';

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface Props {
  commit: GitCommit;
}

export function GitCommitItem({ commit }: Props) {
  return (
    <div className="px-3 py-2 hover:bg-accent/30 transition-colors border-b border-border/50">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-foreground line-clamp-2 flex-1">{commit.message}</p>
        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
          {commit.hashShort}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
        <span>{commit.author}</span>
        <span>·</span>
        <span>{relativeDate(commit.date)}</span>
      </div>
    </div>
  );
}
