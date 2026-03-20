
import { useState, useEffect, useMemo } from "react";
import {
  Terminal as PhTerminal,
  ClockCounterClockwise,
  FolderOpen,
  Command,
  Keyboard,
  ArrowRight,
} from "@phosphor-icons/react";
import { useTerminalStore } from "@/stores/terminalStore";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";
import { useKeyboardShortcutsStore } from "@/stores/keyboardShortcutsStore";

interface CachedEntry {
  windowId: number;
  timestamp: number;
  tabs: { id: string; title: string; cwd: string; type?: string }[];
  activeTabId: string;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export const WelcomePage = () => {
  const addTab = useTerminalStore((state) => state.addTab);
  const [cachedSessions, setCachedSessions] = useState<CachedEntry[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  useEffect(() => {
    window.cacheApi
      .getState()
      .then((state) => {
        if (state?.entries?.length) {
          setCachedSessions(
            [...state.entries]
              .filter(
                (e) =>
                  e.tabs?.length > 0 &&
                  e.tabs.some((t: { type?: string }) => t.type !== "welcome")
              )
              .sort((a, b) => b.timestamp - a.timestamp)
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingSessions(false));
  }, []);

  const handleNewTerminal = async () => {
    const id = window.crypto.randomUUID();

    try {
      const cwd = (await window.ipcRenderer.invoke("init-tab", id)) as string;

      addTab({
        id,
        title: cwd.split("/").pop() || "home",
        cwd: cwd,
        isReady: false,
        type: "terminal",
      });

      const { tabs, removeTab } = useTerminalStore.getState();
      const welcomeTab = tabs.find((t) => t.type === "welcome");
      if (welcomeTab) {
        await window.ipcRenderer.invoke("remove-tab", welcomeTab.id).catch(() => {});
        removeTab(welcomeTab.id);
      }
    } catch (error) {
      console.error("Failed to create terminal:", error);
    }
  };

  const handleRestoreSession = async (entry: CachedEntry) => {
    try {
      const terminalTabs = entry.tabs.filter((t) => t.type !== "welcome");
      for (const tab of terminalTabs) {
        try {
          await window.ipcRenderer.invoke("init-tab", tab.id, tab.cwd);
        } catch {
          /* skip failed tab */
        }
        addTab({
          id: tab.id,
          title: tab.title || tab.cwd.split("/").pop() || "home",
          cwd: tab.cwd,
          isReady: false,
          type: "terminal",
        });
      }
      if (entry.activeTabId) {
        useTerminalStore.getState().setActiveTab(entry.activeTabId);
      }
      const { tabs, removeTab } = useTerminalStore.getState();
      const welcomeTab = tabs.find((t) => t.type === "welcome");
      if (welcomeTab) {
        await window.ipcRenderer.invoke("remove-tab", welcomeTab.id).catch(() => {});
        removeTab(welcomeTab.id);
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }
  };

  const handleOpenCommandPalette = () => useCommandPaletteStore.getState().toggle();
  const handleOpenKeyboardShortcuts = () => useKeyboardShortcutsStore.getState().openModal();

  const displayedSessions = cachedSessions.slice(0, 5);

  return (
    <div className="h-full w-full overflow-y-auto bg-background animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="relative max-w-xl w-full p-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Minty Terminal</span>
          </h1>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </h2>

          {/* New Terminal — primary, full-width */}
          <button
            onClick={handleNewTerminal}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <PhTerminal size={20} weight="duotone" className="text-primary" />
              <span className="text-sm font-medium">New Terminal</span>
            </div>
            <kbd className="font-mono text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              Ctrl+T
            </kbd>
          </button>

          {/* Command Palette + Shortcuts — row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenCommandPalette}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary hover:border-primary/30 transition-all cursor-pointer"
            >
              <Command size={16} weight="light" className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Commands</span>
            </button>
            <button
              onClick={handleOpenKeyboardShortcuts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary hover:border-primary/30 transition-all cursor-pointer"
            >
              <Keyboard size={16} weight="light" className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Shortcuts</span>
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <ClockCounterClockwise size={14} weight="duotone" />
            Recent Sessions
          </h2>

          {isLoadingSessions ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : displayedSessions.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
              <ClockCounterClockwise size={32} weight="thin" className="opacity-40" />
              <p className="text-sm">No recent sessions</p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayedSessions.map((session) => {
                const terminalTabs = session.tabs.filter((t) => t.type !== "welcome");
                const primaryCwd = terminalTabs[0]?.cwd || "";
                const dirName =
                  terminalTabs[0]?.title || primaryCwd.split("/").pop() || "home";
                const shortPath = primaryCwd.replace(/^\/home\/[^/]+/, "~");

                return (
                  <button
                    key={`${session.windowId}-${session.timestamp}`}
                    onClick={() => handleRestoreSession(session)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/70 transition-all cursor-pointer group text-left"
                  >
                    <FolderOpen
                      size={16}
                      weight="light"
                      className="text-muted-foreground shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{dirName}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {terminalTabs.length} {terminalTabs.length === 1 ? "tab" : "tabs"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{shortPath}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(session.timestamp)}
                    </span>
                    <ArrowRight
                      size={14}
                      weight="light"
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground/60 pt-2">
          <kbd className="font-mono text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5">
            Ctrl+Shift+P
          </kbd>{" "}
          for commands
        </p>
      </div>
    </div>
  );
};
