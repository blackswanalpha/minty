import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import axios from 'axios';
import type { AiSettings, AiTestResult, AiEnhanceResponse } from './types';
import { DEFAULT_AI_SETTINGS } from './types';

const SETTINGS_FILENAME = 'minty_ai_settings.json';

const SYSTEM_PROMPT =
  'You are a terminal command enhancement assistant. Given a command, improve it with safety flags, best practices, and helpful comments. Return ONLY the enhanced command.';

class AiSettingsManager {
  private settingsPath: string;
  private settings: AiSettings = { ...DEFAULT_AI_SETTINGS };

  constructor() {
    const userDataPath = process.env.USER_DATA_PATH || app.getPath('userData');
    this.settingsPath = path.join(userDataPath, SETTINGS_FILENAME);
  }

  async loadSettings(): Promise<AiSettings> {
    try {
      const data = await fs.readFile(this.settingsPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.provider === 'string' && typeof parsed.enabled === 'boolean') {
        this.settings = { ...DEFAULT_AI_SETTINGS, ...parsed };
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('[AiSettingsManager] Failed to load settings:', error);
      }
    }
    return this.settings;
  }

  async saveSettings(settings: AiSettings): Promise<void> {
    try {
      this.settings = settings;
      await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('[AiSettingsManager] Failed to save settings:', error);
    }
  }

  getSettings(): AiSettings {
    return this.settings;
  }

  async testConnection(settings: Partial<AiSettings>): Promise<AiTestResult> {
    const merged = { ...this.settings, ...settings };
    const { provider, endpoint, apiKey } = merged;

    try {
      if (provider === 'ollama') {
        const response = await axios.get(`${endpoint}/api/tags`, { timeout: 10000 });
        const models: string[] = (response.data?.models || []).map((m: any) => m.name || m.model);
        return {
          success: true,
          message: `Connected to Ollama. Found ${models.length} model(s).`,
          models,
        };
      }

      // llama-api or custom — OpenAI-compatible endpoint
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      await axios.post(
        `${endpoint}/v1/chat/completions`,
        {
          model: merged.model || 'llama3.2',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        },
        { headers, timeout: 15000 },
      );

      return { success: true, message: 'Connected successfully.' };
    } catch (error) {
      const msg =
        axios.isAxiosError(error) && error.response
          ? `${error.response.status}: ${error.response.statusText}`
          : error instanceof Error
            ? error.message
            : 'Unknown error';
      return { success: false, message: `Connection failed — ${msg}` };
    }
  }

  async enhanceCommand(command: string): Promise<AiEnhanceResponse> {
    // Ensure we have the latest persisted settings
    await this.loadSettings();
    const { provider, endpoint, apiKey, model } = this.settings;

    try {
      if (provider === 'ollama') {
        const response = await axios.post(
          `${endpoint}/api/chat`,
          {
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: command },
            ],
            stream: false,
            options: { num_predict: 256 },
            think: false,
          },
          { timeout: 60000 },
        );
        const enhanced = (response.data?.message?.content || '').trim();
        if (!enhanced) return { success: false, enhanced: '', error: 'Empty response from Ollama' };
        return { success: true, enhanced };
      }

      // llama-api or custom — OpenAI-compatible
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.post(
        `${endpoint}/v1/chat/completions`,
        {
          model: model || 'llama3.2',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: command },
          ],
        },
        { headers, timeout: 10000 },
      );

      const enhanced = response.data?.choices?.[0]?.message?.content?.trim() || '';
      if (!enhanced) return { success: false, enhanced: '', error: 'Empty response from API' };
      return { success: true, enhanced };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[AiSettingsManager] enhanceCommand failed:', msg);
      return { success: false, enhanced: '', error: msg };
    }
  }
}

export const aiSettingsManager = new AiSettingsManager();
