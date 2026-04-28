import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Edit3, ExternalLink, Loader2, Plus, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/lib/guest";

type PageListItem = {
  id: string;
  prompt: string;
  created_at: string;
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Â· PagePilot AI" },
      { name: "description", content: "Manage and edit your generated landing pages." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const guestId = useMemo(() => getOrCreateGuestId(), []);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PageListItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    let active = true;
    setLoading(true);
    setError(null);
    void (async () => {
      const userId = session?.user?.id ?? null;
      const base = supabase
        .from("pages")
        .select("id, prompt, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data, error } = userId
        ? await base.eq("user_id", userId as any)
        : await base.eq("guest_id", guestId as any);

      if (!active) return;
      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        setItems(
          ((data as any[]) ?? []).map((p) => ({
            id: p.id,
            prompt: p.prompt ?? "",
            created_at: p.created_at,
          })),
        );
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [guestId, session?.user?.id]);

  const filtered = items.filter((p) =>
    p.prompt.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function copyLink(pageId: string) {
    const url = `${window.location.origin}/p/${pageId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(pageId);
      window.setTimeout(() => setCopiedId(null), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {session ? "Signed in" : "Guest mode"} Â· {items.length} projects
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!session && (
                  <Link to={"/auth" as any}>
                    <Button variant="outline" className="rounded-xl">
                      Sign in
                    </Button>
                  </Link>
                )}
                <Link to={"/build" as any}>
                  <Button className="rounded-xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30">
                    <Plus className="h-4 w-4" />
                    New page
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-lg">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projectsâ€¦"
                  className="h-11 rounded-2xl pl-10"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: Open a project to keep iterating with AI.
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex items-center justify-center rounded-3xl border border-border bg-card/30 px-6 py-20">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-3 text-sm text-muted-foreground">Loading projectsâ€¦</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-border bg-card/30 px-6 py-16 text-center">
                  <p className="text-sm font-semibold">No projects yet</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Create your first page with a prompt, then keep editing from the builder.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Link to={"/build" as any}>
                      <Button className="rounded-xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30">
                        <Plus className="h-4 w-4" />
                        Generate a page
                      </Button>
                    </Link>
                    <Link to={"/resources" as any}>
                      <Button variant="outline" className="rounded-xl">
                        Explore resources
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                filtered.map((p) => (
                  <Card key={p.id} className="rounded-3xl border-border bg-card/40 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">
                          {p.prompt || "Untitled project"}
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {new Date(p.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-2xl"
                          title="Copy public link"
                          onClick={() => copyLink(p.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <a
                          href={`/p/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Open public preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Link to={"/build" as any} search={{ id: p.id } as any} className="w-full">
                        <Button variant="secondary" className="w-full rounded-2xl">
                          <Edit3 className="h-4 w-4" />
                          Open in builder
                        </Button>
                      </Link>
                      {copiedId === p.id && (
                        <span className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Copied
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

