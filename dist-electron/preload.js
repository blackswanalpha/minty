"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Increase max listeners to prevent warnings with multiple tabs
electron_1.ipcRenderer.setMaxListeners(50);
// Store listeners for cleanup
const listeners = new Map();
// Expose IPC API to renderer process
electron_1.contextBridge.exposeInMainWorld('ipcRenderer', {
    // Listen to events from main process
    on(channel, callback) {
        const wrappedCallback = (...args) => {
            // Remove IpcRendererEvent and pass only remaining arguments  
            const [, ...rest] = args; // Skip first arg (IpcRendererEvent)
            callback(...rest);
        };
        if (!listeners.has(channel)) {
            listeners.set(channel, new Set());
        }
        listeners.get(channel).add(callback);
        electron_1.ipcRenderer.on(channel, wrappedCallback);
        callback.__wrapped = wrappedCallback;
    },
    // Remove listener
    off(channel, callback) {
        const wrappedCallback = callback.__wrapped;
        if (wrappedCallback) {
            electron_1.ipcRenderer.removeListener(channel, wrappedCallback);
        }
        listeners.get(channel)?.delete(callback);
    },
    // Remove all listeners for a channel
    removeAllListeners(channel) {
        electron_1.ipcRenderer.removeAllListeners(channel);
        listeners.delete(channel);
    },
    // Send message to main process (fire and forget)
    send(channel, ...args) {
        electron_1.ipcRenderer.send(channel, ...args);
    },
    // Send message and wait for response
    invoke(channel, ...args) {
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    // Send sync message (blocking - use sparingly)
    sendSync(channel, ...args) {
        return electron_1.ipcRenderer.sendSync(channel, ...args);
    }
});
//# sourceMappingURL=preload.js.map