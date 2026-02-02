"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = exports.CacheManager = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const electron_1 = require("electron");
const CACHE_FILENAME = 'minty_cache.json';
const SETTINGS_FILENAME = 'minty_settings.json';
class CacheManager {
    cachePath;
    settingsPath;
    cacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
    settings = { enabled: true };
    constructor() {
        const userDataPath = process.env.USER_DATA_PATH || electron_1.app.getPath('userData');
        this.cachePath = node_path_1.default.join(userDataPath, CACHE_FILENAME);
        this.settingsPath = node_path_1.default.join(userDataPath, SETTINGS_FILENAME);
    }
    async initialize() {
        await Promise.all([
            this.loadCache(),
            this.loadSettings()
        ]);
    }
    async loadCache() {
        try {
            const data = await promises_1.default.readFile(this.cachePath, 'utf-8');
            const parsed = JSON.parse(data);
            if (this.isValidCacheData(parsed)) {
                this.cacheData = parsed;
            }
            else {
                console.warn('[CacheManager] Invalid cache data format, resetting');
                this.cacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('[CacheManager] Failed to load cache:', error);
            }
            this.cacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
        }
        return this.cacheData;
    }
    isValidCacheData(data) {
        return (data &&
            typeof data.version === 'string' &&
            Array.isArray(data.entries));
    }
    async saveCache() {
        if (!this.settings.enabled)
            return;
        try {
            this.cacheData.lastUpdated = new Date().toISOString();
            await promises_1.default.writeFile(this.cachePath, JSON.stringify(this.cacheData, null, 2));
        }
        catch (error) {
            console.error('[CacheManager] Failed to save cache:', error);
        }
    }
    async loadSettings() {
        try {
            const data = await promises_1.default.readFile(this.settingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            if (this.isValidSettings(parsed)) {
                this.settings = parsed;
            }
            else {
                console.warn('[CacheManager] Invalid settings format, resetting');
                this.settings = { enabled: true };
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('[CacheManager] Failed to load settings:', error);
            }
            this.settings = { enabled: true };
        }
        return this.settings;
    }
    isValidSettings(data) {
        return data && typeof data.enabled === 'boolean';
    }
    async saveSettings(settings) {
        try {
            this.settings = settings;
            await promises_1.default.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
        }
        catch (error) {
            console.error('[CacheManager] Failed to save settings:', error);
        }
    }
    getSettings() {
        return this.settings;
    }
    updateEntry(entry) {
        const existingIndex = this.cacheData.entries.findIndex(e => e.windowId === entry.windowId);
        if (existingIndex >= 0) {
            this.cacheData.entries[existingIndex] = entry;
        }
        else {
            this.cacheData.entries.push(entry);
        }
    }
    getEntry(windowId) {
        return this.cacheData.entries.find(e => e.windowId === windowId);
    }
    removeEntry(windowId) {
        this.cacheData.entries = this.cacheData.entries.filter(e => e.windowId !== windowId);
    }
    getAllEntries() {
        return this.cacheData.entries;
    }
    clearAllEntries() {
        this.cacheData.entries = [];
    }
}
exports.CacheManager = CacheManager;
exports.cacheManager = new CacheManager();
//# sourceMappingURL=cacheManager.js.map