export interface CacheWindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export interface CacheTab {
  id: string;
  title: string;
  cwd: string;
  isActive: boolean;
  type: 'terminal' | 'welcome';
}

export interface CacheEntry {
  windowId: number;
  timestamp: number;
  windowState: CacheWindowState;
  tabs: CacheTab[];
  activeTabId: string;
}

export interface CacheData {
  version: '1.0.0';
  lastUpdated: string;
  entries: CacheEntry[];
}

export interface CacheSettings {
  enabled: boolean;
}

export interface SaveCachePayload {
  windowId: number;
  windowState: CacheWindowState;
  tabs: CacheTab[];
  activeTabId: string;
}
