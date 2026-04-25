import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Landing<span className="text-gradient-brand">Forge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#templates" className="transition-colors hover:text-foreground">
            Templates
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/build"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-brand px-5 text-sm font-semibold text-brand-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.03]"
          >
            <Sparkles className="h-4 w-4" />
            Start building
          </Link>
        </div>
      </div>
    </header>
  );
}