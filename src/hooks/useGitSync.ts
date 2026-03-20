import { useEffect, useRef } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useGitStore } from '@/stores/gitStore';

export const useGitSync = () => {
  const activeTab = useTerminalStore(state =>
    state.tabs.find(t => t.id === state.activeTabId)
  );
  const isOpen = useGitStore(state => state.isOpen);
  const checkIsRepo = useGitStore(state => state.checkIsRepo);
  const refreshStatus = useGitStore(state => state.refreshStatus);
  const prevCwdRef = useRef<string>('');

  // When active tab cwd changes or panel opens, check repo status
  useEffect(() => {
    if (!isOpen || !activeTab?.cwd) return;

    const cwd = activeTab.cwd;
    if (cwd !== prevCwdRef.current) {
      prevCwdRef.current = cwd;
      checkIsRepo(cwd);
      refreshStatus(cwd);
    }
  }, [activeTab?.cwd, activeTab?.id, isOpen, checkIsRepo, refreshStatus]);

  // Poll every 5s while panel is open
  useEffect(() => {
    if (!isOpen || !activeTab?.cwd) return;

    const interval = setInterval(() => {
      const cwd = useTerminalStore.getState().tabs.find(
        t => t.id === useTerminalStore.getState().activeTabId
      )?.cwd;
      if (cwd) {
        refreshStatus(cwd);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab?.cwd, refreshStatus]);
};
