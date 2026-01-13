import { Terminal } from "./Terminal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Command } from "lucide-react";

const terminalLines = [
  { type: "command" as const, content: "npx minty init my-project", delay: 800 },
  { type: "output" as const, content: "✓ Creating project structure...", delay: 400 },
  { type: "output" as const, content: "✓ Initializing AI agent context...", delay: 400 },
  { type: "output" as const, content: "✓ Setting up development environment...", delay: 400 },
  { type: "command" as const, content: "minty generate component Button", delay: 600 },
  { type: "output" as const, content: "✓ Generated src/components/Button.tsx", delay: 300 },
  { type: "output" as const, content: "✓ Added tests and documentation", delay: 300 },
  { type: "command" as const, content: "minty deploy --preview", delay: 500 },
  { type: "output" as const, content: "✓ Preview deployed at https://preview.minty.dev/abc123", delay: 400 },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terminal-purple/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Built for AI coding agents</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text glow-text text-primary">Minty</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              The command-line interface for AI-powered development. Generate, refactor, and deploy code with intelligent agents.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border group">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:border-primary/50">
                <Command className="w-4 h-4 mr-2" />
                View Commands
              </Button>
            </div>

            {/* Quick install */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
              <code className="font-mono text-sm">
                <span className="text-primary">$</span>{" "}
                <span className="text-foreground">npm install -g @minty/cli</span>
              </code>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Terminal lines={terminalLines} className="animate-pulse-glow" />
          </div>
        </div>
      </div>
    </section>
  );
};
