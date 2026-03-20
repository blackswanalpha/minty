import { create } from 'zustand';

export interface AiToolNotification {
    id: string;
    tabId: string;
    toolName: string;
    displayName: string;
    durationMs: number;
    timestamp: number;
}

interface AiToolNotificationState {
    enabled: boolean;
    notifyOnlyInBackground: boolean;
    recentNotifications: AiToolNotification[];

    setEnabled: (enabled: boolean) => void;
    setNotifyOnlyInBackground: (value: boolean) => void;
    addNotification: (notification: Omit<AiToolNotification, 'id' | 'timestamp'>) => void;
    clearNotifications: () => void;
}

const MAX_NOTIFICATIONS = 50;

export const useAiToolNotificationStore = create<AiToolNotificationState>((set) => ({
    enabled: true,
    notifyOnlyInBackground: true,
    recentNotifications: [],

    setEnabled: (enabled) => set({ enabled }),

    setNotifyOnlyInBackground: (value) => set({ notifyOnlyInBackground: value }),

    addNotification: (notification) =>
        set((state) => ({
            recentNotifications: [
                {
                    ...notification,
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                },
                ...state.recentNotifications,
            ].slice(0, MAX_NOTIFICATIONS),
        })),

    clearNotifications: () => set({ recentNotifications: [] }),
}));
