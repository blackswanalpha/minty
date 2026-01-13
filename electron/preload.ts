import { contextBridge, ipcRenderer } from 'electron'

// Increase max listeners to prevent warnings with multiple tabs
ipcRenderer.setMaxListeners(50)

// Store listeners for cleanup
const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

// Expose IPC API to renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
    // Listen to events from main process
    on(channel: string, callback: (...args: unknown[]) => void) {
        const wrappedCallback = (...args: unknown[]) => {
            // Remove IpcRendererEvent and pass only remaining arguments  
            const [, ...rest] = args; // Skip first arg (IpcRendererEvent)
            callback(...rest);
        };

        if (!listeners.has(channel)) {
            listeners.set(channel, new Set())
        }
        listeners.get(channel)!.add(callback)

        ipcRenderer.on(channel, wrappedCallback)

            // Store the wrapped callback for removal
            ; (callback as { __wrapped?: (...args: unknown[]) => void }).__wrapped = wrappedCallback
    },

    // Remove listener
    off(channel: string, callback: (...args: unknown[]) => void) {
        const wrappedCallback = (callback as { __wrapped?: (...args: unknown[]) => void }).__wrapped
        if (wrappedCallback) {
            ipcRenderer.removeListener(channel, wrappedCallback)
        }
        listeners.get(channel)?.delete(callback)
    },

    // Remove all listeners for a channel
    removeAllListeners(channel: string) {
        ipcRenderer.removeAllListeners(channel)
        listeners.delete(channel)
    },

    // Send message to main process (fire and forget)
    send(channel: string, ...args: unknown[]) {
        ipcRenderer.send(channel, ...args)
    },

    // Send message and wait for response
    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
        return ipcRenderer.invoke(channel, ...args)
    },

    // Send sync message (blocking - use sparingly)
    sendSync(channel: string, ...args: unknown[]): unknown {
        return ipcRenderer.sendSync(channel, ...args)
    }
})
