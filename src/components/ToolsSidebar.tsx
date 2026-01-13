import { useState } from "react";
import { Sparkles, Bug, Terminal, Bot, GitBranch, Settings, Wrench, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolModal } from "./ToolModal";

export type ToolType = "enhance" | "bug" | "debugger" | "codereview" | "system" | "taskflow" | "settings";

interface Tool {
  id: ToolType;
  icon: React.ElementType;
  label: string;
  placeholder: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: "enhance",
    icon: Sparkles,
    label: "Enhance Prompt",
    placeholder: "Paste your prompt here to enhance it with better context, clarity, and specificity...",
    description: "Transform vague prompts into detailed, actionable instructions"
  },
  {
    id: "bug",
    icon: Bug,
    label: "Bug Reports",
    placeholder: "Describe the bug you encountered:\n\n1. Expected behavior:\n2. Actual behavior:\n3. Steps to reproduce:\n4. Environment details:",
    description: "Generate structured bug reports from descriptions"
  },
  {
    id: "debugger",
    icon: Terminal,
    label: "Debugger",
    placeholder: "Paste your error message, stack trace, or problematic code here...",
    description: "Analyze errors and suggest fixes"
  },
  {
    id: "codereview",
    icon: Code,
    label: "Code Review",
    placeholder: "Paste your code here for review:\n\n- Code quality assessment\n- Performance suggestions\n- Security vulnerabilities\n- Best practices recommendations",
    description: "Get comprehensive code reviews and improvement suggestions"
  },
  {
    id: "system",
    icon: Bot,
    label: "System Assist",
    placeholder: "Describe system prompt or assistant behavior you want to create...",
    description: "Generate optimized system prompts for AI agents"
  },
  {
    id: "taskflow",
    icon: GitBranch,
    label: "Taskflow",
    placeholder: "Describe the feature flow:\n\n- User story:\n- Acceptance criteria:\n- Technical requirements:",
    description: "Break down features into structured task flows"
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    placeholder: "Configure your CLI preferences and API settings...",
    description: "Customize your lovable-cli experience"
  }
];

export const ToolsSidebar = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <>
      <aside className="fixed left-0 top-8 bottom-0 w-14 border-r border-border bg-background/50 backdrop-blur-sm z-40 flex flex-col items-center py-4 gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className="mb-4 hover:scale-110 transition-transform duration-200 cursor-pointer">
            <img src="./logo.png" alt="Minty Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="p-2 mb-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="w-8 h-px bg-border mb-2" />
        </div>

        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <Tooltip key={tool.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-10 h-10 transition-all duration-200 ${isActive
                    ? "bg-primary/20 text-primary glow-border"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-border">
                <p className="font-mono text-xs">{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </aside>

      <ToolModal
        open={!!activeTool}
        onOpenChange={(open) => !open && setActiveTool(null)}
        tool={activeToolData}
      />
    </>
  );
};
