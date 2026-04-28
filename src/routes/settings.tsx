import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LogOut, Settings2, Sparkles, User } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/lib/guest";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings Â· PagePilot AI" },
      { name: "description", content: "Manage your account and plan settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const guestId = useMemo(() => getOrCreateGuestId(), []);
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [tokensRemaining, setTokensRemaining] = useState<number>(3);

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

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.functions.invoke("generate-page", {
        body: { mode: "balance", guestId },
      });
      if (error || !data) return;
      const d = data as { plan?: "free" | "pro"; tokensRemaining?: number };
      if (d.plan) setPlan(d.plan);
      if (typeof d.tokensRemaining === "number") setTokensRemaining(d.tokensRemaining);
    })();
  }, [guestId, session?.user?.id]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
                Preferences
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Account, plan, and basic preferences for PagePilot AI.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-3xl border-border bg-card/40 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold">Account</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {session ? "Signed in" : "Guest mode"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-background/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Identity</p>
                  <p className="mt-1 truncate text-sm font-semibold">
                    {session?.user?.email ?? "Guest (local browser)"}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link to={"/auth" as any} className="w-full">
                    <Button variant="secondary" className="w-full rounded-2xl">
                      {session ? "Manage sign-in" : "Sign in"}
                    </Button>
                  </Link>
                  {session && (
                    <Button variant="outline" className="w-full rounded-2xl" onClick={logout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="rounded-3xl border-border bg-card/40 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold">Plan</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tokens power AI generations and edits.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="mt-1 text-sm font-bold">
                      {plan === "pro" ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-primary" />
                          PRO
                        </span>
                      ) : (
                        "FREE"
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
                    <p className="text-xs text-muted-foreground">Tokens remaining</p>
                    <p className="mt-1 text-sm font-bold">{tokensRemaining}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link to={"/pro" as any} className="w-full">
                    <Button className="w-full rounded-2xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30">
                      View pricing
                    </Button>
                  </Link>
                  <Link to={"/build" as any} className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl">
                      Go to builder
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

