import { useEffect, useRef, useCallback, memo } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { ptyEventManager } from '@/lib/ptyEventManager';
import { useTerminalStore } from '@/stores/terminalStore';
import { useTerminalSearchStore } from '@/stores/terminalSearchStore';
import { TerminalContextMenu } from './TerminalContextMenu';
import { TerminalSearchBar } from './TerminalSearchBar';
import { toast } from 'sonner';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  tabId: string;
  isActive: boolean;
}

const XTerminalInner = ({ tabId, isActive }: XTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const initializedRef = useRef(false);
  const updateTab = useTerminalStore(state => state.updateTab);

  const isSearchOpen = useTerminalSearchStore(s => s.isOpen);
  const setMatchCount = useTerminalSearchStore(s => s.setMatchCount);
  const setCurrentMatch = useTerminalSearchStore(s => s.setCurrentMatch);
  const closeSearch = useTerminalSearchStore(s => s.close);
  const nextMatch = useTerminalSearchStore(s => s.nextMatch);
  const prevMatch = useTerminalSearchStore(s => s.prevMatch);

  // Initialize terminal - only runs once per tabId
  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return;

    initializedRef.current = true;

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0a0a0a',
        foreground: '#e4e4e7',
        cursor: '#22c55e',
        cursorAccent: '#0a0a0a',
        selectionBackground: '#3f3f46',
        black: '#18181b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      allowProposedApi: true,
      scrollback: 5000,
      convertEol: true,
      rightClickSelectsWord: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon);

    // Open terminal in container
    term.open(terminalRef.current);

    // Store refs
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    // Fit to container after a small delay
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 50);

    // Handle user input - send directly to PTY
    term.onData((data) => {
      window.ipcRenderer.invoke('send-input', tabId, data);
    });

    // Register with global event manager (no new listeners created)
    ptyEventManager.register(tabId, {
      onOutput: (data: string) => {
        if (xtermRef.current) {
          xtermRef.current.write(data);
        }
      },
      onExit: (exitCode: number) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\r\n[Process exited with code ${exitCode}]`);
        }
      }
    });

    // Handle selection change - manual copy on selection for better UX
    // Debounce to prevent race conditions and toast spam
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    term.onSelectionChange(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      debounceTimer = setTimeout(() => {
        if (xtermRef.current && xtermRef.current.hasSelection()) { // Check if terminal still exists
          const selection = xtermRef.current.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).then(() => {
              toast.success('Copied', { duration: 1000 });
            }).catch(err => {
              console.warn('Failed to copy selection:', err);
            });
          }
        }
        debounceTimer = null; // Clear the reference after execution
      }, 500); // Wait 500ms after selection settles
    });

    // Update readiness in store
    updateTab(tabId, { isReady: true });

    // Cleanup function - only on unmount (tab close)
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);

      // Unregister from event manager
      ptyEventManager.unregister(tabId);

      // Dispose terminal
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
      if (fitAddonRef.current) {
        fitAddonRef.current = null;
      }
      if (searchAddonRef.current) {
        searchAddonRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [tabId, updateTab]);

  // Refit helper — shared between the always-on observer and active-focus effect
  const handleResize = useRef(() => {
    if (fitAddonRef.current && xtermRef.current) {
      try {
        fitAddonRef.current.fit();
        const dims = fitAddonRef.current.proposeDimensions();
        if (dims) {
          window.ipcRenderer.invoke('resize-pty', tabId, dims.cols, dims.rows);
        }
      } catch (e) {
        console.warn('Fit error:', e);
      }
    }
  });
  // Keep closure fresh without re-running effects
  handleResize.current = () => {
    if (fitAddonRef.current && xtermRef.current) {
      try {
        fitAddonRef.current.fit();
        const dims = fitAddonRef.current.proposeDimensions();
        if (dims) {
          window.ipcRenderer.invoke('resize-pty', tabId, dims.cols, dims.rows);
        }
      } catch (e) {
        console.warn('Fit error:', e);
      }
    }
  };

  // ResizeObserver — only fires fit + resize-pty when this terminal is active.
  // Hidden terminals skip the expensive fit/IPC cycle to avoid cascading storms.
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    if (!terminalRef.current) return;

    const observer = new ResizeObserver(() => {
      if (isActiveRef.current) {
        setTimeout(() => handleResize.current(), 50);
      }
    });
    observer.observe(terminalRef.current);

    return () => {
      observer.disconnect();
    };
  }, [tabId]);

  // Handle focus and initial fit burst when pane/tab becomes active
  useEffect(() => {
    if (!isActive || !xtermRef.current) return;

    // Focus terminal
    const isFocused = document.activeElement?.closest('.xterm-container');
    if (!isFocused) {
      xtermRef.current.focus();
    }

    // Initial fit burst with cleanup
    handleResize.current();
    const t1 = setTimeout(() => {
      handleResize.current();
      if (xtermRef.current) {
        xtermRef.current.refresh(0, xtermRef.current.rows - 1);
      }
    }, 100);
    const t2 = setTimeout(() => handleResize.current(), 300);

    // Window resize listener (only needed for the active terminal)
    const onWindowResize = () => handleResize.current();
    window.addEventListener('resize', onWindowResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onWindowResize);
    };
  }, [isActive, tabId]);

  // Search handlers
  const handleSearch = useCallback((query: string, options: { isRegex: boolean; isCaseSensitive: boolean }) => {
    if (!searchAddonRef.current) return;

    if (!query) {
      searchAddonRef.current.clearDecorations();
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const found = searchAddonRef.current.findNext(query, {
      regex: options.isRegex,
      caseSensitive: options.isCaseSensitive,
      incremental: true,
    });

    // xterm search addon doesn't expose match count directly,
    // so we do a buffer scan to count matches
    if (xtermRef.current) {
      let count = 0;
      const buffer = xtermRef.current.buffer.active;
      for (let i = 0; i < buffer.length; i++) {
        const line = buffer.getLine(i)?.translateToString() || '';
        if (!line.trim()) continue;
        try {
          if (options.isRegex) {
            const flags = options.isCaseSensitive ? 'g' : 'gi';
            const regex = new RegExp(query, flags);
            const matches = line.match(regex);
            if (matches) count += matches.length;
          } else {
            const searchLine = options.isCaseSensitive ? line : line.toLowerCase();
            const searchQuery = options.isCaseSensitive ? query : query.toLowerCase();
            let pos = 0;
            while ((pos = searchLine.indexOf(searchQuery, pos)) !== -1) {
              count++;
              pos += searchQuery.length;
            }
          }
        } catch {
          // Invalid regex, ignore
        }
      }
      setMatchCount(count);
      if (found) {
        setCurrentMatch(0);
      }
    }
  }, [setMatchCount, setCurrentMatch]);

  const handleSearchNext = useCallback(() => {
    if (searchAddonRef.current) {
      const { searchQuery, isRegex, isCaseSensitive } = useTerminalSearchStore.getState();
      searchAddonRef.current.findNext(searchQuery, {
        regex: isRegex,
        caseSensitive: isCaseSensitive,
      });
      nextMatch();
    }
  }, [nextMatch]);

  const handleSearchPrev = useCallback(() => {
    if (searchAddonRef.current) {
      const { searchQuery, isRegex, isCaseSensitive } = useTerminalSearchStore.getState();
      searchAddonRef.current.findPrevious(searchQuery, {
        regex: isRegex,
        caseSensitive: isCaseSensitive,
      });
      prevMatch();
    }
  }, [prevMatch]);

  const handleSearchClose = useCallback(() => {
    if (searchAddonRef.current) {
      searchAddonRef.current.clearDecorations();
    }
    closeSearch();
    // Re-focus terminal
    if (xtermRef.current) {
      xtermRef.current.focus();
    }
  }, [closeSearch]);

  const handleNewTab = async () => {
    const result = await window.ipcRenderer.invoke('create-new-tab') as { success: boolean; tabId: string; cwd: string; title: string };
    if (result.success) {
      useTerminalStore.getState().addTab({
        id: result.tabId,
        title: result.title,
        cwd: result.cwd,
        isReady: false,
      });
    }
  };

  const handleNewWindow = () => {
    window.ipcRenderer.invoke('create-new-window');
  };

  const handleCopy = () => {
    if (xtermRef.current?.hasSelection()) {
      const selection = xtermRef.current.getSelection();
      navigator.clipboard.writeText(selection).then(() => {
        toast.success('Copied to clipboard');
      }).catch(err => {
        console.warn('Failed to copy selection:', err);
      });
      xtermRef.current.clearSelection();
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      if (text) {
        window.ipcRenderer.invoke('send-input', tabId, text);
      }
    }).catch(err => {
      console.warn('Failed to read clipboard:', err);
    });
  };

  return (
    <TerminalContextMenu
      onNewTab={handleNewTab}
      onNewWindow={handleNewWindow}
      onCopy={handleCopy}
      onPaste={handlePaste}
    >
      <div className="relative w-full h-full">
        {isActive && isSearchOpen && (
          <TerminalSearchBar
            onSearch={handleSearch}
            onNext={handleSearchNext}
            onPrev={handleSearchPrev}
            onClose={handleSearchClose}
          />
        )}
        <div
          ref={terminalRef}
          className="w-full h-full bg-[#0a0a0a] xterm-container"
          style={{
            padding: '8px',
            minHeight: '300px',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </div>
    </TerminalContextMenu>
  );
};

export const XTerminal = memo(XTerminalInner);
