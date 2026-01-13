// Global PTY Event Manager - Single listener approach to prevent memory leaks
// Only 2 listeners are registered globally (pty-output and pty-exit)
// Callbacks are dispatched based on tabId

type PtyOutputCallback = (data: string) => void;
type PtyExitCallback = (exitCode: number) => void;

interface TabCallbacks {
  onOutput?: PtyOutputCallback;
  onExit?: PtyExitCallback;
}

class PtyEventManager {
  private callbacks: Map<string, TabCallbacks> = new Map();
  private initialized = false;
  private outputListener: ((...args: unknown[]) => void) | null = null;
  private exitListener: ((...args: unknown[]) => void) | null = null;

  initialize() {
    if (this.initialized || typeof window === 'undefined' || !window.ipcRenderer) {
      return;
    }

    this.initialized = true;

    // Single global listener for pty-output with cleanup reference
    this.outputListener = (...args: unknown[]) => {
      const data = args[0] as { tabId: string; data: string };
      const tabCallbacks = this.callbacks.get(data.tabId);
      if (tabCallbacks?.onOutput) {
        tabCallbacks.onOutput(data.data);
      }
    };
    window.ipcRenderer.on('pty-output', this.outputListener);

    // Single global listener for pty-exit with cleanup reference
    this.exitListener = (...args: unknown[]) => {
      const data = args[0] as { tabId: string; exitCode: number };
      const tabCallbacks = this.callbacks.get(data.tabId);
      if (tabCallbacks?.onExit) {
        tabCallbacks.onExit(data.exitCode);
      }
    };
    window.ipcRenderer.on('pty-exit', this.exitListener);

    console.log('[PtyEventManager] Initialized with global listeners');
  }

  register(tabId: string, callbacks: TabCallbacks) {
    this.initialize();
    
    // Clean up existing registration if any
    if (this.callbacks.has(tabId)) {
      console.warn(`[PtyEventManager] Tab ${tabId} already registered, updating callbacks`);
    }
    
    this.callbacks.set(tabId, callbacks);
    console.log(`[PtyEventManager] Registered tab: ${tabId}`);
  }

  unregister(tabId: string) {
    this.callbacks.delete(tabId);
    console.log(`[PtyEventManager] Unregistered tab: ${tabId}`);
  }

  updateCallbacks(tabId: string, callbacks: Partial<TabCallbacks>) {
    const existing = this.callbacks.get(tabId) || {};
    this.callbacks.set(tabId, { ...existing, ...callbacks });
  }

getRegisteredTabs(): string[] {
    return Array.from(this.callbacks.keys());
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.outputListener && typeof window !== 'undefined' && window.ipcRenderer) {
      window.ipcRenderer.off('pty-output', this.outputListener);
    }
    if (this.exitListener && typeof window !== 'undefined' && window.ipcRenderer) {
      window.ipcRenderer.off('pty-exit', this.exitListener);
    }
    this.callbacks.clear();
    this.initialized = false;
    this.outputListener = null;
    this.exitListener = null;
    console.log('[PtyEventManager] Cleaned up all listeners');
  }

  }

// Singleton instance
export const ptyEventManager = new PtyEventManager();
