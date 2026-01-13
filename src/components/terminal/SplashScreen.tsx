import { useState, useEffect } from "react";
import {
  Rocket,
  Sparkles,
  Code2,
  Zap,
  ArrowRight,
  Command,
  Cpu,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentStep < 3) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Intelligent code generation & enhancement"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized build & deploy pipelines"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Smart Debugging",
      description: "AI-assisted error detection & fixes"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Deploy Anywhere",
      description: "One-click deployment to any platform"
    }
  ];

  const loadingSteps = [
    { text: "Initializing AI engine...", icon: <Cpu className="w-4 h-4" /> },
    { text: "Loading development tools...", icon: <Command className="w-4 h-4" /> },
    { text: "Connecting to cloud services...", icon: <Globe className="w-4 h-4" /> },
    { text: "Ready to code!", icon: <Rocket className="w-4 h-4" /> }
  ];

  const getContentClass = () => {
    return showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
  };

  const getStepClass = (index: number) => {
    return index <= currentStep ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4';
  };

  const getIconClass = (index: number) => {
    if (index < currentStep) return 'bg-terminal-green/20 text-terminal-green';
    if (index === currentStep) return 'bg-primary/20 text-primary animate-pulse';
    return 'bg-muted text-muted-foreground';
  };

  const getTextClass = (index: number) => {
    if (index < currentStep) return 'text-terminal-green';
    if (index === currentStep) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getFeatureClass = () => {
    return showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  };

  const getCtaClass = () => {
    return currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-terminal-purple/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-terminal-cyan/3 rounded-full blur-[150px]" />
      </div>

      {/* Main content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-700 ${getContentClass()}`}>
        {/* Logo section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-terminal-purple/20 border border-primary/30 mb-6 relative">
            <img src="/logo.png" alt="Minty Logo" className="w-16 h-16 object-contain" />
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text glow-text">Minty</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            The AI-powered command line interface for modern development
          </p>
        </div>

        {/* Loading steps */}
        <div className="mb-12 space-y-3">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center justify-center gap-3 transition-all duration-500 ${getStepClass(index)}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`p-1.5 rounded-full ${getIconClass(index)}`}>
                {step.icon}
              </div>
              <span className={`text-sm font-mono ${getTextClass(index)}`}>
                {step.text}
              </span>
              {index < currentStep && (
                <span className="text-terminal-green">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-500 group ${getFeatureClass()}`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-700 ${getCtaClass()}`}>
          <Button
            size="lg"
            onClick={onComplete}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border group px-8"
          >
            Launch Terminal
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 rounded bg-secondary border border-border font-mono text-xs">Enter</kbd> or click to continue
          </p>
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>Built with love by Minty Team</span>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
