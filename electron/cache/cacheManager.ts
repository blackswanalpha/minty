import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
import type { CacheData, CacheEntry, CacheSettings } from './types';

const CACHE_FILENAME = 'minty_cache.json';
const SETTINGS_FILENAME = 'minty_settings.json';

export class CacheManager {
  private cachePath: string;
  private settingsPath: string;
  private cacheData: CacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
  private settings: CacheSettings = { enabled: true };

  constructor() {
    const userDataPath = process.env.USER_DATA_PATH || app.getPath('userData');
    this.cachePath = path.join(userDataPath, CACHE_FILENAME);
    this.settingsPath = path.join(userDataPath, SETTINGS_FILENAME);
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.loadCache(),
      this.loadSettings()
    ]);
  }

  async loadCache(): Promise<CacheData> {
    try {
      const data = await fs.readFile(this.cachePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (this.isValidCacheData(parsed)) {
        this.cacheData = parsed;
      } else {
        console.warn('[CacheManager] Invalid cache data format, resetting');
        this.cacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('[CacheManager] Failed to load cache:', error);
      }
      this.cacheData = { version: '1.0.0', lastUpdated: '', entries: [] };
    }
    return this.cacheData;
  }

  private isValidCacheData(data: any): data is CacheData {
    return (
      data &&
      typeof data.version === 'string' &&
      Array.isArray(data.entries)
    );
  }

  async saveCache(): Promise<void> {
    if (!this.settings.enabled) return;
    try {
      this.cacheData.lastUpdated = new Date().toISOString();
      await fs.writeFile(this.cachePath, JSON.stringify(this.cacheData, null, 2));
    } catch (error) {
      console.error('[CacheManager] Failed to save cache:', error);
    }
  }

  async loadSettings(): Promise<CacheSettings> {
    try {
      const data = await fs.readFile(this.settingsPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (this.isValidSettings(parsed)) {
        this.settings = parsed;
      } else {
        console.warn('[CacheManager] Invalid settings format, resetting');
        this.settings = { enabled: true };
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('[CacheManager] Failed to load settings:', error);
      }
      this.settings = { enabled: true };
    }
    return this.settings;
  }

  private isValidSettings(data: any): data is CacheSettings {
    return data && typeof data.enabled === 'boolean';
  }

  async saveSettings(settings: CacheSettings): Promise<void> {
    try {
      this.settings = settings;
      await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('[CacheManager] Failed to save settings:', error);
    }
  }

  getSettings(): CacheSettings {
    return this.settings;
  }

  updateEntry(entry: CacheEntry): void {
    const existingIndex = this.cacheData.entries.findIndex(e => e.windowId === entry.windowId);
    if (existingIndex >= 0) {
      this.cacheData.entries[existingIndex] = entry;
    } else {
      this.cacheData.entries.push(entry);
    }
  }

  getEntry(windowId: number): CacheEntry | undefined {
    return this.cacheData.entries.find(e => e.windowId === windowId);
  }

  removeEntry(windowId: number): void {
    this.cacheData.entries = this.cacheData.entries.filter(e => e.windowId !== windowId);
  }

  getAllEntries(): CacheEntry[] {
    return this.cacheData.entries;
  }

  clearAllEntries(): void {
    this.cacheData.entries = [];
  }
}

export const cacheManager = new CacheManager();
