import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { ptyEventManager } from '@/lib/ptyEventManager';
import { useTerminalStore } from '@/stores/terminalStore';
import { TerminalContextMenu } from './TerminalContextMenu';
import { toast } from 'sonner';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  tabId: string;
  isActive: boolean;
}

export const XTerminal = ({ tabId, isActive }: XTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initializedRef = useRef(false);
  const updateTab = useTerminalStore(state => state.updateTab);

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
      scrollback: 10000,
      convertEol: true,
      rightClickSelectsWord: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal in container
    term.open(terminalRef.current);

    // Store refs
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

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
    // Handle selection change - manual copy on selection for better UX
    // Debounce to prevent race conditions and toast spam
    let debounceTimer: ReturnType<typeof setTimeout>;

    term.onSelectionChange(() => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        if (term.hasSelection()) {
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).then(() => {
              toast.success('Copied', { duration: 1000 });
            }).catch(err => {
              console.warn('Failed to copy selection:', err);
            });
          }
        }
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
      initializedRef.current = false;
    };
  }, [tabId, updateTab]);

  // Handle focus and resize when tab becomes active
  useEffect(() => {
    if (!isActive || !xtermRef.current) return;

    // Focus terminal
    const isFocused = document.activeElement?.closest('.xterm-container');
    if (!isFocused) {
      xtermRef.current.focus();
    }

    // Fit terminal
    const handleResize = () => {
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

    // Initial fit
    handleResize();
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 300);

    // Listen for resize
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        setTimeout(handleResize, 50);
      });
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isActive, tabId]);


  const handleNewTab = () => {
    window.ipcRenderer.invoke('create-new-tab');
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
    </TerminalContextMenu>
  );
};
