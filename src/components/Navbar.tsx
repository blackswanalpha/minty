import { Github, Book, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <img src="/logo.png" alt="Minty Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-mono font-bold text-lg text-primary">
              Minty
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#install" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Install
            </a>
            <a href="#commands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Commands
            </a>
            <Link to="/terminal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terminal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Book className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-border" asChild>
              <Link to="/terminal">
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
