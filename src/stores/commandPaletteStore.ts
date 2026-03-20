import { create } from 'zustand';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  commands: CommandItem[];

  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  registerCommands: (commands: CommandItem[]) => void;
  executeSelected: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set, get) => ({
  isOpen: false,
  searchQuery: '',
  selectedIndex: 0,
  commands: [],

  open: () => set({ isOpen: true, searchQuery: '', selectedIndex: 0 }),
  close: () => set({ isOpen: false, searchQuery: '', selectedIndex: 0 }),
  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, searchQuery: '', selectedIndex: 0 });
    } else {
      set({ isOpen: true, searchQuery: '', selectedIndex: 0 });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query, selectedIndex: 0 }),
  setSelectedIndex: (index) => set({ selectedIndex: index }),

  registerCommands: (commands) => set({ commands }),

  executeSelected: () => {
    const { commands, searchQuery, selectedIndex } = get();
    const filtered = filterCommands(commands, searchQuery);
    if (filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      set({ isOpen: false, searchQuery: '', selectedIndex: 0 });
    }
  },
}));

export const filterCommands = (commands: CommandItem[], query: string): CommandItem[] => {
  if (!query.trim()) return commands;
  const lower = query.toLowerCase();
  return commands.filter(cmd =>
    cmd.label.toLowerCase().includes(lower) ||
    cmd.category.toLowerCase().includes(lower) ||
    (cmd.description && cmd.description.toLowerCase().includes(lower))
  );
};
