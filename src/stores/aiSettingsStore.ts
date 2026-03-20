import { create } from 'zustand';

export type AiProvider = 'ollama' | 'llama-api' | 'custom';

interface AiSettings {
  provider: AiProvider;
  endpoint: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

interface AiTestResult {
  success: boolean;
  message: string;
  models?: string[];
}

interface AiSettingsState {
  provider: AiProvider;
  endpoint: string;
  apiKey: string;
  model: string;
  enabled: boolean;

  // UI state
  isLoading: boolean;
  isModalOpen: boolean;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionMessage: string;
  availableModels: string[];

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setProvider: (provider: AiProvider) => void;
  setEndpoint: (endpoint: string) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setEnabled: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  testConnection: () => Promise<void>;
}

const DEFAULT_ENDPOINTS: Record<AiProvider, string> = {
  ollama: 'http://localhost:11434',
  'llama-api': 'https://api.llama-api.com',
  custom: '',
};

export const useAiSettingsStore = create<AiSettingsState>((set, get) => ({
  provider: 'ollama',
  endpoint: 'http://localhost:11434',
  apiKey: '',
  model: 'qwen3.5:4b',
  enabled: false,

  isLoading: false,
  isModalOpen: false,
  connectionStatus: 'idle',
  connectionMessage: '',
  availableModels: [],

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, connectionStatus: 'idle', connectionMessage: '' }),

  setProvider: (provider: AiProvider) => {
    set({
      provider,
      endpoint: DEFAULT_ENDPOINTS[provider],
      connectionStatus: 'idle',
      connectionMessage: '',
      availableModels: [],
    });
  },

  setEndpoint: (endpoint: string) => set({ endpoint }),
  setApiKey: (apiKey: string) => set({ apiKey }),
  setModel: (model: string) => set({ model }),
  setEnabled: (enabled: boolean) => set({ enabled }),

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await window.ipcRenderer.invoke('ai-get-settings') as AiSettings | null;
      if (settings) {
        set({
          provider: settings.provider || 'ollama',
          endpoint: settings.endpoint || 'http://localhost:11434',
          apiKey: settings.apiKey || '',
          model: settings.model || 'llama3.2',
          enabled: settings.enabled ?? false,
        });
      }
    } catch (error) {
      console.warn('[AiSettingsStore] Failed to load settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async () => {
    const { provider, endpoint, apiKey, model, enabled } = get();
    try {
      await window.ipcRenderer.invoke('ai-set-settings', { provider, endpoint, apiKey, model, enabled });
    } catch (error) {
      console.warn('[AiSettingsStore] Failed to save settings:', error);
    }
  },

  testConnection: async () => {
    const { provider, endpoint, apiKey, model } = get();
    set({ connectionStatus: 'testing', connectionMessage: '' });
    try {
      const result = await window.ipcRenderer.invoke('ai-test-connection', { provider, endpoint, apiKey, model }) as AiTestResult;
      if (result.success) {
        set({
          connectionStatus: 'success',
          connectionMessage: result.message,
          availableModels: result.models || [],
        });
      } else {
        set({ connectionStatus: 'error', connectionMessage: result.message });
      }
    } catch (error) {
      set({
        connectionStatus: 'error',
        connectionMessage: error instanceof Error ? error.message : 'Connection test failed',
      });
    }
  },
}));
