import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display font-semibold text-foreground">
            PagePilot AI
          </span>
        </div>
        <p>© {new Date().getFullYear()} PagePilot AI. Build pages, not slides.</p>
      </div>
    </footer>
  );
}