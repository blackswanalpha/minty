import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const MAX_TABS = 20;

export interface Pane {
  id: string;       // Unique ID, doubles as PTY key
  cwd: string;
  isReady: boolean;
}

export interface Tab {
  id: string;
  title: string;
  cwd: string;
  isReady: boolean;
  type?: 'terminal' | 'welcome';
  isTerminalActive?: boolean;
  panes?: Pane[];
  activePaneId?: string;
}

interface TerminalState {
  tabs: Tab[];
  activeTabId: string;
  homeDir: string;
  isInitialized: boolean;

  // Actions
  setHomeDir: (homeDir: string) => void;
  setInitialized: (initialized: boolean) => void;
  addTab: (tab: Partial<Tab> & { title: string; cwd: string }) => string;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setActiveTab: (id: string) => void;
  getActiveTab: () => Tab | undefined;
  reorderTabs: (activeId: string, overId: string) => void;
  clearAllTabs: () => void;

  // Pane actions
  splitPane: (tabId: string) => void;
  closePane: (tabId: string, paneId: string) => void;
  setActivePane: (tabId: string, paneId: string) => void;
  getActivePaneId: (tabId: string) => string;
  getPanes: (tabId: string) => Pane[];
  updatePane: (tabId: string, paneId: string, updates: Partial<Pane>) => void;
}

const singlePaneCache = new Map<string, { pane: Pane[]; cwd: string; isReady: boolean }>();

export const useTerminalStore = create<TerminalState>((set, get) => ({
  tabs: [],
  activeTabId: '',
  homeDir: '',
  isInitialized: false,

  setHomeDir: (homeDir: string) => {
    try {
      set({ homeDir });
    } catch (error) {
      console.error('Failed to set home directory:', error);
    }
  },

  setInitialized: (initialized: boolean) => {
    try {
      set({ isInitialized: initialized });
    } catch (error) {
      console.error('Failed to set initialization state:', error);
    }
  },

  addTab: (tabData) => {
    try {
      const id = tabData.id || uuidv4();
      const newTab: Tab = {
        isReady: false,
        ...tabData,
        id
      };

      set((state) => {
        // Prevent duplicate tabs with the same ID
        if (state.tabs.some(t => t.id === id)) {
          return { activeTabId: id };
        }
        const newTabs = [...state.tabs, newTab];
        return {
          tabs: newTabs,
          activeTabId: id
        };
      });

      return id;
    } catch (error) {
      console.error('Failed to add tab:', error);
      throw error;
    }
  },

  removeTab: (id) => {
    try {
      singlePaneCache.delete(id);
      set((state) => {
        if (state.tabs.length === 1) return state; // Don't remove last tab

        const newTabs = state.tabs.filter(t => t.id !== id);
        let newActiveTabId = state.activeTabId;

        if (state.activeTabId === id) {
          const closedIndex = state.tabs.findIndex(t => t.id === id);
          const newActiveIndex = Math.max(0, closedIndex - 1);
          newActiveTabId = newTabs[newActiveIndex]?.id || '';
        }

        return {
          tabs: newTabs,
          activeTabId: newActiveTabId
        };
      });
    } catch (error) {
      console.error('Failed to remove tab:', error);
    }
  },

  updateTab: (id, updates) => {
    try {
      set((state) => {
        // First try direct tab ID match
        const directMatch = state.tabs.some(tab => tab.id === id);
        if (directMatch) {
          return {
            tabs: state.tabs.map(tab =>
              tab.id === id ? { ...tab, ...updates } : tab
            )
          };
        }
        // Fall back to matching a pane ID within a tab (XTerminal calls
        // updateTab(paneId, { isReady: true }) and paneId may differ from tabId)
        return {
          tabs: state.tabs.map(tab => {
            if (!tab.panes) return tab;
            const paneMatch = tab.panes.some(p => p.id === id);
            if (!paneMatch) return tab;
            return {
              ...tab,
              panes: tab.panes.map(p =>
                p.id === id ? { ...p, ...updates } : p
              )
            };
          })
        };
      });
    } catch (error) {
      console.error('Failed to update tab:', error);
    }
  },

  setActiveTab: (id) => {
    try {
      set({ activeTabId: id });
    } catch (error) {
      console.error('Failed to set active tab:', error);
    }
  },

  getActiveTab: () => {
    try {
      const state = get();
      return state.tabs.find(t => t.id === state.activeTabId);
    } catch (error) {
      console.error('Failed to get active tab:', error);
      return undefined;
    }
  },

  reorderTabs: (activeId, overId) => {
    try {
      set((state) => {
        const oldIndex = state.tabs.findIndex((t) => t.id === activeId);
        const newIndex = state.tabs.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;
        const newTabs = [...state.tabs];
        const [moved] = newTabs.splice(oldIndex, 1);
        newTabs.splice(newIndex, 0, moved);
        return { tabs: newTabs };
      });
    } catch (error) {
      console.error('Failed to reorder tabs:', error);
    }
  },

  clearAllTabs: () => {
    try {
      set({ tabs: [], activeTabId: '' });
    } catch (error) {
      console.error('Failed to clear tabs:', error);
    }
  },

  splitPane: (tabId: string) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab || tab.type === 'welcome') return;

    const newPaneId = uuidv4();
    const currentCwd = tab.cwd;

    set((state) => ({
      tabs: state.tabs.map(t => {
        if (t.id !== tabId) return t;
        // If no panes yet, initialize with the existing tab as the first pane
        const existingPanes: Pane[] = t.panes || [{ id: t.id, cwd: t.cwd, isReady: true }];
        const newPane: Pane = { id: newPaneId, cwd: currentCwd, isReady: false };
        return { ...t, panes: [...existingPanes, newPane], activePaneId: newPaneId };
      })
    }));

    // Initialize PTY for the new pane
    window.ipcRenderer.invoke('init-tab', newPaneId, currentCwd);
  },

  closePane: (tabId: string, paneId: string) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab?.panes || tab.panes.length <= 1) return;

    // Remove PTY for the closed pane
    window.ipcRenderer.invoke('remove-tab', paneId).catch(() => {});

    set((state) => ({
      tabs: state.tabs.map(t => {
        if (t.id !== tabId || !t.panes) return t;
        const remaining = t.panes.filter(p => p.id !== paneId);
        if (remaining.length === 0) return t;
        const newActivePaneId = t.activePaneId === paneId
          ? remaining[remaining.length - 1].id
          : t.activePaneId;
        const activePane = remaining.find(p => p.id === newActivePaneId) || remaining[0];
        return {
          ...t,
          panes: remaining,
          activePaneId: newActivePaneId,
          cwd: activePane.cwd,
          title: activePane.cwd.split('/').pop() || 'unknown'
        };
      })
    }));
  },

  setActivePane: (tabId: string, paneId: string) => {
    set((state) => ({
      tabs: state.tabs.map(t => {
        if (t.id !== tabId) return t;
        const pane = t.panes?.find(p => p.id === paneId);
        return {
          ...t,
          activePaneId: paneId,
          ...(pane ? { cwd: pane.cwd } : {})
        };
      })
    }));
  },

  getActivePaneId: (tabId: string) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    return tab?.activePaneId || tabId;
  },

  getPanes: (tabId: string) => {
    const state = get();
    const tab = state.tabs.find(t => t.id === tabId);
    if (tab?.panes && tab.panes.length > 0) return tab.panes;
    if (tab) {
      const cached = singlePaneCache.get(tabId);
      if (cached && cached.cwd === tab.cwd && cached.isReady === tab.isReady) {
        return cached.pane;
      }
      const pane = [{ id: tab.id, cwd: tab.cwd, isReady: tab.isReady }];
      singlePaneCache.set(tabId, { pane, cwd: tab.cwd, isReady: tab.isReady });
      return pane;
    }
    return [];
  },

  updatePane: (tabId: string, paneId: string, updates: Partial<Pane>) => {
    set((state) => ({
      tabs: state.tabs.map(t => {
        if (t.id !== tabId) return t;
        if (!t.panes) {
          // Legacy single-pane tab — update tab directly if paneId matches
          if (paneId === t.id) {
            return { ...t, ...updates };
          }
          return t;
        }
        return {
          ...t,
          panes: t.panes.map(p => p.id === paneId ? { ...p, ...updates } : p)
        };
      })
    }));
  }
}));