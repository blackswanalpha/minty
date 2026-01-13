import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Tab {
  id: string;
  title: string;
  cwd: string;
  isReady: boolean;
  type?: 'terminal' | 'welcome';
  isTerminalActive?: boolean;
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
  clearAllTabs: () => void;
}

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
      set((state) => ({
        tabs: state.tabs.map(tab =>
          tab.id === id ? { ...tab, ...updates } : tab
        )
      }));
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

  clearAllTabs: () => {
    try {
      set({ tabs: [], activeTabId: '' });
    } catch (error) {
      console.error('Failed to clear tabs:', error);
    }
  }
}));