import {
  FolderSimple,
  FolderOpen,
  FileTs,
  FileJs,
  BracketsCurly,
  FilePy,
  FileCss,
  FileHtml,
  FileImage,
  FileArchive,
  LinkSimple,
  File,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

interface FileIconInfo {
  icon: Icon;
  className: string;
}

const extensionMap: Record<string, FileIconInfo> = {
  '.ts': { icon: FileTs, className: 'text-blue-400' },
  '.tsx': { icon: FileTs, className: 'text-blue-400' },
  '.js': { icon: FileJs, className: 'text-yellow-400' },
  '.jsx': { icon: FileJs, className: 'text-yellow-400' },
  '.mjs': { icon: FileJs, className: 'text-yellow-400' },
  '.cjs': { icon: FileJs, className: 'text-yellow-400' },
  '.json': { icon: BracketsCurly, className: 'text-terminal-green' },
  '.py': { icon: FilePy, className: 'text-blue-300' },
  '.css': { icon: FileCss, className: 'text-terminal-cyan' },
  '.scss': { icon: FileCss, className: 'text-terminal-cyan' },
  '.html': { icon: FileHtml, className: 'text-orange-400' },
  '.htm': { icon: FileHtml, className: 'text-orange-400' },
  '.png': { icon: FileImage, className: 'text-terminal-purple' },
  '.jpg': { icon: FileImage, className: 'text-terminal-purple' },
  '.jpeg': { icon: FileImage, className: 'text-terminal-purple' },
  '.gif': { icon: FileImage, className: 'text-terminal-purple' },
  '.svg': { icon: FileImage, className: 'text-terminal-purple' },
  '.webp': { icon: FileImage, className: 'text-terminal-purple' },
  '.ico': { icon: FileImage, className: 'text-terminal-purple' },
  '.zip': { icon: FileArchive, className: 'text-terminal-red' },
  '.tar': { icon: FileArchive, className: 'text-terminal-red' },
  '.gz': { icon: FileArchive, className: 'text-terminal-red' },
  '.rar': { icon: FileArchive, className: 'text-terminal-red' },
  '.7z': { icon: FileArchive, className: 'text-terminal-red' },
};

export function getFileIcon(
  name: string,
  isDirectory: boolean,
  isSymlink: boolean,
  isOpen?: boolean
): FileIconInfo {
  if (isSymlink) {
    return { icon: LinkSimple, className: 'text-terminal-purple' };
  }
  if (isDirectory) {
    return isOpen
      ? { icon: FolderOpen, className: 'text-terminal-amber' }
      : { icon: FolderSimple, className: 'text-terminal-amber' };
  }
  const ext = name.includes('.') ? '.' + name.split('.').pop()!.toLowerCase() : '';
  return extensionMap[ext] || { icon: File, className: 'text-muted-foreground' };
}
