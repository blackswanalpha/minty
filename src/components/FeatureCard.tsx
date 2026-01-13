import { type LucideIcon } from "lucide-react";


interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  command?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  command,
}: FeatureCardProps) => {
  return (
    <div className="group relative p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:glow-border">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            {description}
          </p>
          {command && (
            <code className="inline-block px-3 py-1.5 rounded bg-secondary text-primary text-xs font-mono">
              {command}
            </code>
          )}
        </div>
      </div>
    </div>
  );
};
