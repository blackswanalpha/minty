import { useState, useEffect } from "react";

interface TerminalLine {
  type: "command" | "output" | "comment";
  content: string;
  delay?: number;
}

interface TerminalProps {
  lines: TerminalLine[];
  className?: string;
}

export const Terminal = ({ lines, className = "" }: TerminalProps) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const delay = lines[visibleLines]?.delay || 500;
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, lines]);

  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-terminal-red" />
        <div className="terminal-dot bg-terminal-amber" />
        <div className="terminal-dot bg-terminal-green" />
        <span className="ml-3 text-muted-foreground text-sm font-mono">
          lovable-cli
        </span>
      </div>
      <div className="terminal-body min-h-[200px]">
        {lines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className="mb-1">
            {line.type === "command" && (
              <span className="command-line text-foreground">{line.content}</span>
            )}
            {line.type === "output" && (
              <span className="text-terminal-green">{line.content}</span>
            )}
            {line.type === "comment" && (
              <span className="text-muted-foreground">{line.content}</span>
            )}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block w-2 h-4 bg-primary cursor-blink" />
        )}
      </div>
    </div>
  );
};
