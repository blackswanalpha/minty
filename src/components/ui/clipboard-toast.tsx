import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Scissors, Copy, Clipboard } from "lucide-react";

export type ClipboardAction = "cut" | "copy" | "paste";

interface UseClipboardToastProps {
  action: ClipboardAction;
  content?: string;
  successMessage?: string;
}

const defaultMessages: Record<ClipboardAction, string> = {
  cut: "Text cut to clipboard",
  copy: "Text copied to clipboard",
  paste: "Text pasted from clipboard",
};

export function showClipboardToast({ action, content, successMessage }: UseClipboardToastProps): void {
  toast({
    title: action.charAt(0).toUpperCase() + action.slice(1),
    description: successMessage || (content ? `${defaultMessages[action]}: "${content.substring(0, 30)}${content.length > 30 ? "..." : ""}"` : defaultMessages[action]),
    className: "bg-card border-border",
  });
}

export function useClipboardToast(action: ClipboardAction, content?: string): void {
  useEffect(() => {
    showClipboardToast({ action, content });
  }, [action, content]);
}

export function ClipboardToastDemo(): React.JSX.Element {
  const showCutToast = () => showClipboardToast({ action: "cut", content: "Selected text here" });
  const showCopyToast = () => showClipboardToast({ action: "copy", content: "Copied content example" });
  const showPasteToast = () => showClipboardToast({ action: "paste", content: "Pasted content" });

  return (
    <div className="flex gap-2">
      <button
        onClick={showCutToast}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <Scissors className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">Cut</span>
      </button>
      <button
        onClick={showCopyToast}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <Copy className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">Copy</span>
      </button>
      <button
        onClick={showPasteToast}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <Clipboard className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">Paste</span>
      </button>
    </div>
  );
}
