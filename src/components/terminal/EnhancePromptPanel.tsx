import { MagicWand, Sparkle, Copy, Play } from '@phosphor-icons/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEnhancePromptStore } from '@/stores/enhancePromptStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';

export const EnhancePromptPanel = () => {
  const isOpen = useEnhancePromptStore(s => s.isOpen);
  const inputText = useEnhancePromptStore(s => s.inputText);
  const enhancedText = useEnhancePromptStore(s => s.enhancedText);
  const isEnhancing = useEnhancePromptStore(s => s.isEnhancing);
  const error = useEnhancePromptStore(s => s.error);
  const toggle = useEnhancePromptStore(s => s.toggle);
  const close = useEnhancePromptStore(s => s.close);
  const setInputText = useEnhancePromptStore(s => s.setInputText);
  const enhance = useEnhancePromptStore(s => s.enhance);
  const reset = useEnhancePromptStore(s => s.reset);

  const activeTabId = useTerminalStore(s => s.activeTabId);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const handleSendToTerminal = () => {
    if (!enhancedText || !activeTabId) return;
    const paneId = useTerminalStore.getState().getActivePaneId(activeTabId);
    window.ipcRenderer.invoke('send-input', paneId, enhancedText + '\n');
    reset();
  };

  const handleCopy = () => {
    if (!enhancedText) return;
    navigator.clipboard.writeText(enhancedText).then(() => {
      toast.success('Copied to clipboard', { duration: 1000 });
    }).catch(err => {
      console.warn('Failed to copy:', err);
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="absolute bottom-14 right-5 z-50 w-10 h-10 rounded-full
                  bg-primary text-primary-foreground shadow-lg
                  hover:bg-primary/90 hover:scale-105 hover:shadow-xl
                  active:scale-95 transition-all duration-200
                  flex items-center justify-center"
              >
                <MagicWand size={18} weight="fill" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Enhance Prompt <kbd className="ml-1 text-[10px] opacity-60">Ctrl+E</kbd></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute bottom-14 right-5 z-50 w-[400px]
            bg-background/95 backdrop-blur-xl border border-border
            rounded-xl shadow-2xl
            animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <MagicWand size={14} className="text-primary" />
              </div>
              Enhance Prompt
            </div>
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Input */}
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a command to enhance..."
                className="font-mono text-xs min-h-[72px] max-h-[120px] resize-none bg-secondary/50 border-border/50 rounded-lg"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    enhance();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Ctrl+Enter to enhance
                </span>
                <Button
                  onClick={enhance}
                  disabled={isEnhancing || !inputText.trim()}
                  size="sm"
                  className="h-7 px-3 text-xs rounded-lg"
                >
                  <Sparkle size={12} className={isEnhancing ? 'animate-spin' : ''} />
                  {isEnhancing ? 'Enhancing...' : 'Enhance'}
                </Button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
                {error}
              </div>
            )}

            {/* Result */}
            {enhancedText && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-150">
                <pre className="font-mono text-xs bg-[#0a0a0a] text-[#e4e4e7] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-[160px] overflow-y-auto border border-border/30">
                  {enhancedText}
                </pre>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm" className="h-7 text-xs rounded-lg flex-1">
                    <Copy size={12} />
                    Copy
                  </Button>
                  <Button onClick={handleSendToTerminal} size="sm" className="h-7 text-xs rounded-lg flex-1">
                    <Play size={12} />
                    Run in Terminal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
