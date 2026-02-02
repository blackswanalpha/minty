import { useEffect, useCallback, useRef } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useSettingsStore } from '@/stores/settingsStore';

export const useDirectorySync = () => {
  const { tabs, updateTab, homeDir, isInitialized } = useTerminalStore();
  const { cacheEnabled } = useSettingsStore();
  const windowIdRef = useRef<number | null>(null);
  const hasChangesRef = useRef(false);

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

    const activeTab = tabs.find(t => t.id === useTerminalStore.getState().activeTabId);

    try {
      // Validate that we have proper tab data before saving
      const validTabs = tabs.filter(tab => tab && tab.id && tab.cwd);

      if (validTabs.length === 0) {
        console.warn('No valid tabs to save to cache');
        return;
      }

      await window.cacheApi.save({
        windowId: winId,
        timestamp: Date.now(),
        windowState: {
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          isMaximized: false
        },
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
  }, [tabs, cacheEnabled, getWindowId]);

  useEffect(() => {
    if (!isInitialized || tabs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        let changed = false;
        // Query each tab's directory from the shell
        await Promise.all(tabs.map(async tab => {
          // Skip welcome tabs
          if (tab.type === 'welcome') return;

          try {
            // Use query-cwd to actively poll the shell for current directory
            const currentCwd = (await window.ipcRenderer.invoke('query-cwd', tab.id)) as string;
            if (currentCwd && currentCwd !== tab.cwd) {
              const dirName = getDirectoryName(currentCwd, homeDir);
              console.log(`[DirectorySync] Tab ${tab.id} directory changed: ${tab.cwd} -> ${currentCwd}`);
              updateTab(tab.id, { cwd: currentCwd, title: dirName });
              changed = true;
            }
          } catch (error) {
            console.warn(`Failed to sync directory for tab ${tab.id}:`, error);
          }
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
  }, [tabs, isInitialized, updateTab, getDirectoryName, homeDir, cacheEnabled, saveCache]);
};