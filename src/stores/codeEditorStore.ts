import { create } from 'zustand';
import { toast } from 'sonner';

export interface EditorTab {
  filePath: string;
  fileName: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  language: string;
}

export interface EditorTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  isExpanded: boolean;
  children: EditorTreeNode[];
}

interface CodeEditorState {
  isOpen: boolean;
  rootPath: string;
  treeNodes: EditorTreeNode[];
  openTabs: EditorTab[];
  activeTabPath: string | null;

  openModal: (filePath: string, rootPath: string) => Promise<void>;
  closeModal: () => void;
  openFile: (filePath: string) => Promise<void>;
  closeTab: (filePath: string) => void;
  updateContent: (filePath: string, content: string) => void;
  saveFile: (filePath: string) => Promise<boolean>;
  saveActiveFile: () => Promise<boolean>;
  loadTree: (dirPath: string) => Promise<EditorTreeNode[]>;
  toggleTreeNode: (dirPath: string) => Promise<void>;
  hasUnsavedChanges: () => boolean;
}

function getExtension(filePath: string): string {
  return filePath.includes('.') ? '.' + filePath.split('.').pop()!.toLowerCase() : '';
}

function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

async function loadDirectoryChildren(dirPath: string): Promise<EditorTreeNode[]> {
  const result = await window.ipcRenderer.invoke('list-directory', dirPath, { showHidden: false }) as {
    success: boolean;
    entries: Array<{ name: string; path: string; isDirectory: boolean }>;
  };
  if (!result.success) return [];

  return result.entries
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      isDirectory: entry.isDirectory,
      isExpanded: false,
      children: [],
    }));
}

function updateTreeNodeRecursive(
  nodes: EditorTreeNode[],
  targetPath: string,
  updater: (node: EditorTreeNode) => EditorTreeNode
): EditorTreeNode[] {
  return nodes.map((node) => {
    if (node.path === targetPath) {
      return updater(node);
    }
    if (node.children.length > 0) {
      return { ...node, children: updateTreeNodeRecursive(node.children, targetPath, updater) };
    }
    return node;
  });
}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => ({
  isOpen: false,
  rootPath: '',
  treeNodes: [],
  openTabs: [],
  activeTabPath: null,

  openModal: async (filePath: string, rootPath: string) => {
    const treeNodes = await get().loadTree(rootPath);
    set({ isOpen: true, rootPath, treeNodes });
    await get().openFile(filePath);
  },

  closeModal: () => {
    set({
      isOpen: false,
      rootPath: '',
      treeNodes: [],
      openTabs: [],
      activeTabPath: null,
    });
  },

  openFile: async (filePath: string) => {
    const { openTabs } = get();

    // If tab already open, just activate it
    const existing = openTabs.find((t) => t.filePath === filePath);
    if (existing) {
      set({ activeTabPath: filePath });
      return;
    }

    // Read file via IPC
    const result = await window.ipcRenderer.invoke('read-file', filePath) as {
      success: boolean;
      content?: string;
      error?: string;
    };

    if (!result.success) {
      toast.error(result.error || 'Failed to open file');
      return;
    }

    const content = result.content || '';
    const newTab: EditorTab = {
      filePath,
      fileName: getFileName(filePath),
      content,
      originalContent: content,
      isDirty: false,
      language: getExtension(filePath),
    };

    set((state) => ({
      openTabs: [...state.openTabs, newTab],
      activeTabPath: filePath,
    }));
  },

  closeTab: (filePath: string) => {
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t.filePath !== filePath);
      let newActive = state.activeTabPath;
      if (state.activeTabPath === filePath) {
        const idx = state.openTabs.findIndex((t) => t.filePath === filePath);
        newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.filePath ?? null;
      }
      return { openTabs: newTabs, activeTabPath: newActive };
    });
  },

  updateContent: (filePath: string, content: string) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.filePath === filePath
          ? { ...t, content, isDirty: content !== t.originalContent }
          : t
      ),
    }));
  },

  saveFile: async (filePath: string) => {
    const tab = get().openTabs.find((t) => t.filePath === filePath);
    if (!tab) return false;

    const result = await window.ipcRenderer.invoke('write-file', filePath, tab.content) as {
      success: boolean;
      error?: string;
    };

    if (result.success) {
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.filePath === filePath
            ? { ...t, originalContent: t.content, isDirty: false }
            : t
        ),
      }));
      return true;
    } else {
      toast.error(result.error || 'Failed to save file');
      return false;
    }
  },

  saveActiveFile: async () => {
    const { activeTabPath } = get();
    if (!activeTabPath) return false;
    return get().saveFile(activeTabPath);
  },

  loadTree: async (dirPath: string) => {
    const children = await loadDirectoryChildren(dirPath);
    return children;
  },

  toggleTreeNode: async (dirPath: string) => {
    const { treeNodes } = get();
    const findNode = (nodes: EditorTreeNode[]): EditorTreeNode | null => {
      for (const node of nodes) {
        if (node.path === dirPath) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    const target = findNode(treeNodes);
    if (!target || !target.isDirectory) return;

    if (target.isExpanded) {
      // Collapse
      set({
        treeNodes: updateTreeNodeRecursive(treeNodes, dirPath, (node) => ({
          ...node,
          isExpanded: false,
        })),
      });
    } else {
      // Expand - load children
      const children = await loadDirectoryChildren(dirPath);
      set({
        treeNodes: updateTreeNodeRecursive(treeNodes, dirPath, (node) => ({
          ...node,
          isExpanded: true,
          children,
        })),
      });
    }
  },

  hasUnsavedChanges: () => {
    return get().openTabs.some((t) => t.isDirty);
  },
}));
