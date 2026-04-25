import { Link } from "@tanstack/react-router";
import { Sparkles, History, PlusCircle, Globe } from "lucide-react";
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

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#templates" className="transition-colors hover:text-foreground">
            Templates
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 sm:flex">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex h-4 w-5 items-center justify-center overflow-hidden rounded-sm bg-muted text-[10px]">🇺🇸</span>
              English
              <ChevronDown className="h-3 w-3" />
            </div>
            
            <button className="text-muted-foreground hover:text-foreground transition-colors" title="View History">
              <History className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-xs font-bold text-orange-700">
               <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-[10px] text-white">₵</span>
               0
               <PlusCircle className="h-3.5 w-3.5 text-orange-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-bold text-white text-xs">
              A
            </div>
            <Link
              to="/build"
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-full bg-gradient-brand px-4 text-xs font-semibold text-brand-foreground shadow-md transition-transform hover:scale-[1.03] lg:flex"
            >
              Start building
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}