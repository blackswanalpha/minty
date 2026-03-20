import { useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown, CaseSensitive, Regex } from 'lucide-react';
import { useTerminalSearchStore } from '@/stores/terminalSearchStore';

interface TerminalSearchBarProps {
  onSearch: (query: string, options: { isRegex: boolean; isCaseSensitive: boolean }) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const TerminalSearchBar = ({ onSearch, onNext, onPrev, onClose }: TerminalSearchBarProps) => {
  const isOpen = useTerminalSearchStore(s => s.isOpen);
  const searchQuery = useTerminalSearchStore(s => s.searchQuery);
  const matchCount = useTerminalSearchStore(s => s.matchCount);
  const currentMatch = useTerminalSearchStore(s => s.currentMatch);
  const isRegex = useTerminalSearchStore(s => s.isRegex);
  const isCaseSensitive = useTerminalSearchStore(s => s.isCaseSensitive);
  const setSearchQuery = useTerminalSearchStore(s => s.setSearchQuery);
  const toggleRegex = useTerminalSearchStore(s => s.toggleRegex);
  const toggleCaseSensitive = useTerminalSearchStore(s => s.toggleCaseSensitive);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Trigger search when query or options change
  useEffect(() => {
    if (isOpen) {
      onSearch(searchQuery, { isRegex, isCaseSensitive });
    }
  }, [searchQuery, isRegex, isCaseSensitive, isOpen, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 z-30 flex items-center gap-1.5 m-2 px-3 py-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        autoFocus
      />

      {/* Match counter */}
      {searchQuery && (
        <span className="text-[11px] text-muted-foreground whitespace-nowrap min-w-[3.5rem] text-center">
          {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : 'No results'}
        </span>
      )}

      {/* Toggle buttons */}
      <button
        onClick={toggleCaseSensitive}
        title="Match Case"
        className={`p-1 rounded transition-colors ${
          isCaseSensitive
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        <CaseSensitive className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={toggleRegex}
        title="Use Regular Expression"
        className={`p-1 rounded transition-colors ${
          isRegex
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        <Regex className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Navigation */}
      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        title="Previous Match (Shift+Enter)"
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        title="Next Match (Enter)"
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Close */}
      <button
        onClick={onClose}
        title="Close (Esc)"
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
