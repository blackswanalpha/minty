import { useMemo } from 'react';
import { FileExplorerItem } from './FileExplorerItem';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import type { FileEntry } from '@/types/fileExplorer';

export function FileExplorerList() {
  const entries = useFileExplorerStore((s) => s.entries);
  const sortField = useFileExplorerStore((s) => s.sortField);
  const sortDirection = useFileExplorerStore((s) => s.sortDirection);

  const sortedEntries = useMemo(() => {
    const dirs: FileEntry[] = [];
    const files: FileEntry[] = [];
    for (const entry of entries) {
      if (entry.isDirectory) dirs.push(entry);
      else files.push(entry);
    }

    const compare = (a: FileEntry, b: FileEntry) => {
      let result: number;
      switch (sortField) {
        case 'size':
          result = a.size - b.size;
          break;
        case 'modifiedAt':
          result = a.modifiedAt - b.modifiedAt;
          break;
        default:
          result = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      return sortDirection === 'desc' ? -result : result;
    };

    dirs.sort(compare);
    files.sort(compare);

    return [...dirs, ...files];
  }, [entries, sortField, sortDirection]);

  if (sortedEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Empty directory
      </div>
    );
  }

  return (
    <div className="py-1">
      {sortedEntries.map((entry) => (
        <FileExplorerItem key={entry.path} entry={entry} />
      ))}
    </div>
  );
}
