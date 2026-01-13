import { useState } from "react";
import { Send, Copy, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { enhancePrompt } from "@/lib/agentTools";

interface ToolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: {
    id: string;
    label: string;
    placeholder: string;
    description: string;
    icon: React.ElementType;
  };
}

export const ToolModal = ({ open, onOpenChange, tool }: ToolModalProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!tool) return null;

  const Icon = tool.icon;



  // ... inside ToolModal component

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      if (tool.id === 'enhance') {
        // Use current working directory for the enhancement context
        const cwd = await window.ipcRenderer.invoke('get-cwd', 'active-tab-id-placeholder') as string || '.';
        const enhanced = await enhancePrompt(input, cwd);
        setOutput(enhanced);

        toast({
          title: "Prompt Enhanced",
          description: "Your prompt has been enriched with codebase context.",
        });
      } else {
        // Simulate processing for other tools
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOutput(`[${tool.label}] Processed output:\n\n${input}\n\n---\nGenerated with lovable-cli v1.0.0`);

        toast({
          title: "Processing complete",
          description: `${tool.label} has finished processing your input.`,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "Output has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {tool.label}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground">
              Input
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.placeholder}
              className="min-h-[150px] font-mono text-sm bg-background border-border resize-none focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Process
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {output && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-sm font-mono text-muted-foreground">
                  Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border font-mono text-sm whitespace-pre-wrap text-foreground max-h-[300px] overflow-y-auto custom-scrollbar">
                {output}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
