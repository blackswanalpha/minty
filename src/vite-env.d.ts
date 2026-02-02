/// <reference types="vite/client" />

interface CommandResult {
    success: boolean;
    output: string;
    error: string;
    cwd: string;
    exitCode?: number;
}

interface Window {
    ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, callback: (...args: unknown[]) => void) => void;
        off: (channel: string, callback: (...args: unknown[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        invoke: (channel: string, ...args: unknown[]) => Promise<string | unknown>;
        sendSync: (channel: string, ...args: unknown[]) => unknown;
    };
    cacheApi: {
        initialize: () => Promise<{ success: boolean; settings: { enabled: boolean } }>;
        getState: () => Promise<{ entries: any[]; settings: { enabled: boolean } }>;
        save: (entry: any) => Promise<{ success: boolean; skipped?: boolean }>;
        saveForce: (entry: any) => Promise<{ success: boolean; skipped?: boolean }>;
        restore: (windowId: number) => Promise<any | null>;
        getSettings: () => Promise<{ enabled: boolean }>;
        setSettings: (settings: { enabled: boolean }) => Promise<{ success: boolean }>;
        clear: (windowId?: number) => Promise<{ success: boolean }>;
        registerTab: (windowId: number, tabId: string) => Promise<{ success: boolean }>;
        unregisterTab: (windowId: number, tabId: string) => Promise<{ success: boolean }>;
    };
}

declare namespace NodeJS {
    interface Process {
        platform: string;
        env: ProcessEnv;
    }
}
