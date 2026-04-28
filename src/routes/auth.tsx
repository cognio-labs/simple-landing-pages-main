import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in Â· PagePilot AI" },
      { name: "description", content: "Sign in to save and manage your projects across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/dashboard" });
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    const addr = email.trim();
    if (!addr) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: addr,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-brand-foreground shadow-lg shadow-primary/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save projects to your account, open them on any device, and get a clean dashboard.
            </p>
          </div>

          <Card className="rounded-3xl border-border bg-card/40 p-6">
            {session ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-semibold">
                    {session.user.email ?? session.user.id}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => navigate({ to: "/dashboard" })} className="w-full rounded-2xl">
                    Go to dashboard
                  </Button>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full rounded-2xl"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={sendMagicLink} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="h-12 rounded-2xl pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full rounded-2xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending linkâ€¦
                    </>
                  ) : (
                    "Send magic link"
                  )}
                </Button>

                {sent && (
                  <p className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                    Check your inbox â€” we sent you a sign-in link.
                  </p>
                )}
                {error && (
                  <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  Prefer guest mode?{" "}
                  <Link to={"/dashboard" as any} className="font-semibold text-primary">
                    Continue to dashboard
                  </Link>
                </div>
              </form>
            )}
          </Card>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <Link to={"/" as any} className="hover:text-foreground">
              Home
            </Link>{" "}
            Â·{" "}
            <Link to={"/build" as any} className="hover:text-foreground">
              Builder
            </Link>{" "}
            Â·{" "}
            <Link to={"/pro" as any} className="hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

