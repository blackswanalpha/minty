import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalContentProps {
  history: Array<{ type: 'input' | 'output' | 'error' | 'success'; content: string }>;
  onCommand: (command: string) => void;
  onClear: () => void;
  onInput?: (input: string) => void;
  onInterrupt?: () => void;
  cwd?: string;
  isExecuting?: boolean;
  isInteractive?: boolean;
}

export const TerminalContent = ({
  history,
  onCommand,
  onClear,
  onInput,
  onInterrupt,
  cwd = '~',
  isExecuting = false,
  isInteractive = false
}: TerminalContentProps) => {
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputCommands = history
    .filter(h => h.type === 'input')
    .map(h => h.content.replace('$ ', ''));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount and when not executing
  useEffect(() => {
    if (!isExecuting) {
      inputRef.current?.focus();
    }
  }, [isExecuting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+C - interrupt
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (onInterrupt) {
        onInterrupt();
      }
      return;
    }

    // Ctrl+L - clear
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
      return;
    }

    // Ctrl+D - EOF
    if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      if (onInput) {
        onInput('\x04');
      }
      return;
    }

    if (e.key === 'Enter') {
      if (currentInput.toLowerCase().trim() === 'clear') {
        onClear();
      } else {
        onCommand(currentInput);
      }
      setCurrentInput("");
      setCommandHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputCommands.length > 0) {
        const newIndex = commandHistoryIndex < inputCommands.length - 1
          ? commandHistoryIndex + 1
          : commandHistoryIndex;
        setCommandHistoryIndex(newIndex);
        setCurrentInput(inputCommands[inputCommands.length - 1 - newIndex] || "");
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryIndex > 0) {
        const newIndex = commandHistoryIndex - 1;
        setCommandHistoryIndex(newIndex);
        setCurrentInput(inputCommands[inputCommands.length - 1 - newIndex] || "");
      } else {
        setCommandHistoryIndex(-1);
        setCurrentInput("");
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion could be added here
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-foreground';
      case 'success':
        return 'text-terminal-green';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className="flex-1 bg-background cursor-text"
      onClick={focusInput}
    >
      <ScrollArea className="h-[calc(100vh-140px)]" ref={scrollRef}>
        <div className="p-4 font-mono text-sm leading-relaxed">
          {history.map((line, index) => (
            <div key={index} className={`${getLineClass(line.type)} whitespace-pre-wrap`}>
              {line.content}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center gap-2 mt-1">
            {!isInteractive && (
              <>
                <span className="text-terminal-green">{cwd}</span>
                <span className="text-primary">$</span>
              </>
            )}
            {isExecuting && !isInteractive ? (
              <span className="text-muted-foreground animate-pulse">executing...</span>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-foreground font-mono caret-primary"
                  autoFocus
                  spellCheck={false}
                  placeholder={isInteractive ? "" : ""}
                />
                <span className="w-2 h-5 bg-primary cursor-blink" />
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
