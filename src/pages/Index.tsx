import { useEffect, useCallback } from "react";
import { ToolsSidebar } from "@/components/ToolsSidebar";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { TerminalStatusBar } from "@/components/terminal/TerminalStatusBar";
import { TerminalToolbar } from "@/components/terminal/TerminalToolbar";
import { XTerminal } from "@/components/terminal/XTerminal";
import { WelcomePage } from "@/components/WelcomePage";
import { useTerminalStore } from "@/stores/terminalStore";
import { useDirectorySync } from "@/hooks/useDirectorySync";


const Index = () => {
  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const homeDir = useTerminalStore(state => state.homeDir);
  const isInitialized = useTerminalStore(state => state.isInitialized);

  const setHomeDir = useTerminalStore(state => state.setHomeDir);
  const setInitialized = useTerminalStore(state => state.setInitialized);
  const addTab = useTerminalStore(state => state.addTab);

  const activeTab = useTerminalStore(state =>
    state.tabs.find(t => t.id === state.activeTabId)
  );

  useEffect(() => {
    console.log('[Index] State check:', {
      tabsCount: tabs.length,
      activeTabId,
      isInitialized,
      hasActiveTab: !!activeTab
    });
  }, [tabs.length, activeTabId, isInitialized, !!activeTab]);

  // Get directory name from path for tab title
  const getDirectoryName = useCallback((path: string, homePath: string): string => {
    if (path === homePath) return '~';
    if (path === '/') return 'root';
    return path.split('/').pop() || 'unknown';
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (isInitialized) return;

    const initTerminal = async () => {
      console.log('[Index] initTerminal started');
      try {
        // 1. Get Home Directory
        let home: string;
        try {
          home = (await window.ipcRenderer.invoke('get-home-directory')) as string;
        } catch (e) {
          console.warn('[Index] get-home-directory failed, using fallback', e);
          home = '/home';
        }
        setHomeDir(home);

        // 2. Prepare Initial Tab
        const initialTabId = window.crypto.randomUUID();
        console.log('[Index] Initializing tab:', initialTabId);

        // 3. Initialize PTY in Main Process
        try {
          await window.ipcRenderer.invoke('init-tab', initialTabId);
        } catch (e) {
          console.error('[Index] init-tab IPC failed', e);
        }

        // 4. Update Store
        console.log('[Index] Adding initial tab: Welcome');
        addTab({
          id: initialTabId,
          title: 'Welcome',
          cwd: home,
          isReady: true,
          type: 'welcome'
        });

        console.log('[Index] Initialization complete, setting isInitialized=true');
        setInitialized(true);
      } catch (error) {
        console.error('[Index] Critical initialization error:', error);
        // Absolute fallback
        const fallbackId = 'fallback-' + Date.now();
        addTab({
          id: fallbackId,
          title: 'Welcome (Offline)',
          cwd: '/home',
          isReady: true,
          type: 'welcome'
        });
        setHomeDir('/home');
        setInitialized(true);
      }
    };

    initTerminal();
  }, [isInitialized, setHomeDir, getDirectoryName, addTab, setInitialized]);

  // Handle library tabs loaded from new window
  useEffect(() => {
    const handleLibraryTabsLoaded = (...args: unknown[]) => {
      console.log('[Index] library-tabs-loaded event received:', args);
      const tabs = args[0] as any[];
      console.log('[Index] Library tabs loaded:', tabs);
      if (tabs && tabs.length > 0) {
        // Clear welcome tab
        const store = useTerminalStore.getState();
        const welcomeTab = store.tabs.find(t => t.type === 'welcome');
        if (welcomeTab) {
          window.ipcRenderer.invoke('remove-tab', welcomeTab.id);
          useTerminalStore.getState().removeTab(welcomeTab.id);
        }
        
        // Load library tabs
        tabs.forEach(async (tab) => {
          console.log('[Index] Loading tab:', tab);
          try {
            await window.ipcRenderer.invoke('init-tab', tab.id);
          } catch (e) {
            console.error('[Index] init-tab IPC failed for library tab', e);
          }
          addTab({
            id: tab.id,
            title: tab.title || tab.cwd.split('/').pop() || 'unknown',
            cwd: tab.cwd,
            isReady: false
          });
        });
      }
    };

    window.ipcRenderer.on('library-tabs-loaded', handleLibraryTabsLoaded);
    return () => {
      window.ipcRenderer.removeAllListeners('library-tabs-loaded');
    };
  }, [addTab]);

  // Check for libraryTabs in URL params on init
  useEffect(() => {
    const checkLibraryTabs = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const libraryTabsParam = urlParams.get('libraryTabs');
      if (libraryTabsParam) {
        try {
          const tabs = JSON.parse(decodeURIComponent(libraryTabsParam));
          console.log('[Index] Loading library tabs from URL:', tabs);
          
          // Clear welcome tab and load library tabs
          const store = useTerminalStore.getState();
          const welcomeTab = store.tabs.find(t => t.type === 'welcome');
          if (welcomeTab) {
            window.ipcRenderer.invoke('remove-tab', welcomeTab.id);
            useTerminalStore.getState().removeTab(welcomeTab.id);
          }
          
          // Load library tabs
          for (const tab of tabs) {
            console.log('[Index] Loading tab from URL:', tab);
            try {
              await window.ipcRenderer.invoke('init-tab', tab.id);
            } catch (e) {
              console.error('[Index] init-tab IPC failed for library tab', e);
            }
            addTab({
              id: tab.id,
              title: tab.title || tab.cwd.split('/').pop() || 'unknown',
              cwd: tab.cwd,
              isReady: false
            });
          }
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error('[Index] Failed to parse libraryTabs from URL:', e);
        }
      }
    };
    
    if (isInitialized) {
      checkLibraryTabs();
    }
  }, [isInitialized, addTab]);

  // Handle cross-tab events (e.g. from Library)
  useEffect(() => {
    const handleTabCreated = (...args: unknown[]) => {
      console.log('[Index] tab-created event received:', args);
      const [, tabId, cwd, title] = args as [unknown, string, string, string];
      const dirName = getDirectoryName(cwd, homeDir);
      addTab({
        id: tabId,
        title: title || dirName,
        cwd: cwd,
        isReady: false
      });
    };

    window.ipcRenderer.on('tab-created', handleTabCreated);
    return () => {
      window.ipcRenderer.removeAllListeners('tab-created');
    };
  }, [homeDir, getDirectoryName, addTab]);

  // Use custom hook for directory synchronization
  useDirectorySync();

  const handleClear = useCallback(() => {
    if (activeTabId) {
      window.ipcRenderer.invoke('send-input', activeTabId, 'clear\n');
    }
  }, [activeTabId]);

  // Show loading state ONLY while initialization is in progress
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <span className="text-muted-foreground">Initializing terminal...</span>
        </div>
      </div>
    );
  }

  // If initialized but no tab (should not happen normally)
  if (!activeTab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
          <h2 className="text-xl font-semibold mb-2">Failed to load terminal</h2>
          <p className="text-muted-foreground mb-4">The terminal session could not be established.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <ToolsSidebar />
      <div className="flex-1 pl-14 flex flex-col">
        <TerminalToolbar />
        <TerminalHeader onClear={handleClear} />
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'block' : 'hidden'}`}
              style={{ height: '100%' }}
            >
              <div className="h-full w-full">
                {tab.type === 'welcome' ? (
                  <WelcomePage />
                ) : (
                  <XTerminal
                    tabId={tab.id}
                    isActive={tab.id === activeTabId}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <TerminalStatusBar />
      </div>
    </div>
  );
};

export default Index;