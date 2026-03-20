import { formatDistanceToNow } from 'date-fns';
import { getFileIcon } from './fileIcons';
import type { FileEntry } from '@/types/fileExplorer';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import { useCodeEditorStore } from '@/stores/codeEditorStore';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface FileExplorerItemProps {
  entry: FileEntry;
}

export function FileExplorerItem({ entry }: FileExplorerItemProps) {
  const navigateTo = useFileExplorerStore((s) => s.navigateTo);
  const currentPath = useFileExplorerStore((s) => s.currentPath);
  const { icon: IconComponent, className: iconClassName } = getFileIcon(
    entry.name,
    entry.isDirectory,
    entry.isSymlink
  );

  const handleClick = () => {
    if (entry.isDirectory) {
      navigateTo(entry.path);
    } else {
      useCodeEditorStore.getState().openModal(entry.path, currentPath);
    }
  };

  const modifiedLabel = entry.modifiedAt
    ? formatDistanceToNow(new Date(entry.modifiedAt), { addSuffix: true })
    : '';

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent/50 rounded-sm transition-colors text-left ${
        'cursor-pointer'
      }`}
    >
      <IconComponent weight="fill" size={16} className={`shrink-0 ${iconClassName}`} />
      <span className="truncate flex-1 text-foreground">{entry.name}</span>
      {!entry.isDirectory && (
        <span className="text-xs text-muted-foreground shrink-0">{formatSize(entry.size)}</span>
      )}
      {modifiedLabel && (
        <span className="text-xs text-muted-foreground shrink-0 hidden xl:inline">
          {modifiedLabel}
        </span>
      )}
    </button>
  );
}
