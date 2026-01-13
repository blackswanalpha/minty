import { FeatureCard } from "./FeatureCard";
import {
  Wand2,
  GitBranch,
  Rocket,
  Shield,
  Layers,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Code Generation",
    description: "Generate components, functions, and entire features using natural language prompts powered by advanced AI models.",
    command: "minty generate",
  },
  {
    icon: GitBranch,
    title: "Smart Refactoring",
    description: "Intelligently refactor and optimize your codebase while maintaining functionality and improving performance.",
    command: "minty refactor",
  },
  {
    icon: Rocket,
    title: "Instant Deploy",
    description: "Deploy your projects with a single command. Get instant preview URLs and production deployments.",
    command: "minty deploy",
  },
  {
    icon: Shield,
    title: "Type Safety",
    description: "Generate type-safe code with full TypeScript support. Automatic type inference and validation.",
    command: "minty types",
  },
  {
    icon: Layers,
    title: "Project Templates",
    description: "Scaffold new projects from curated templates optimized for AI-assisted development workflows.",
    command: "minty init",
  },
  {
    icon: MessageSquare,
    title: "Interactive Mode",
    description: "Chat with AI agents directly in your terminal. Get suggestions, explanations, and code reviews.",
    command: "minty chat",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Powerful </span>
            <span className="gradient-text">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to supercharge your development workflow with AI-powered automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
