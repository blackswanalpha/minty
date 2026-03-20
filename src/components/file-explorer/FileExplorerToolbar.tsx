import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowClockwise,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function ToolbarButton({
  onClick,
  disabled,
  tooltip,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className="p-1 rounded-sm hover:bg-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function FileExplorerToolbar() {
  const currentPath = useFileExplorerStore((s) => s.currentPath);
  const historyIndex = useFileExplorerStore((s) => s.historyIndex);
  const history = useFileExplorerStore((s) => s.history);
  const showHidden = useFileExplorerStore((s) => s.showHidden);
  const goBack = useFileExplorerStore((s) => s.goBack);
  const goForward = useFileExplorerStore((s) => s.goForward);
  const navigateUp = useFileExplorerStore((s) => s.navigateUp);
  const navigateTo = useFileExplorerStore((s) => s.navigateTo);
  const refresh = useFileExplorerStore((s) => s.refresh);
  const toggleHidden = useFileExplorerStore((s) => s.toggleHidden);

  const pathSegments = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="border-b border-border px-2 py-1.5 flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={goBack} disabled={historyIndex <= 0} tooltip="Back">
          <ArrowLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          tooltip="Forward"
        >
          <ArrowRight size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={navigateUp} disabled={currentPath === '/'} tooltip="Up">
          <ArrowUp size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={refresh} tooltip="Refresh">
          <ArrowClockwise size={14} />
        </ToolbarButton>
        <div className="flex-1" />
        <ToolbarButton onClick={toggleHidden} tooltip={showHidden ? 'Hide hidden files' : 'Show hidden files'}>
          {showHidden ? <EyeSlash size={14} /> : <Eye size={14} />}
        </ToolbarButton>
      </div>
      <div className="flex items-center gap-0.5 text-xs text-muted-foreground overflow-x-auto scrollbar-none">
        <button
          onClick={() => navigateTo('/')}
          className="hover:text-foreground transition-colors shrink-0"
        >
          /
        </button>
        {pathSegments.map((segment, i) => {
          const segmentPath = '/' + pathSegments.slice(0, i + 1).join('/');
          const isLast = i === pathSegments.length - 1;
          return (
            <span key={segmentPath} className="flex items-center gap-0.5">
              <span className="text-muted-foreground/50">/</span>
              <button
                onClick={() => navigateTo(segmentPath)}
                className={`hover:text-foreground transition-colors truncate max-w-[120px] ${
                  isLast ? 'text-foreground' : ''
                }`}
              >
                {segment}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
