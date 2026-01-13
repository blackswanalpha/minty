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
}

declare namespace NodeJS {
    interface Process {
        platform: string;
        env: ProcessEnv;
    }
}
