"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCacheSave = scheduleCacheSave;
exports.cancelPendingSave = cancelPendingSave;
exports.forceSave = forceSave;
exports.saveAllWindows = saveAllWindows;
const cacheManager_1 = require("./cacheManager");
let pendingSave = null;
const DEBOUNCE_MS = 200;
function scheduleCacheSave(entry) {
    if (!cacheManager_1.cacheManager.getSettings().enabled) {
        console.log('[CacheWorker] Caching disabled, skipping save');
        return;
    }
    try {
        console.log('[CacheWorker] Scheduling cache save for window:', entry.windowId, 'tabs:', entry.tabs.length);
        cacheManager_1.cacheManager.updateEntry(entry);
        if (pendingSave) {
            clearTimeout(pendingSave);
        }
        pendingSave = setTimeout(async () => {
            console.log('[CacheWorker] Executing scheduled cache save');
            await cacheManager_1.cacheManager.saveCache();
            pendingSave = null;
        }, DEBOUNCE_MS);
    }
    catch (error) {
        console.error('[CacheWorker] Error scheduling cache save:', error);
    }
}
function cancelPendingSave() {
    if (pendingSave) {
        clearTimeout(pendingSave);
        pendingSave = null;
    }
}
async function forceSave(entry) {
    cancelPendingSave();
    try {
        console.log('[CacheWorker] Force saving cache for window:', entry.windowId, 'with', entry.tabs.length, 'tabs');
        entry.tabs.forEach(tab => {
            console.log('[CacheWorker]   Tab:', tab.title, 'cwd:', tab.cwd);
        });
        cacheManager_1.cacheManager.updateEntry(entry);
        await cacheManager_1.cacheManager.saveCache();
        console.log('[CacheWorker] Cache saved successfully');
    }
    catch (error) {
        console.error('[CacheWorker] Error force saving cache:', error);
    }
}
async function saveAllWindows(entries) {
    if (!cacheManager_1.cacheManager.getSettings().enabled)
        return;
    try {
        // Only clear if we have entries to replace with
        // This prevents clearing the cache when window-all-closed fires after windows are already removed
        if (entries.length > 0) {
            cacheManager_1.cacheManager.clearAllEntries();
            for (const entry of entries) {
                cacheManager_1.cacheManager.updateEntry(entry);
            }
            await cacheManager_1.cacheManager.saveCache();
            console.log('[CacheWorker] Saved all windows:', entries.length, 'entries');
        }
        else {
            console.log('[CacheWorker] Skipping saveAllWindows - no entries to save (windows already closed)');
        }
    }
    catch (error) {
        console.error('[CacheWorker] Error saving all windows:', error);
    }
}
//# sourceMappingURL=cacheWorker.js.map