export interface GitFileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'conflicted';
  staged: boolean;
}

export interface GitStatus {
  isRepo: boolean;
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  untracked: GitFileChange[];
  conflicted: GitFileChange[];
}

export interface GitCommit {
  hash: string;
  hashShort: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  refs: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
  tracking: string;
}

export interface GitRemote {
  name: string;
  fetchUrl: string;
  pushUrl: string;
}

export interface GitDiffFile {
  file: string;
  insertions: number;
  deletions: number;
  binary: boolean;
}

export interface GitDiffResult {
  files: GitDiffFile[];
  rawDiff: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
}

export interface GitHubAuthState {
  isConnected: boolean;
  user: GitHubUser | null;
  token: string;
  method: 'pat' | 'oauth';
}

export interface GitResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
