export type AiProvider = 'ollama' | 'llama-api' | 'custom';

export interface AiSettings {
  provider: AiProvider;
  endpoint: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: 'ollama',
  endpoint: 'http://localhost:11434',
  apiKey: '',
  model: 'qwen3.5:4b',
  enabled: false,
};

export interface AiTestResult {
  success: boolean;
  message: string;
  models?: string[];
}

export interface AiEnhanceResponse {
  success: boolean;
  enhanced: string;
  error?: string;
}
