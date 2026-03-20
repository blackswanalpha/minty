import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTerminalStore } from '@/stores/terminalStore';
import { useAiToolNotificationStore } from '@/stores/aiToolNotificationStore';

function formatDuration(ms: number): string {
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export const useAiToolNotifications = () => {
    const setActiveTab = useTerminalStore((state) => state.setActiveTab);
    const { enabled, notifyOnlyInBackground, addNotification } = useAiToolNotificationStore();

    useEffect(() => {
        console.log('[AiToolNotifications] Hook mounted, enabled:', enabled, 'notifyOnlyInBackground:', notifyOnlyInBackground);

        const handleCompletion = (event: unknown) => {
            console.log('[AiToolNotifications] Received ai-tool-completed event:', event);
            const { tabId, toolName, displayName, durationMs } = event as {
                tabId: string;
                toolName: string;
                displayName: string;
                durationMs: number;
            };

            if (!enabled) {
                console.log('[AiToolNotifications] Skipping — disabled');
                return;
            }

            // Read current active tab from store (closure may be stale)
            const currentActiveTabId = useTerminalStore.getState().activeTabId;
            if (notifyOnlyInBackground && tabId === currentActiveTabId) {
                console.log('[AiToolNotifications] Skipping — tab is active');
                return;
            }

            const tab = useTerminalStore.getState().tabs.find((t) => t.id === tabId);
            const tabTitle = tab?.title || 'Terminal';

            addNotification({ tabId, toolName, displayName, durationMs });

            toast.success(`${displayName} finished`, {
                description: `Completed in ${formatDuration(durationMs)} (${tabTitle})`,
                duration: 8000,
                action: {
                    label: 'Switch to tab',
                    onClick: () => setActiveTab(tabId),
                },
            });
        };

        window.ipcRenderer.on('ai-tool-completed', handleCompletion);
        return () => {
            window.ipcRenderer.removeAllListeners('ai-tool-completed');
        };
    }, [enabled, notifyOnlyInBackground, addNotification, setActiveTab]);
};
