import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildVersions,
  VersionsSidebar,
  type ChatMessage,
  type Version,
} from "@/components/builder/versions-sidebar";

type Search = { prompt?: string; id?: string };

export const Route = createFileRoute("/build")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    prompt: typeof raw.prompt === "string" ? raw.prompt : undefined,
    id: typeof raw.id === "string" ? raw.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Build your landing page · LandingForge" },
      {
        name: "description",
        content: "Chat with the AI to build and refine your landing page live.",
      },
    ],
  }),
  component: BuildPage,
});

function BuildPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [pageId, setPageId] = useState<string | null>(search.id ?? null);
  const [html, setHtml] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number | null>(
    null,
  );

  const initialPromptRef = useRef<string | null>(search.prompt ?? null);
  const sentInitialRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing page if ID in URL
  useEffect(() => {
    if (!pageId) return;
    (async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("html, messages")
        .eq("id", pageId)
        .maybeSingle();
      if (error) {
        setError(error.message);
        return;
      }
      if (data) {
        setHtml(data.html);
        const msgs = (data.messages as ChatMessage[] | null) ?? [];
        setMessages(msgs);
        const versions = buildVersions(msgs);
        setActiveVersionIndex(
          versions.length ? versions[versions.length - 1].index : null,
        );
      }
    })();
  }, [pageId]);

  // Send the initial prompt (from landing page) automatically once
  useEffect(() => {
    if (sentInitialRef.current) return;
    const p = initialPromptRef.current;
    if (p && !pageId) {
      sentInitialRef.current = true;
      void send(p);
    }
  }, [pageId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(message: string) {
    if (!message.trim() || loading) return;
    setError(null);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const { data, error: invokeErr } = await supabase.functions.invoke(
        "generate-page",
        { body: { message, pageId } },
      );
      if (invokeErr) throw invokeErr;
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error ?? "Unknown error");
      }
      const result = data as {
        pageId: string;
        html: string;
        assistantMessage: string;
      };
      setHtml(result.html);
      setMessages((prev) => {
        const next: ChatMessage[] = [
          ...prev,
          {
            role: "assistant",
            content: result.assistantMessage,
            html: result.html,
            ts: new Date().toISOString(),
          },
        ];
        setActiveVersionIndex(next.length - 1);
        return next;
      });
      if (!pageId) {
        setPageId(result.pageId);
        navigate({
          to: "/build",
          search: { id: result.pageId },
          replace: true,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function revertTo(v: Version) {
    if (loading) return;
    // Truncate chat to include this assistant snapshot, drop everything after.
    const truncated = messages.slice(0, v.index + 1);
    setMessages(truncated);
    setHtml(v.html);
    setActiveVersionIndex(v.index);
    setError(null);
    if (pageId) {
      const { error: updErr } = await supabase
        .from("pages")
        .update({
          html: v.html,
          messages: truncated,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId);
      if (updErr) setError(updErr.message);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setInput("");
    void send(v);
  }

  const shareUrl =
    pageId && typeof window !== "undefined"
      ? `${window.location.origin}/p/${pageId}`
      : "";

  function copyShare() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Hide version history" : "Show version history"}
            aria-pressed={sidebarOpen}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:inline-flex"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <span className="flex items-center gap-2 font-display text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand text-brand-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            LandingForge
          </span>
        </div>

        {pageId && (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs sm:flex">
              <span className="text-muted-foreground">Live URL:</span>
              <code className="font-mono text-foreground">/p/{pageId}</code>
            </div>
            <button
              onClick={copyShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium hover:border-primary/40"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={`/p/${pageId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-brand px-3 text-xs font-semibold text-brand-foreground shadow shadow-primary/30"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <VersionsSidebar
          versions={buildVersions(messages)}
          activeIndex={activeVersionIndex}
          onRevert={revertTo}
          open={sidebarOpen}
        />
        <div className="grid min-w-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[400px_1fr]">
        {/* Chat panel */}
        <aside className="flex flex-col border-r border-border bg-card/40">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && !loading && (
              <EmptyChat onPick={(p) => send(p)} />
            )}
            <div className="space-y-3">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 rounded-2xl bg-accent/50 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Generating your page…
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-background p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  pageId
                    ? "Ask for changes… e.g. 'make the hero darker'"
                    : "Describe your landing page idea…"
                }
                rows={2}
                className="flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30 transition-opacity disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 px-2 text-[11px] text-muted-foreground">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </aside>

        {/* Preview panel */}
        <main className="flex flex-col overflow-hidden bg-muted/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            Live preview
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
            {html ? (
              <iframe
                title="Generated landing page preview"
                srcDoc={html}
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <PreviewSkeleton loading={loading} />
            )}
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: ChatMessage["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isUser
            ? "bg-gradient-brand text-brand-foreground"
            : "bg-card text-foreground border border-border"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function EmptyChat({ onPick }: { onPick: (s: string) => void }) {
  const ideas = [
    "A premium dog food subscription box",
    "Booking page for a tattoo artist in Berlin",
    "AI-powered cold email writer for sales reps",
    "Indie game launch — pixel-art roguelike",
  ];
  return (
    <div className="rounded-2xl border border-dashed border-border p-5 text-sm">
      <p className="font-display text-lg font-semibold">
        What should we build today?
      </p>
      <p className="mt-1 text-muted-foreground">
        Describe your product, audience or vibe. The AI takes it from there.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {ideas.map((i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewSkeleton({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-card to-secondary/40 p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground shadow-xl shadow-primary/40">
          <Sparkles className="h-7 w-7" />
        </div>
      </div>
      <p className="mt-6 font-display text-xl font-semibold">
        {loading ? "Crafting your page…" : "Your page will appear here"}
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {loading
          ? "Designing layout, writing copy, picking colors. Usually under 30 seconds."
          : "Type a brief on the left to begin. Each generation gets its own shareable link."}
      </p>
    </div>
  );
}