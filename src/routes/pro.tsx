import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { getOrCreateGuestId } from "@/lib/guest";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Pro Plan · PagePilot AI" },
      { name: "description", content: "Upgrade to Pro for 20 tokens per month." },
    ],
  }),
  component: ProPage,
});

function ProPage() {
  const guestId = useMemo(() => getOrCreateGuestId(), []);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [tokensRemaining, setTokensRemaining] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  async function refreshBalance() {
    const { data, error } = await supabase.functions.invoke("generate-page", {
      body: { mode: "balance", guestId },
    });
    if (error || !data) return;
    const d = data as { plan?: "free" | "pro"; tokensRemaining?: number };
    if (d.plan) setPlan(d.plan);
    if (typeof d.tokensRemaining === "number") setTokensRemaining(d.tokensRemaining);
  }

  useEffect(() => {
    void refreshBalance();
  }, [guestId]);

  async function upgrade() {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-page", {
        body: { mode: "upgrade", guestId },
      });
      if (error) throw error;
      const d = data as { plan?: "pro"; tokensRemaining?: number };
      if (d.plan) setPlan(d.plan);
      if (typeof d.tokensRemaining === "number") setTokensRemaining(d.tokensRemaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upgrade failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="border-b border-border/60 bg-secondary/10 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              Pro Plan
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get 20 tokens every month
            </h1>
            <p className="mt-4 text-muted-foreground">
              Your current plan:{" "}
              <span className="font-semibold text-foreground">
                {plan === "pro" ? "PRO" : "FREE"}
              </span>{" "}
              · Tokens remaining:{" "}
              <span className="font-semibold text-foreground">{tokensRemaining}</span>
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="text-xl font-bold">Free</h2>
              <p className="mt-2 text-sm text-muted-foreground">Good for testing</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">₹0</span>
              </div>
              <p className="mt-2 text-sm font-bold text-primary">3 tokens total</p>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {["Generate 1 website + a few edits", "Shareable preview link", "Projects sidebar"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/build"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                Start building
              </Link>
            </div>

            <div className="relative rounded-3xl border border-primary/40 bg-background p-8 shadow-xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase text-primary-foreground shadow-lg">
                Best Value
              </div>
              <h2 className="text-xl font-bold">Pro</h2>
              <p className="mt-2 text-sm text-muted-foreground">For clients & daily work</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">₹999</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <p className="mt-2 text-sm font-bold text-primary">20 tokens / month</p>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {["20 tokens every month", "Faster generation", "Priority improvements"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={upgrade}
                disabled={loading || plan === "pro"}
                className="mt-8 w-full rounded-xl bg-gradient-brand text-brand-foreground shadow-lg hover:opacity-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Activating…
                  </>
                ) : plan === "pro" ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Pro active
                  </>
                ) : (
                  "Activate Pro"
                )}
              </Button>

              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
              <p className="mt-4 text-xs text-muted-foreground">
                Payments integration is not wired up here yet — this button simulates a successful upgrade.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

