import { create } from 'zustand';

interface TerminalSearchState {
  isOpen: boolean;
  searchQuery: string;
  matchCount: number;
  currentMatch: number;
  isRegex: boolean;
  isCaseSensitive: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  setMatchCount: (count: number) => void;
  setCurrentMatch: (index: number) => void;
  toggleRegex: () => void;
  toggleCaseSensitive: () => void;
  nextMatch: () => void;
  prevMatch: () => void;
}

export const useTerminalSearchStore = create<TerminalSearchState>((set, get) => ({
  isOpen: false,
  searchQuery: '',
  matchCount: 0,
  currentMatch: 0,
  isRegex: false,
  isCaseSensitive: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, searchQuery: '', matchCount: 0, currentMatch: 0 }),
  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, searchQuery: '', matchCount: 0, currentMatch: 0 });
    } else {
      set({ isOpen: true });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query, currentMatch: 0 }),
  setMatchCount: (count) => set({ matchCount: count }),
  setCurrentMatch: (index) => set({ currentMatch: index }),
  toggleRegex: () => set((s) => ({ isRegex: !s.isRegex })),
  toggleCaseSensitive: () => set((s) => ({ isCaseSensitive: !s.isCaseSensitive })),

  nextMatch: () => {
    const { currentMatch, matchCount } = get();
    if (matchCount > 0) {
      set({ currentMatch: (currentMatch + 1) % matchCount });
    }
  },

  prevMatch: () => {
    const { currentMatch, matchCount } = get();
    if (matchCount > 0) {
      set({ currentMatch: (currentMatch - 1 + matchCount) % matchCount });
    }
  },
}));
