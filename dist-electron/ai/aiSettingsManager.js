"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSettingsManager = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const SETTINGS_FILENAME = 'minty_ai_settings.json';
const SYSTEM_PROMPT = 'You are a terminal command enhancement assistant. Given a command, improve it with safety flags, best practices, and helpful comments. Return ONLY the enhanced command.';
class AiSettingsManager {
    settingsPath;
    settings = { ...types_1.DEFAULT_AI_SETTINGS };
    constructor() {
        const userDataPath = process.env.USER_DATA_PATH || electron_1.app.getPath('userData');
        this.settingsPath = node_path_1.default.join(userDataPath, SETTINGS_FILENAME);
    }
    async loadSettings() {
        try {
            const data = await promises_1.default.readFile(this.settingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed.provider === 'string' && typeof parsed.enabled === 'boolean') {
                this.settings = { ...types_1.DEFAULT_AI_SETTINGS, ...parsed };
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('[AiSettingsManager] Failed to load settings:', error);
            }
        }
        return this.settings;
    }
    async saveSettings(settings) {
        try {
            this.settings = settings;
            await promises_1.default.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
        }
        catch (error) {
            console.error('[AiSettingsManager] Failed to save settings:', error);
        }
    }
    getSettings() {
        return this.settings;
    }
    async testConnection(settings) {
        const merged = { ...this.settings, ...settings };
        const { provider, endpoint, apiKey } = merged;
        try {
            if (provider === 'ollama') {
                const response = await axios_1.default.get(`${endpoint}/api/tags`, { timeout: 10000 });
                const models = (response.data?.models || []).map((m) => m.name || m.model);
                return {
                    success: true,
                    message: `Connected to Ollama. Found ${models.length} model(s).`,
                    models,
                };
            }
            // llama-api or custom — OpenAI-compatible endpoint
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            await axios_1.default.post(`${endpoint}/v1/chat/completions`, {
                model: merged.model || 'llama3.2',
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 1,
            }, { headers, timeout: 15000 });
            return { success: true, message: 'Connected successfully.' };
        }
        catch (error) {
            const msg = axios_1.default.isAxiosError(error) && error.response
                ? `${error.response.status}: ${error.response.statusText}`
                : error instanceof Error
                    ? error.message
                    : 'Unknown error';
            return { success: false, message: `Connection failed — ${msg}` };
        }
    }
    async enhanceCommand(command) {
        // Ensure we have the latest persisted settings
        await this.loadSettings();
        const { provider, endpoint, apiKey, model } = this.settings;
        try {
            if (provider === 'ollama') {
                const response = await axios_1.default.post(`${endpoint}/api/chat`, {
                    model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: command },
                    ],
                    stream: false,
                    options: { num_predict: 256 },
                    think: false,
                }, { timeout: 60000 });
                const enhanced = (response.data?.message?.content || '').trim();
                if (!enhanced)
                    return { success: false, enhanced: '', error: 'Empty response from Ollama' };
                return { success: true, enhanced };
            }
            // llama-api or custom — OpenAI-compatible
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            const response = await axios_1.default.post(`${endpoint}/v1/chat/completions`, {
                model: model || 'llama3.2',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: command },
                ],
            }, { headers, timeout: 10000 });
            const enhanced = response.data?.choices?.[0]?.message?.content?.trim() || '';
            if (!enhanced)
                return { success: false, enhanced: '', error: 'Empty response from API' };
            return { success: true, enhanced };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('[AiSettingsManager] enhanceCommand failed:', msg);
            return { success: false, enhanced: '', error: msg };
        }
    }
}
exports.aiSettingsManager = new AiSettingsManager();
//# sourceMappingURL=aiSettingsManager.js.map