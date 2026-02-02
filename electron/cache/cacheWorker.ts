import { cacheManager } from './cacheManager';
import type { CacheEntry } from './types';

let pendingSave: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 200;

export function scheduleCacheSave(entry: CacheEntry): void {
  if (!cacheManager.getSettings().enabled) {
    console.log('[CacheWorker] Caching disabled, skipping save');
    return;
  }

  try {
    console.log('[CacheWorker] Scheduling cache save for window:', entry.windowId, 'tabs:', entry.tabs.length);
    cacheManager.updateEntry(entry);

    if (pendingSave) {
      clearTimeout(pendingSave);
    }

    pendingSave = setTimeout(async () => {
      console.log('[CacheWorker] Executing scheduled cache save');
      await cacheManager.saveCache();
      pendingSave = null;
    }, DEBOUNCE_MS);
  } catch (error) {
    console.error('[CacheWorker] Error scheduling cache save:', error);
  }
}

export function cancelPendingSave(): void {
  if (pendingSave) {
    clearTimeout(pendingSave);
    pendingSave = null;
  }
}

export async function forceSave(entry: CacheEntry): Promise<void> {
  cancelPendingSave();
  try {
    console.log('[CacheWorker] Force saving cache for window:', entry.windowId, 'with', entry.tabs.length, 'tabs');
    entry.tabs.forEach(tab => {
      console.log('[CacheWorker]   Tab:', tab.title, 'cwd:', tab.cwd);
    });
    cacheManager.updateEntry(entry);
    await cacheManager.saveCache();
    console.log('[CacheWorker] Cache saved successfully');
  } catch (error) {
    console.error('[CacheWorker] Error force saving cache:', error);
  }
}

export async function saveAllWindows(entries: CacheEntry[]): Promise<void> {
  if (!cacheManager.getSettings().enabled) return;

  try {
    // Only clear if we have entries to replace with
    // This prevents clearing the cache when window-all-closed fires after windows are already removed
    if (entries.length > 0) {
      cacheManager.clearAllEntries();
      for (const entry of entries) {
        cacheManager.updateEntry(entry);
      }
      await cacheManager.saveCache();
      console.log('[CacheWorker] Saved all windows:', entries.length, 'entries');
    } else {
      console.log('[CacheWorker] Skipping saveAllWindows - no entries to save (windows already closed)');
    }
  } catch (error) {
    console.error('[CacheWorker] Error saving all windows:', error);
  }
}
