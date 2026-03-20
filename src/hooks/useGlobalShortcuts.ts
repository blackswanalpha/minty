import { useEffect, useCallback } from 'react';
import { useKeyboardShortcutsStore, matchesShortcut } from '@/stores/keyboardShortcutsStore';
import { useCommandPaletteStore, type CommandItem } from '@/stores/commandPaletteStore';
import { useTerminalSearchStore } from '@/stores/terminalSearchStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import { useGitStore } from '@/stores/gitStore';
import { useAiSettingsStore } from '@/stores/aiSettingsStore';
import { useEnhancePromptStore } from '@/stores/enhancePromptStore';

export const useGlobalShortcuts = () => {
  const shortcuts = useKeyboardShortcutsStore(s => s.shortcuts);
  const openShortcutsModal = useKeyboardShortcutsStore(s => s.openModal);
  const toggleCommandPalette = useCommandPaletteStore(s => s.toggle);
  const toggleSearch = useTerminalSearchStore(s => s.toggle);
  const registerCommands = useCommandPaletteStore(s => s.registerCommands);

  // Build and register command palette commands
  useEffect(() => {
    const getShortcutKeys = (action: string) =>
      shortcuts.find(s => s.action === action)?.keys;

    const commands: CommandItem[] = [
      {
        id: 'new-tab',
        label: 'New Tab',
        description: 'Open a new terminal tab',
        shortcut: getShortcutKeys('new-tab'),
        category: 'Tabs',
        action: () => {
          const { addTab, homeDir } = useTerminalStore.getState();
          import('uuid').then(({ v4: uuidv4 }) => {
            const newId = uuidv4();
            window.ipcRenderer.invoke('init-tab', newId).then((cwd: unknown) => {
              const dir = (cwd as string).split('/').pop() || 'home';
              addTab({ id: newId, title: dir, cwd: cwd as string, isReady: false });
            }).catch(() => {
              addTab({ id: newId, title: 'home', cwd: homeDir || '/home', isReady: false });
            });
          });
        },
      },
      {
        id: 'close-tab',
        label: 'Close Tab',
        description: 'Close the active tab',
        shortcut: getShortcutKeys('close-tab'),
        category: 'Tabs',
        action: () => {
          const { activeTabId, tabs, removeTab } = useTerminalStore.getState();
          if (tabs.length > 1) {
            window.ipcRenderer.invoke('remove-tab', activeTabId).catch(() => {});
            removeTab(activeTabId);
          }
        },
      },
      {
        id: 'next-tab',
        label: 'Next Tab',
        shortcut: getShortcutKeys('next-tab'),
        category: 'Tabs',
        action: () => {
          const { tabs, activeTabId, setActiveTab } = useTerminalStore.getState();
          const idx = tabs.findIndex(t => t.id === activeTabId);
          const nextIdx = (idx + 1) % tabs.length;
          setActiveTab(tabs[nextIdx].id);
        },
      },
      {
        id: 'prev-tab',
        label: 'Previous Tab',
        shortcut: getShortcutKeys('prev-tab'),
        category: 'Tabs',
        action: () => {
          const { tabs, activeTabId, setActiveTab } = useTerminalStore.getState();
          const idx = tabs.findIndex(t => t.id === activeTabId);
          const prevIdx = (idx - 1 + tabs.length) % tabs.length;
          setActiveTab(tabs[prevIdx].id);
        },
      },
      {
        id: 'clear-terminal',
        label: 'Clear Terminal',
        description: 'Clear terminal output',
        shortcut: getShortcutKeys('clear-terminal'),
        category: 'Terminal',
        action: () => {
          const { activeTabId, getActivePaneId } = useTerminalStore.getState();
          if (activeTabId) {
            const paneId = getActivePaneId(activeTabId);
            window.ipcRenderer.invoke('send-input', paneId, 'clear\n');
          }
        },
      },
      {
        id: 'split-terminal',
        label: 'Split Terminal',
        description: 'Split the active terminal pane',
        shortcut: getShortcutKeys('split-terminal'),
        category: 'Terminal',
        action: () => {
          const { activeTabId, splitPane } = useTerminalStore.getState();
          splitPane(activeTabId);
        },
      },
      {
        id: 'terminal-search',
        label: 'Search Terminal',
        description: 'Find text in terminal output',
        shortcut: getShortcutKeys('terminal-search'),
        category: 'Terminal',
        action: () => useTerminalSearchStore.getState().toggle(),
      },
      {
        id: 'toggle-file-explorer',
        label: 'Toggle File Explorer',
        description: 'Show/hide the file explorer panel',
        shortcut: getShortcutKeys('toggle-file-explorer'),
        category: 'Panels',
        action: () => useFileExplorerStore.getState().toggle(),
      },
      {
        id: 'toggle-git-panel',
        label: 'Source Control: Toggle Panel',
        description: 'Show/hide the source control panel',
        shortcut: 'Ctrl+Shift+G',
        category: 'Panels',
        action: () => useGitStore.getState().toggle(),
      },
      {
        id: 'toggle-enhance-prompt',
        label: 'Toggle Enhance Prompt',
        description: 'Show/hide the AI prompt panel',
        shortcut: getShortcutKeys('toggle-enhance-prompt'),
        category: 'Panels',
        action: () => useEnhancePromptStore.getState().toggle(),
      },
      {
        id: 'ai-settings',
        label: 'AI Settings',
        description: 'Configure AI provider settings',
        shortcut: getShortcutKeys('ai-settings'),
        category: 'Settings',
        action: () => useAiSettingsStore.getState().openModal(),
      },
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'View and customize keyboard shortcuts',
        shortcut: getShortcutKeys('keyboard-shortcuts'),
        category: 'Settings',
        action: () => openShortcutsModal(),
      },
      {
        id: 'copy-cwd',
        label: 'Copy Working Directory',
        description: 'Copy current working directory to clipboard',
        category: 'Terminal',
        action: () => {
          const tab = useTerminalStore.getState().getActiveTab();
          if (tab?.cwd) {
            navigator.clipboard.writeText(tab.cwd);
          }
        },
      },
      {
        id: 'new-window',
        label: 'New Window',
        description: 'Open a new Minty window',
        category: 'General',
        action: () => {
          window.ipcRenderer.invoke('create-new-window');
        },
      },
    ];

    registerCommands(commands);
  }, [shortcuts, registerCommands, openShortcutsModal]);

  // Global keydown handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't intercept when editing shortcut keys
    const editingId = useKeyboardShortcutsStore.getState().editingId;
    if (editingId) return;

    // Ctrl+Shift+G -> toggle git panel (hardcoded shortcut)
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      e.stopPropagation();
      useGitStore.getState().toggle();
      return;
    }

    for (const shortcut of shortcuts) {
      if (matchesShortcut(e, shortcut.keys)) {
        // Let copy/paste pass through to xterm's native handling
        if (shortcut.action === 'copy' || shortcut.action === 'paste') {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        switch (shortcut.action) {
          case 'command-palette':
            toggleCommandPalette();
            break;
          case 'terminal-search':
            toggleSearch();
            break;
          case 'keyboard-shortcuts':
            openShortcutsModal();
            break;
          case 'new-tab': {
            const { addTab, homeDir } = useTerminalStore.getState();
            import('uuid').then(({ v4: uuidv4 }) => {
              const newId = uuidv4();
              window.ipcRenderer.invoke('init-tab', newId).then((cwd: unknown) => {
                const dir = (cwd as string).split('/').pop() || 'home';
                addTab({ id: newId, title: dir, cwd: cwd as string, isReady: false });
              }).catch(() => {
                addTab({ id: newId, title: 'home', cwd: homeDir || '/home', isReady: false });
              });
            });
            break;
          }
          case 'close-tab': {
            const { activeTabId, tabs, removeTab } = useTerminalStore.getState();
            if (tabs.length > 1) {
              window.ipcRenderer.invoke('remove-tab', activeTabId).catch(() => {});
              removeTab(activeTabId);
            }
            break;
          }
          case 'next-tab': {
            const { tabs, activeTabId, setActiveTab } = useTerminalStore.getState();
            const idx = tabs.findIndex(t => t.id === activeTabId);
            const nextIdx = (idx + 1) % tabs.length;
            setActiveTab(tabs[nextIdx].id);
            break;
          }
          case 'prev-tab': {
            const { tabs, activeTabId, setActiveTab } = useTerminalStore.getState();
            const idx = tabs.findIndex(t => t.id === activeTabId);
            const prevIdx = (idx - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevIdx].id);
            break;
          }
          case 'clear-terminal': {
            const { activeTabId, getActivePaneId } = useTerminalStore.getState();
            if (activeTabId) {
              const paneId = getActivePaneId(activeTabId);
              window.ipcRenderer.invoke('send-input', paneId, 'clear\n');
            }
            break;
          }
          case 'split-terminal': {
            const { activeTabId, splitPane } = useTerminalStore.getState();
            splitPane(activeTabId);
            break;
          }
          // 'copy' and 'paste' are handled above — they pass through to xterm
          case 'toggle-file-explorer':
            useFileExplorerStore.getState().toggle();
            break;
          case 'toggle-git-panel':
            useGitStore.getState().toggle();
            break;
          case 'toggle-enhance-prompt':
            useEnhancePromptStore.getState().toggle();
            break;
          case 'ai-settings':
            useAiSettingsStore.getState().openModal();
            break;
        }
        return;
      }
    }
  }, [shortcuts, toggleCommandPalette, toggleSearch, openShortcutsModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
};
