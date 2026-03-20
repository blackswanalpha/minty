import { create } from 'zustand';
import type { FileEntry, ListDirectoryResult } from '@/types/fileExplorer';

interface FileExplorerState {
  isOpen: boolean;
  currentPath: string;
  entries: FileEntry[];
  isLoading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
  showHidden: boolean;
  sortField: 'name' | 'size' | 'modifiedAt';
  sortDirection: 'asc' | 'desc';

  toggle: () => void;
  open: () => void;
  close: () => void;
  loadDirectory: (path: string) => Promise<void>;
  navigateTo: (path: string) => Promise<void>;
  navigateUp: () => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleHidden: () => void;
  setSort: (field: 'name' | 'size' | 'modifiedAt') => void;
}

export const useFileExplorerStore = create<FileExplorerState>((set, get) => ({
  isOpen: false,
  currentPath: '',
  entries: [],
  isLoading: false,
  error: null,
  history: [],
  historyIndex: -1,
  showHidden: false,
  sortField: 'name',
  sortDirection: 'asc',

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  loadDirectory: async (dirPath: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.ipcRenderer.invoke(
        'list-directory',
        dirPath,
        { showHidden: get().showHidden }
      ) as ListDirectoryResult;
      if (result.success) {
        set({
          entries: result.entries,
          currentPath: result.path || dirPath,
          isLoading: false,
        });
      } else {
        set({ error: result.error || 'Failed to list directory', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to list directory',
        isLoading: false,
      });
    }
  },

  navigateTo: async (dirPath: string) => {
    const { history, historyIndex } = get();
    const newHistory = [...history.slice(0, historyIndex + 1), dirPath];
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
    await get().loadDirectory(dirPath);
  },

  navigateUp: async () => {
    const { currentPath } = get();
    if (!currentPath || currentPath === '/') return;
    const parentPath = currentPath.replace(/\/[^/]+\/?$/, '') || '/';
    await get().navigateTo(parentPath);
  },

  goBack: async () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex });
    await get().loadDirectory(history[newIndex]);
  },

  goForward: async () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex });
    await get().loadDirectory(history[newIndex]);
  },

  refresh: async () => {
    const { currentPath } = get();
    if (currentPath) {
      await get().loadDirectory(currentPath);
    }
  },

  toggleHidden: () => {
    set((state) => ({ showHidden: !state.showHidden }));
    const { currentPath } = get();
    if (currentPath) {
      get().loadDirectory(currentPath);
    }
  },

  setSort: (field: 'name' | 'size' | 'modifiedAt') => {
    set((state) => ({
      sortField: field,
      sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  },
}));
