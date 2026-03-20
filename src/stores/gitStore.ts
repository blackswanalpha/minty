import { create } from 'zustand';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import type {
  GitStatus,
  GitCommit,
  GitBranch,
  GitRemote,
  GitDiffResult,
  GitHubUser,
  GitHubRepo,
  GitResult,
} from '@/types/git';

type ActiveSection = 'changes' | 'commits' | 'branches' | 'remotes' | 'clone';

interface GitStoreState {
  // Panel state
  isOpen: boolean;
  activeSection: ActiveSection;

  // Repo state
  isRepo: boolean;
  isLoading: boolean;
  error: string | null;
  currentPath: string;
  status: GitStatus | null;

  // Data
  commits: GitCommit[];
  branches: GitBranch[];
  remotes: GitRemote[];
  diffResult: GitDiffResult | null;
  selectedDiffFile: string | null;
  selectedDiffStaged: boolean;

  // GitHub
  githubAuth: { isConnected: boolean; user: GitHubUser | null; token: string; method: string };
  githubRepos: GitHubRepo[];

  // Forms
  commitMessage: string;
  cloneUrl: string;
  cloneTargetDir: string;

  // Loading flags
  isCommitting: boolean;
  isPushing: boolean;
  isPulling: boolean;
  isCloning: boolean;

  // Actions - Panel
  toggle: () => void;
  open: () => void;
  close: () => void;
  setActiveSection: (section: ActiveSection) => void;

  // Actions - Git
  checkIsRepo: (cwd: string) => Promise<void>;
  initRepo: (cwd: string) => Promise<void>;
  refreshStatus: (cwd: string) => Promise<void>;
  stageFiles: (cwd: string, files: string[]) => Promise<void>;
  unstageFiles: (cwd: string, files: string[]) => Promise<void>;
  stageAll: (cwd: string) => Promise<void>;
  setCommitMessage: (msg: string) => void;
  commit: (cwd: string) => Promise<void>;
  push: (cwd: string, remote?: string, branch?: string) => Promise<void>;
  pull: (cwd: string, remote?: string, branch?: string) => Promise<void>;

  // Actions - Log & Diff
  loadCommits: (cwd: string, limit?: number) => Promise<void>;
  loadDiff: (cwd: string, file: string, staged: boolean) => Promise<void>;
  clearDiff: () => void;

  // Actions - Branches
  loadBranches: (cwd: string) => Promise<void>;
  createBranch: (cwd: string, name: string) => Promise<void>;
  switchBranch: (cwd: string, name: string) => Promise<void>;
  deleteBranch: (cwd: string, name: string, force?: boolean) => Promise<void>;
  mergeBranch: (cwd: string, branch: string) => Promise<void>;

  // Actions - Remotes
  loadRemotes: (cwd: string) => Promise<void>;
  addRemote: (cwd: string, name: string, url: string) => Promise<void>;
  removeRemote: (cwd: string, name: string) => Promise<void>;
  setRemoteUrl: (cwd: string, name: string, url: string) => Promise<void>;

  // Actions - Clone
  setCloneUrl: (url: string) => void;
  setCloneTargetDir: (dir: string) => void;
  clone: () => Promise<void>;

  // Actions - GitHub
  loadGitHubAuth: () => Promise<void>;
  connectGitHub: (token: string) => Promise<void>;
  disconnectGitHub: () => Promise<void>;
  loadGitHubRepos: (page?: number) => Promise<void>;
  searchGitHubRepos: (query: string) => Promise<void>;
}

export const useGitStore = create<GitStoreState>((set, get) => ({
  // Panel state
  isOpen: false,
  activeSection: 'changes',

  // Repo state
  isRepo: false,
  isLoading: false,
  error: null,
  currentPath: '',
  status: null,

  // Data
  commits: [],
  branches: [],
  remotes: [],
  diffResult: null,
  selectedDiffFile: null,
  selectedDiffStaged: false,

  // GitHub
  githubAuth: { isConnected: false, user: null, token: '', method: 'pat' },
  githubRepos: [],

  // Forms
  commitMessage: '',
  cloneUrl: '',
  cloneTargetDir: '',

  // Loading flags
  isCommitting: false,
  isPushing: false,
  isPulling: false,
  isCloning: false,

  // Panel actions
  toggle: () => set((s) => {
    const newOpen = !s.isOpen;
    if (newOpen) {
      useFileExplorerStore.getState().close();
    }
    return { isOpen: newOpen };
  }),
  open: () => {
    useFileExplorerStore.getState().close();
    set({ isOpen: true });
  },
  close: () => set({ isOpen: false }),
  setActiveSection: (section) => set({ activeSection: section }),

  // Git actions
  checkIsRepo: async (cwd) => {
    try {
      const result = await window.ipcRenderer.invoke('git-is-repo', cwd) as GitResult<boolean>;
      if (result.success) {
        set({ isRepo: result.data ?? false, currentPath: cwd });
      }
    } catch {
      set({ isRepo: false });
    }
  },

  initRepo: async (cwd) => {
    try {
      const result = await window.ipcRenderer.invoke('git-init', cwd) as GitResult;
      if (result.success) {
        set({ isRepo: true });
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Failed to initialize repository' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initialize repository' });
    }
  },

  refreshStatus: async (cwd) => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke('git-status', cwd) as GitResult<GitStatus>;
      if (result.success && result.data) {
        set({
          status: result.data,
          isRepo: result.data.isRepo,
          currentPath: cwd,
          isLoading: false,
        });
      } else {
        set({ error: result.error || 'Failed to get status', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get status',
        isLoading: false,
      });
    }
  },

  stageFiles: async (cwd, files) => {
    try {
      await window.ipcRenderer.invoke('git-stage', cwd, files);
      await get().refreshStatus(cwd);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to stage files' });
    }
  },

  unstageFiles: async (cwd, files) => {
    try {
      await window.ipcRenderer.invoke('git-unstage', cwd, files);
      await get().refreshStatus(cwd);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to unstage files' });
    }
  },

  stageAll: async (cwd) => {
    try {
      await window.ipcRenderer.invoke('git-stage-all', cwd);
      await get().refreshStatus(cwd);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to stage all' });
    }
  },

  setCommitMessage: (msg) => set({ commitMessage: msg }),

  commit: async (cwd) => {
    const { commitMessage } = get();
    if (!commitMessage.trim()) return;
    set({ isCommitting: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke('git-commit', cwd, commitMessage) as GitResult;
      if (result.success) {
        set({ commitMessage: '', isCommitting: false });
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Commit failed', isCommitting: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Commit failed',
        isCommitting: false,
      });
    }
  },

  push: async (cwd, remote, branch) => {
    set({ isPushing: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke('git-push', cwd, remote, branch) as GitResult;
      if (result.success) {
        set({ isPushing: false });
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Push failed', isPushing: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Push failed',
        isPushing: false,
      });
    }
  },

  pull: async (cwd, remote, branch) => {
    set({ isPulling: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke('git-pull', cwd, remote, branch) as GitResult;
      if (result.success) {
        set({ isPulling: false });
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Pull failed', isPulling: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Pull failed',
        isPulling: false,
      });
    }
  },

  // Log & Diff
  loadCommits: async (cwd, limit) => {
    set({ isLoading: true });
    try {
      const result = await window.ipcRenderer.invoke('git-log', cwd, limit) as GitResult<GitCommit[]>;
      if (result.success && result.data) {
        set({ commits: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  loadDiff: async (cwd, file, staged) => {
    try {
      const result = await window.ipcRenderer.invoke('git-diff-file', cwd, file, staged) as GitResult<GitDiffResult>;
      if (result.success && result.data) {
        set({ diffResult: result.data, selectedDiffFile: file, selectedDiffStaged: staged });
      }
    } catch {
      // silently fail
    }
  },

  clearDiff: () => set({ diffResult: null, selectedDiffFile: null }),

  // Branches
  loadBranches: async (cwd) => {
    try {
      const result = await window.ipcRenderer.invoke('git-branches', cwd) as GitResult<GitBranch[]>;
      if (result.success && result.data) {
        set({ branches: result.data });
      }
    } catch {
      // silently fail
    }
  },

  createBranch: async (cwd, name) => {
    try {
      const result = await window.ipcRenderer.invoke('git-branch-create', cwd, name) as GitResult;
      if (result.success) {
        await get().loadBranches(cwd);
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Failed to create branch' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create branch' });
    }
  },

  switchBranch: async (cwd, name) => {
    try {
      const result = await window.ipcRenderer.invoke('git-branch-switch', cwd, name) as GitResult;
      if (result.success) {
        await get().loadBranches(cwd);
        await get().refreshStatus(cwd);
      } else {
        set({ error: result.error || 'Failed to switch branch' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to switch branch' });
    }
  },

  deleteBranch: async (cwd, name, force) => {
    try {
      const result = await window.ipcRenderer.invoke('git-branch-delete', cwd, name, force) as GitResult;
      if (result.success) {
        await get().loadBranches(cwd);
      } else {
        set({ error: result.error || 'Failed to delete branch' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete branch' });
    }
  },

  mergeBranch: async (cwd, branch) => {
    try {
      const result = await window.ipcRenderer.invoke('git-branch-merge', cwd, branch) as GitResult;
      if (result.success) {
        await get().refreshStatus(cwd);
        await get().loadBranches(cwd);
      } else {
        set({ error: result.error || 'Merge failed' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Merge failed' });
    }
  },

  // Remotes
  loadRemotes: async (cwd) => {
    if (!cwd) return;
    try {
      const result = await window.ipcRenderer.invoke('git-remotes', cwd) as GitResult<GitRemote[]>;
      if (result.success && result.data) {
        set({ remotes: result.data });
      } else {
        set({ remotes: [] });
      }
    } catch {
      set({ remotes: [] });
    }
  },

  addRemote: async (cwd, name, url) => {
    if (!cwd) return;
    try {
      const result = await window.ipcRenderer.invoke('git-remote-add', cwd, name, url) as GitResult;
      if (result.success) {
        await get().loadRemotes(cwd);
      } else {
        set({ error: result.error || 'Failed to add remote' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add remote' });
    }
  },

  removeRemote: async (cwd, name) => {
    if (!cwd) return;
    try {
      const result = await window.ipcRenderer.invoke('git-remote-remove', cwd, name) as GitResult;
      if (result.success) {
        await get().loadRemotes(cwd);
      } else {
        set({ error: result.error || 'Failed to remove remote' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove remote' });
    }
  },

  setRemoteUrl: async (cwd, name, url) => {
    if (!cwd) return;
    try {
      const result = await window.ipcRenderer.invoke('git-remote-set-url', cwd, name, url) as GitResult;
      if (result.success) {
        await get().loadRemotes(cwd);
      } else {
        set({ error: result.error || 'Failed to update remote URL' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update remote URL' });
    }
  },

  // Clone
  setCloneUrl: (url) => set({ cloneUrl: url }),
  setCloneTargetDir: (dir) => set({ cloneTargetDir: dir }),

  clone: async () => {
    const { cloneUrl, cloneTargetDir } = get();
    if (!cloneUrl.trim() || !cloneTargetDir.trim()) return;
    set({ isCloning: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke('git-clone', cloneUrl, cloneTargetDir) as GitResult;
      if (result.success) {
        set({ isCloning: false, cloneUrl: '', cloneTargetDir: '' });
      } else {
        set({ error: result.error || 'Clone failed', isCloning: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Clone failed',
        isCloning: false,
      });
    }
  },

  // GitHub
  loadGitHubAuth: async () => {
    try {
      const result = await window.ipcRenderer.invoke('github-get-auth') as GitResult<any>;
      if (result.success && result.data) {
        set({ githubAuth: result.data });
      }
    } catch {
      // silently fail
    }
  },

  connectGitHub: async (token) => {
    try {
      const result = await window.ipcRenderer.invoke('github-connect-pat', token) as GitResult<any>;
      if (result.success && result.data) {
        set({ githubAuth: result.data });
      } else {
        set({ error: result.error || 'Failed to connect to GitHub' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to connect to GitHub' });
    }
  },

  disconnectGitHub: async () => {
    try {
      await window.ipcRenderer.invoke('github-disconnect');
      set({ githubAuth: { isConnected: false, user: null, token: '', method: 'pat' }, githubRepos: [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to disconnect' });
    }
  },

  loadGitHubRepos: async (page) => {
    try {
      const result = await window.ipcRenderer.invoke('github-list-repos', page) as GitResult<GitHubRepo[]>;
      if (result.success && result.data) {
        set({ githubRepos: result.data });
      }
    } catch {
      // silently fail
    }
  },

  searchGitHubRepos: async (query) => {
    try {
      const result = await window.ipcRenderer.invoke('github-search-repos', query) as GitResult<GitHubRepo[]>;
      if (result.success && result.data) {
        set({ githubRepos: result.data });
      }
    } catch {
      // silently fail
    }
  },
}));
