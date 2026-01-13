import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Square, GitBranch, ExternalLink, Terminal } from "lucide-react";

interface WindowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WindowModal({ open, onOpenChange }: WindowModalProps): React.JSX.Element {
  const [isCreating, setIsCreating] = useState(false);

  const handleNewWindow = async (): Promise<void> => {
    setIsCreating(true);
    try {
      await window.ipcRenderer.invoke("create-new-window");
      toast({
        title: "New Window",
        description: "Opening a new terminal window...",
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create new window",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewTab = async (): Promise<void> => {
    setIsCreating(true);
    try {
      await window.ipcRenderer.invoke("create-new-tab");
      toast({
        title: "New Tab",
        description: "Opening a new tab in the current window...",
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create new tab",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Square className="w-4 h-4 text-primary" />
            </div>
            Open New
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new terminal window or tab to organize your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={handleNewWindow}
            disabled={isCreating}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border hover:border-primary hover:bg-secondary/30 transition-all group disabled:opacity-50"
          >
            <div className="p-3 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <span className="block font-medium">New Window</span>
              <span className="text-xs text-muted-foreground">Open in separate window</span>
            </div>
          </button>

          <button
            onClick={handleNewTab}
            disabled={isCreating}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border hover:border-primary hover:bg-secondary/30 transition-all group disabled:opacity-50"
          >
            <div className="p-3 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <span className="block font-medium">New Tab</span>
              <span className="text-xs text-muted-foreground">Add tab to current window</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-secondary/20 border border-border/50">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Tip: Use <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs">Ctrl+Shift+T</kbd> for new tab
          </span>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface WindowModalDemoProps {
  onOpenChange: (open: boolean) => void;
}

export function WindowModalDemo({ onOpenChange }: WindowModalDemoProps): React.JSX.Element {
  return (
    <button
      onClick={() => onOpenChange(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <Plus className="w-4 h-4" />
      <span>Open New</span>
    </button>
  );
}
