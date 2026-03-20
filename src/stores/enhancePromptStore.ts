import { create } from 'zustand';
import { enhanceCommand } from '@/lib/enhancePromptService';

interface EnhancePromptState {
  isOpen: boolean;
  inputText: string;
  enhancedText: string;
  isEnhancing: boolean;
  error: string | null;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  setInputText: (text: string) => void;
  enhance: () => Promise<void>;
  reset: () => void;
}

export const useEnhancePromptStore = create<EnhancePromptState>((set, get) => ({
  isOpen: false,
  inputText: '',
  enhancedText: '',
  isEnhancing: false,
  error: null,

  toggle: () => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false });
    } else {
      set({ isOpen: true, error: null });
    }
  },

  open: () => set({ isOpen: true, error: null }),

  close: () => set({ isOpen: false }),

  setInputText: (text: string) => set({ inputText: text, error: null }),

  enhance: async () => {
    const { inputText } = get();
    if (!inputText.trim()) return;

    set({ isEnhancing: true, error: null, enhancedText: '' });

    try {
      const result = await enhanceCommand(inputText);
      set({ enhancedText: result, isEnhancing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to enhance command',
        isEnhancing: false,
      });
    }
  },

  reset: () => set({
    isOpen: false,
    inputText: '',
    enhancedText: '',
    isEnhancing: false,
    error: null,
  }),
}));
