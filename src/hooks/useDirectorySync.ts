import { useEffect, useCallback, useRef } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';

export const useDirectorySync = () => {
  const isInitialized = useTerminalStore(state => state.isInitialized);
  const homeDir = useTerminalStore(state => state.homeDir);
  const updateTab = useTerminalStore(state => state.updateTab);
  const updatePane = useTerminalStore(state => state.updatePane);
  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const { cacheEnabled } = useSettingsStore();
  const windowIdRef = useRef<number | null>(null);
  const hasChangesRef = useRef(false);
  const saveCacheTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getWindowId = useCallback(async () => {
    if (windowIdRef.current === null) {
      try {
        const id = await window.ipcRenderer.invoke('get-window-id');
        console.log('[DirectorySync] Got window ID:', id);
        windowIdRef.current = id as number;
      } catch (error) {
        console.warn('[DirectorySync] Failed to get window ID:', error);
        windowIdRef.current = 1;
      }
    }
    return windowIdRef.current;
  }, []);

  // Get directory name from path for tab title
  const getDirectoryName = useCallback((path: string, homePath: string): string => {
    if (path === homePath) return '~';
    if (path === '/') return 'root';
    return path.split('/').pop() || 'unknown';
  }, []);

  const saveCache = useCallback(async () => {
    if (!cacheEnabled) return;

    const winId = await getWindowId();
    if (!winId) return;

    // Read fresh state inside callback to avoid stale closures
    const { tabs: freshTabs, activeTabId: freshActiveTabId } = useTerminalStore.getState();
    const activeTab = freshTabs.find(t => t.id === freshActiveTabId);

    try {
      // Validate that we have proper tab data before saving
      const validTabs = freshTabs.filter(tab => tab && tab.id && tab.cwd);

      if (validTabs.length === 0) {
        console.warn('No valid tabs to save to cache');
        return;
      }

      // Get actual window bounds from the main process
      let windowState = { x: 0, y: 0, width: 1200, height: 800, isMaximized: false };
      try {
        const bounds = await window.ipcRenderer.invoke('get-window-bounds') as { x: number; y: number; width: number; height: number; isMaximized: boolean } | null;
        if (bounds) {
          windowState = bounds;
        }
      } catch {
        // Use defaults if IPC fails
      }

      await window.cacheApi.save({
        windowId: winId,
        timestamp: Date.now(),
        windowState,
        tabs: validTabs.map(tab => ({
          id: tab.id,
          title: tab.title || tab.cwd.split('/').pop() || 'unknown',
          cwd: tab.cwd,
          isActive: tab.id === activeTab?.id,
          type: tab.type || 'terminal'
        })),
        activeTabId: activeTab?.id || ''
      });
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }, [cacheEnabled, getWindowId]);

  // Debounced save: coalesces rapid tab mutations into a single cache write
  const debouncedSaveCache = useCallback(() => {
    if (saveCacheTimeoutRef.current) {
      clearTimeout(saveCacheTimeoutRef.current);
    }
    saveCacheTimeoutRef.current = setTimeout(() => {
      saveCache();
      saveCacheTimeoutRef.current = null;
    }, 300);
  }, [saveCache]);

  // Notify the main process of active tab changes so it can persist on window close
  useEffect(() => {
    if (!isInitialized || !activeTabId) return;
    window.ipcRenderer.invoke('set-active-tab', activeTabId).catch(() => {});
  }, [activeTabId, isInitialized]);

  // Save cache whenever tab metadata changes (add, remove, reorder, active tab)
  const prevTabSnapshotRef = useRef('');
  useEffect(() => {
    if (!isInitialized || tabs.length === 0) return;

    // Create a snapshot of tab IDs + order + activeTabId to detect changes
    const snapshot = tabs.map(t => t.id).join(',') + '|' + activeTabId;
    if (prevTabSnapshotRef.current && snapshot !== prevTabSnapshotRef.current) {
      debouncedSaveCache();
    }
    prevTabSnapshotRef.current = snapshot;
  }, [tabs, activeTabId, isInitialized, debouncedSaveCache]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveCacheTimeoutRef.current) {
        clearTimeout(saveCacheTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(async () => {
      const { tabs: freshTabs } = useTerminalStore.getState();
      if (freshTabs.length === 0) return;

      try {
        let changed = false;
        // Query each tab's panes for directory changes
        await Promise.all(freshTabs.map(async tab => {
          // Skip welcome tabs
          if (tab.type === 'welcome') return;

          // Get panes for this tab (synthesizes single-pane array for legacy tabs)
          const panes = tab.panes && tab.panes.length > 0
            ? tab.panes
            : [{ id: tab.id, cwd: tab.cwd, isReady: tab.isReady }];

          await Promise.all(panes.map(async pane => {
            try {
              const currentCwd = (await window.ipcRenderer.invoke('query-cwd', pane.id)) as string;
              if (currentCwd && currentCwd !== pane.cwd) {
                console.log(`[DirectorySync] Pane ${pane.id} directory changed: ${pane.cwd} -> ${currentCwd}`);
                updatePane(tab.id, pane.id, { cwd: currentCwd });
                // Read fresh activePaneId from the store (closure snapshot may be stale)
                const freshTab = useTerminalStore.getState().tabs.find(t => t.id === tab.id);
                const activePaneId = freshTab?.activePaneId || tab.id;
                if (pane.id === activePaneId) {
                  const dirName = getDirectoryName(currentCwd, homeDir);
                  updateTab(tab.id, { cwd: currentCwd, title: dirName });
                }
                changed = true;
              }
            } catch (error) {
              console.warn(`Failed to sync directory for pane ${pane.id}:`, error);
            }
          }));
        }));

        if (changed && !hasChangesRef.current) {
          hasChangesRef.current = true;
          console.log('[DirectorySync] Saving cache due to directory change');
          await saveCache();
          hasChangesRef.current = false;
        }
      } catch (error) {
        console.error('Directory sync interval error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, updateTab, updatePane, getDirectoryName, homeDir, saveCache]);
};