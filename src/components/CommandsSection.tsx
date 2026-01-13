import { ChevronRight } from "lucide-react";

const commands = [
  {
    name: "init",
    description: "Initialize a new project with AI-ready configuration",
    usage: "lovable init <project-name> [--template <template>]",
    flags: ["--template, -t", "--force, -f", "--git"],
  },
  {
    name: "generate",
    description: "Generate code using AI based on natural language",
    usage: "lovable generate <type> <name> [options]",
    flags: ["--with-tests", "--with-docs", "--dry-run"],
  },
  {
    name: "refactor",
    description: "Intelligently refactor existing code",
    usage: "lovable refactor <file|directory> [options]",
    flags: ["--aggressive", "--preserve-comments", "--interactive"],
  },
  {
    name: "chat",
    description: "Start an interactive AI chat session",
    usage: 'lovable chat [message]',
    flags: ["--model", "--context", "--save"],
  },
  {
    name: "deploy",
    description: "Deploy your project to the cloud",
    usage: "lovable deploy [options]",
    flags: ["--preview", "--production", "--provider"],
  },
  {
    name: "analyze",
    description: "Analyze code for improvements and issues",
    usage: "lovable analyze [path]",
    flags: ["--security", "--performance", "--accessibility"],
  },
];

export const CommandsSection = () => {
  return (
    <section id="commands" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Command </span>
            <span className="gradient-text">Reference</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive documentation for all available commands.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {commands.map((cmd, index) => (
            <div
              key={cmd.name}
              className="group p-5 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <code className="text-lg font-mono font-semibold text-primary">
                      lovable {cmd.name}
                    </code>
                  </div>
                  <p className="text-muted-foreground mb-3">{cmd.description}</p>
                  <code className="block px-3 py-2 rounded bg-secondary text-sm font-mono text-foreground mb-3">
                    {cmd.usage}
                  </code>
                  <div className="flex flex-wrap gap-2">
                    {cmd.flags.map((flag) => (
                      <span
                        key={flag}
                        className="px-2 py-1 rounded bg-secondary/50 text-xs font-mono text-muted-foreground"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
