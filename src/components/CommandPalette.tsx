import { useEffect, useRef, useCallback } from 'react';
import { Command, Search } from 'lucide-react';
import { useCommandPaletteStore, filterCommands } from '@/stores/commandPaletteStore';

export const CommandPalette = () => {
  const isOpen = useCommandPaletteStore(s => s.isOpen);
  const searchQuery = useCommandPaletteStore(s => s.searchQuery);
  const selectedIndex = useCommandPaletteStore(s => s.selectedIndex);
  const commands = useCommandPaletteStore(s => s.commands);
  const close = useCommandPaletteStore(s => s.close);
  const setSearchQuery = useCommandPaletteStore(s => s.setSearchQuery);
  const setSelectedIndex = useCommandPaletteStore(s => s.setSelectedIndex);
  const executeSelected = useCommandPaletteStore(s => s.executeSelected);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = filterCommands(commands, searchQuery);

  // Group by category
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(Math.min(selectedIndex + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelected();
    }
  }, [close, setSelectedIndex, selectedIndex, filtered.length, executeSelected]);

  if (!isOpen) return null;

  // Build flat index for rendering
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={close}>
      <div
        className="w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-secondary rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </div>
                {cmds.map(cmd => {
                  const idx = flatIndex++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-selected={isSelected}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-foreground'
                          : 'text-foreground/80 hover:bg-accent/50'
                      }`}
                      onClick={() => {
                        cmd.action();
                        close();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <Command className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-secondary rounded border border-border shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-secondary rounded border border-border">&uarr;&darr;</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-secondary rounded border border-border">Enter</kbd>
            Execute
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-secondary rounded border border-border">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};
