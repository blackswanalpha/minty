import { useEffect, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';

export const useDirectorySync = () => {
  const { tabs, updateTab, homeDir, isInitialized } = useTerminalStore();

  // Get directory name from path for tab title
  const getDirectoryName = useCallback((path: string, homePath: string): string => {
    if (path === homePath) return '~';
    if (path === '/') return 'root';
    return path.split('/').pop() || 'unknown';
  }, []);

  useEffect(() => {
    if (!isInitialized || tabs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all(tabs.map(async tab => {
          try {
            const currentCwd = (await window.ipcRenderer.invoke('get-cwd', tab.id)) as string;
            if (currentCwd !== tab.cwd) {
              const dirName = getDirectoryName(currentCwd, homeDir);
              updateTab(tab.id, { cwd: currentCwd, title: dirName });
            }
          } catch (error) {
            console.warn(`Failed to sync directory for tab ${tab.id}:`, error);
          }
        }));
      } catch (error) {
        console.error('Directory sync interval error:', error);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [tabs, isInitialized, updateTab, getDirectoryName, homeDir]);
};