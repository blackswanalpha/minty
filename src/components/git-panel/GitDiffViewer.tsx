import { X } from '@phosphor-icons/react';
import { useGitStore } from '@/stores/gitStore';
import { ScrollArea } from '@/components/ui/scroll-area';

function parseDiffLines(rawDiff: string) {
  return rawDiff.split('\n').map((line, i) => {
    let type: 'add' | 'remove' | 'header' | 'context' = 'context';
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
      type = 'header';
    } else if (line.startsWith('@@')) {
      type = 'header';
    } else if (line.startsWith('+')) {
      type = 'add';
    } else if (line.startsWith('-')) {
      type = 'remove';
    }
    return { line, type, key: i };
  });
}

export function GitDiffViewer() {
  const diffResult = useGitStore(s => s.diffResult);
  const selectedDiffFile = useGitStore(s => s.selectedDiffFile);
  const selectedDiffStaged = useGitStore(s => s.selectedDiffStaged);
  const clearDiff = useGitStore(s => s.clearDiff);

  if (!diffResult || !selectedDiffFile) return null;

  const lines = parseDiffLines(diffResult.rawDiff);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={clearDiff}>
      <div
        className="w-[90%] max-w-3xl max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="text-xs">
            <span className="font-medium text-foreground">{selectedDiffFile}</span>
            <span className="text-muted-foreground ml-2">
              ({selectedDiffStaged ? 'staged' : 'unstaged'})
            </span>
          </div>
          <button
            onClick={clearDiff}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Diff content */}
        <ScrollArea className="flex-1">
          <div className="font-mono text-xs p-2">
            {lines.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center">No diff available</p>
            ) : (
              lines.map(({ line, type, key }) => (
                <div
                  key={key}
                  className={`px-2 py-0 whitespace-pre-wrap break-all ${
                    type === 'add'
                      ? 'bg-green-500/10 text-green-400'
                      : type === 'remove'
                        ? 'bg-red-500/10 text-red-400'
                        : type === 'header'
                          ? 'text-blue-400 bg-blue-500/5'
                          : 'text-foreground/70'
                  }`}
                >
                  {line || ' '}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
