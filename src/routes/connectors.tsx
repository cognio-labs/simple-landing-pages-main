import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Database, Github, Globe, PlugZap, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/connectors")({
  head: () => ({
    meta: [
      { title: "Connectors Â· PagePilot AI" },
      { name: "description", content: "Integrations and connectors for your projects." },
    ],
  }),
  component: ConnectorsPage,
});

function ConnectorsPage() {
  const connectors = [
    {
      icon: Database,
      name: "Supabase",
      body: "Auth + database + Edge Functions. This project already uses Supabase for pages and AI generation.",
      status: "Enabled",
    },
    {
      icon: Cloud,
      name: "Cloudflare Workers",
      body: "Deploy functions and edge logic. This repo is set up with Wrangler config for Cloudflare.",
      status: "Configured",
    },
    {
      icon: Globe,
      name: "Custom Domain",
      body: "Point a domain to your published pages. Add DNS + verify ownership (coming soon).",
      status: "Coming soon",
    },
    {
      icon: Github,
      name: "GitHub Export",
      body: "Export generated code into a repo and version it (coming soon).",
      status: "Coming soon",
    },
    {
      icon: Shield,
      name: "Team Access",
      body: "Invite teammates and collaborate on projects (coming soon).",
      status: "Coming soon",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                <PlugZap className="h-3.5 w-3.5 text-primary" />
                Integrations
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Connectors</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Connectors are the bridge between your generated pages and real-world shipping:
                auth, deployments, domains, and collaboration.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {connectors.map((c) => (
                <Card key={c.name} className="rounded-3xl border-border bg-card/40 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="truncate text-sm font-bold">{c.name}</h2>
                        <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {c.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{c.body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

