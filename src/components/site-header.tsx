import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, PlusCircle, LogOut, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            PagePilot<span className="text-gradient-brand"> AI</span>
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
            {profile && (
              <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-xs font-bold text-orange-700">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400 text-[10px] text-white">₵</span>
                {profile.tokens_remaining}
                <PlusCircle className="h-3.5 w-3.5 text-orange-400" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-bold text-white text-xs">
                  {session.user.email?.[0].toUpperCase() || "U"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="h-9 w-9 text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Link
                  to="/build"
                  className="hidden sm:inline-flex h-9 items-center gap-2 rounded-full bg-gradient-brand px-4 text-xs font-semibold text-brand-foreground shadow-md transition-transform hover:scale-[1.03] lg:flex"
                >
                  Start building
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-brand px-6 text-xs font-semibold text-brand-foreground shadow-md transition-transform hover:scale-[1.03]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
