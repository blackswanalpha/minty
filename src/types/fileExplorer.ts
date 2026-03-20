export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isSymlink: boolean;
  size: number;
  modifiedAt: number;
}

export interface ListDirectoryResult {
  success: boolean;
  path?: string;
  entries: FileEntry[];
  error?: string;
}
