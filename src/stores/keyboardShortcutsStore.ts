import { create } from 'zustand';

export interface KeyboardShortcut {
  id: string;
  label: string;
  description: string;
  keys: string; // e.g. "Ctrl+Shift+P"
  category: 'terminal' | 'tabs' | 'panels' | 'general';
  action: string; // action identifier
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // General
  { id: 'command-palette', label: 'Command Palette', description: 'Open the command palette', keys: 'Ctrl+Shift+P', category: 'general', action: 'command-palette' },
  { id: 'terminal-search', label: 'Search Terminal', description: 'Search terminal output', keys: 'Ctrl+Shift+F', category: 'terminal', action: 'terminal-search' },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', description: 'Open keyboard shortcuts settings', keys: 'Ctrl+Shift+K', category: 'general', action: 'keyboard-shortcuts' },

  // Tabs
  { id: 'new-tab', label: 'New Tab', description: 'Open a new terminal tab', keys: 'Ctrl+T', category: 'tabs', action: 'new-tab' },
  { id: 'close-tab', label: 'Close Tab', description: 'Close the active tab', keys: 'Ctrl+W', category: 'tabs', action: 'close-tab' },
  { id: 'next-tab', label: 'Next Tab', description: 'Switch to the next tab', keys: 'Ctrl+Tab', category: 'tabs', action: 'next-tab' },
  { id: 'prev-tab', label: 'Previous Tab', description: 'Switch to the previous tab', keys: 'Ctrl+Shift+Tab', category: 'tabs', action: 'prev-tab' },

  // Terminal
  { id: 'clear-terminal', label: 'Clear Terminal', description: 'Clear terminal output', keys: 'Ctrl+Shift+L', category: 'terminal', action: 'clear-terminal' },
  { id: 'split-terminal', label: 'Split Terminal', description: 'Split the active terminal pane', keys: 'Ctrl+Shift+D', category: 'terminal', action: 'split-terminal' },
  { id: 'copy', label: 'Copy', description: 'Copy selected text', keys: 'Ctrl+Shift+C', category: 'terminal', action: 'copy' },
  { id: 'paste', label: 'Paste', description: 'Paste from clipboard', keys: 'Ctrl+Shift+V', category: 'terminal', action: 'paste' },

  // Panels
  { id: 'toggle-file-explorer', label: 'Toggle File Explorer', description: 'Show/hide the file explorer', keys: 'Ctrl+B', category: 'panels', action: 'toggle-file-explorer' },
  { id: 'toggle-enhance-prompt', label: 'Toggle Enhance Prompt', description: 'Show/hide the AI prompt panel', keys: 'Ctrl+Shift+E', category: 'panels', action: 'toggle-enhance-prompt' },
  { id: 'ai-settings', label: 'AI Settings', description: 'Open AI settings', keys: 'Ctrl+,', category: 'panels', action: 'ai-settings' },
];

interface KeyboardShortcutsState {
  shortcuts: KeyboardShortcut[];
  isModalOpen: boolean;
  editingId: string | null;

  openModal: () => void;
  closeModal: () => void;
  setEditingId: (id: string | null) => void;
  updateShortcut: (id: string, keys: string) => void;
  resetToDefaults: () => void;
  getShortcutByAction: (action: string) => KeyboardShortcut | undefined;
  loadShortcuts: () => void;
}

const STORAGE_KEY = 'minty-keyboard-shortcuts';

const loadFromStorage = (): KeyboardShortcut[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as KeyboardShortcut[];
      // Merge with defaults to pick up any new shortcuts added in updates
      const mergedMap = new Map(DEFAULT_SHORTCUTS.map(s => [s.id, { ...s }]));
      for (const s of parsed) {
        if (mergedMap.has(s.id)) {
          mergedMap.set(s.id, { ...mergedMap.get(s.id)!, keys: s.keys });
        }
      }
      return Array.from(mergedMap.values());
    }
  } catch {
    // ignore
  }
  return DEFAULT_SHORTCUTS.map(s => ({ ...s }));
};

const saveToStorage = (shortcuts: KeyboardShortcut[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch {
    // ignore
  }
};

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>((set, get) => ({
  shortcuts: loadFromStorage(),
  isModalOpen: false,
  editingId: null,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, editingId: null }),
  setEditingId: (id) => set({ editingId: id }),

  updateShortcut: (id, keys) => {
    set((state) => {
      const updated = state.shortcuts.map(s =>
        s.id === id ? { ...s, keys } : s
      );
      saveToStorage(updated);
      return { shortcuts: updated, editingId: null };
    });
  },

  resetToDefaults: () => {
    const defaults = DEFAULT_SHORTCUTS.map(s => ({ ...s }));
    saveToStorage(defaults);
    set({ shortcuts: defaults, editingId: null });
  },

  getShortcutByAction: (action) => {
    return get().shortcuts.find(s => s.action === action);
  },

  loadShortcuts: () => {
    set({ shortcuts: loadFromStorage() });
  },
}));

// Utility: parse a shortcut string like "Ctrl+Shift+P" into a matchable form
export const matchesShortcut = (e: KeyboardEvent, shortcutKeys: string): boolean => {
  const parts = shortcutKeys.split('+').map(p => p.trim().toLowerCase());

  const needsCtrl = parts.includes('ctrl');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt');
  const needsMeta = parts.includes('meta');

  // The actual key is the last non-modifier part
  const key = parts.filter(p => !['ctrl', 'shift', 'alt', 'meta'].includes(p)).pop() || '';

  if (e.ctrlKey !== needsCtrl) return false;
  if (e.shiftKey !== needsShift) return false;
  if (e.altKey !== needsAlt) return false;
  if (e.metaKey !== needsMeta) return false;

  const eventKey = e.key.toLowerCase();

  // Handle special key names
  if (key === 'tab') return eventKey === 'tab';
  if (key === ',') return eventKey === ',';
  if (key === '.') return eventKey === '.';

  return eventKey === key;
};

// Format a recorded key event into a shortcut string
export const formatKeyCombo = (e: KeyboardEvent): string | null => {
  const modifiers: string[] = [];
  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.shiftKey) modifiers.push('Shift');
  if (e.altKey) modifiers.push('Alt');
  if (e.metaKey) modifiers.push('Meta');

  const key = e.key;
  // Ignore standalone modifier keys
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return null;

  // Need at least one modifier
  if (modifiers.length === 0) return null;

  const keyName = key.length === 1 ? key.toUpperCase() : key;
  return [...modifiers, keyName].join('+');
};
