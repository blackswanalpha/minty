import { create } from 'zustand';

interface SettingsState {
  cacheEnabled: boolean;
  isLoading: boolean;
  setCacheEnabled: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  cacheEnabled: true,
  isLoading: false,

  setCacheEnabled: async (enabled: boolean) => {
    set({ cacheEnabled: enabled });
    await get().saveSettings();
  },

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await window.cacheApi.getSettings();
      if (settings) {
        set({ cacheEnabled: settings.enabled });
      }
    } catch (error) {
      console.warn('[SettingsStore] Failed to load cache settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async () => {
    try {
      await window.cacheApi.setSettings({
        enabled: get().cacheEnabled
      });
    } catch (error) {
      console.warn('[SettingsStore] Failed to save cache settings:', error);
    }
  }
}));
