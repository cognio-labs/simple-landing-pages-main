import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Edit3, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/p/$pageId")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("pages")
      .select("id, html, prompt")
      .eq("id", params.pageId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data as { id: string; html: string; prompt: string };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${truncate(loaderData.prompt, 60)} · LandingForge`
          : "Landing page",
      },
      {
        name: "description",
        content: loaderData
          ? truncate(loaderData.prompt, 155)
          : "An AI-generated landing page from LandingForge.",
      },
      {
        property: "og:title",
        content: loaderData ? truncate(loaderData.prompt, 60) : "Landing page",
      },
      {
        property: "og:description",
        content: loaderData
          ? truncate(loaderData.prompt, 155)
          : "Generated with LandingForge.",
      },
    ],
  }),
  notFoundComponent: PageNotFound,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-muted-foreground">Couldn't load this page.</p>
        <p className="mt-2 text-xs text-destructive">{error.message}</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary">
          Go home
        </Link>
      </div>
    </div>
  ),
  component: PublicPage,
});

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function PublicPage() {
  const data = Route.useLoaderData();
  const params = Route.useParams();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Floating action bar */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
        <Link
          to="/"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur transition-colors hover:border-primary/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built with{" "}
          <span className="font-semibold text-foreground">LandingForge</span>
        </div>
        <Link
          to="/build"
          search={{ id: params.pageId }}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-brand-foreground shadow-lg shadow-primary/30"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit page
        </Link>
      </div>

      <iframe
        title={`LandingForge page ${params.pageId}`}
        srcDoc={data.html}
        className="h-screen w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

function PageNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-6xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">
          This page doesn't exist or has been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow shadow-primary/30"
        >
          <Sparkles className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}