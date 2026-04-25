import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  RefreshCw,
  Palette,
  Layout,
  MessageSquare,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Code as CodeIcon,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  buildVersions,
  VersionsSidebar,
  type ChatMessage,
  type Version,
} from "@/components/builder/versions-sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Search = { prompt?: string; id?: string };

export const Route = createFileRoute("/build")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    prompt: typeof raw.prompt === "string" ? raw.prompt : undefined,
    id: typeof raw.id === "string" ? raw.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Build your landing page · PagePilot AI" },
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

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) {
        navigate({ to: "/" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate({ to: "/" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [tab, setTab] = useState<"preview" | "code">("preview");

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

  const [simulatedCode, setSimulatedCode] = useState("");

  useEffect(() => {
    let interval: any;
    if (loading && tab === "code") {
      const lines = [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <script src="https://cdn.tailwindcss.com"></script>',
        '  <title>Generating...</title>',
        "</head>",
        "<body>",
        '  <header class="bg-white shadow-sm">',
        '    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">',
        "      <!-- Building header... -->",
        "    </nav>",
        "  </header>",
        '  <main class="min-h-screen">',
        '    <section class="relative bg-gradient-brand text-white py-20">',
        "      <!-- Crafting hero section... -->",
        "    </section>",
        "  </main>",
        "</body>",
        "</html>"
      ];
      let i = 0;
      interval = setInterval(() => {
        setSimulatedCode((prev) => prev + (lines[i] || "") + "\n");
        i++;
        if (i >= lines.length) i = 0;
      }, 150);
    } else {
      setSimulatedCode("");
    }
    return () => clearInterval(interval);
  }, [loading, tab]);

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

  function exportHtml() {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-page-${pageId || "export"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const quickActions = [
    { label: "Hero", prompt: "Regenerate the hero section with a new design and copy", icon: Layout },
    { label: "Colors", prompt: "Suggest a completely new color palette and apply it", icon: Palette },
    { label: "Pricing", prompt: "Add or update the pricing section with better tiers", icon: RefreshCw },
    { label: "FAQ", prompt: "Expand the FAQ section with more relevant questions", icon: MessageSquare },
    { label: "CTA", prompt: "Make the call-to-action more compelling and prominent", icon: Sparkles },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? "Hide version history" : "Show version history"}
                aria-pressed={sidebarOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <span className="hidden sm:inline">PagePilot AI</span>
              </span>
            </div>

            {pageId && (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs lg:flex">
                  <span className="text-muted-foreground">Live URL:</span>
                  <code className="font-mono text-foreground">/p/{pageId}</code>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyShare}
                      className="h-9 gap-1.5 text-xs"
                      aria-label="Copy share link"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy live page URL</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportHtml}
                      className="h-9 gap-1.5 text-xs"
                      aria-label="Export HTML"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Export HTML</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download as standalone HTML file</TooltipContent>
                </Tooltip>

                <Button
                  asChild
                  size="sm"
                  className="h-9 gap-1.5 bg-gradient-brand text-xs font-semibold text-brand-foreground shadow shadow-primary/30"
                >
                  <a href={`/p/${pageId}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open</span>
                  </a>
                </Button>
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
              <aside className="flex flex-col border-r border-border bg-card/40" aria-label="Chat and controls">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 && !loading && (
                    <EmptyChat onPick={(p) => send(p)} />
                  )}
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <Bubble key={i} role={m.role} content={m.content} />
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 rounded-2xl bg-accent/50 px-4 py-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
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

                <div className="border-t border-border bg-background p-3">
                  {pageId && !loading && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => send(action.prompt)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Regenerate ${action.label}`}
                        >
                          <action.icon className="h-3 w-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={handleSubmit}
                    className="relative"
                  >
                    <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
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
                        aria-label="Chat input"
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
                        aria-label="Send message"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 px-2 text-[11px] text-muted-foreground">
                      Press <kbd className="font-sans font-medium">Enter</kbd> to send · <kbd className="font-sans font-medium">Shift+Enter</kbd> for new line
                    </p>
                  </form>
                </div>
              </aside>

              {/* Preview panel */}
              <main className="flex flex-col overflow-hidden bg-muted/40 p-4" aria-label="Page preview">
                {/* Toolbar */}
                <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={tab === "preview" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTab("preview")}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant={tab === "code" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTab("code")}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <CodeIcon className="h-3.5 w-3.5" />
                      Code
                    </Button>
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">URL</span>
                      <div className="h-3 w-px bg-border" />
                      <span className="truncate text-xs text-foreground font-mono">
                        /p/{pageId || "new-page"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 mr-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode("desktop")}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${viewMode === "desktop" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Monitor className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Desktop view</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode("tablet")}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${viewMode === "tablet" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Tablet className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Tablet view</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setViewMode("mobile")}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${viewMode === "mobile" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Smartphone className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Mobile view</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={exportHtml}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download HTML</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild disabled={!pageId}>
                          <a href={`/p/${pageId}`} target="_blank" rel="noreferrer">
                            <Maximize2 className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Full preview</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
                  {tab === "preview" ? (
                    <div className="flex h-full w-full items-center justify-center bg-muted/20">
                      <div 
                        className="h-full transition-all duration-300 ease-in-out overflow-hidden"
                        style={{
                          width: viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "768px" : "375px",
                          maxWidth: "100%"
                        }}
                      >
                        {html ? (
                          <iframe
                            title="Generated landing page preview"
                            srcDoc={html}
                            className="h-full w-full bg-white"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        ) : (
                          <PreviewSkeleton loading={loading} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full overflow-hidden bg-[#0d1117] text-gray-300">
                      <pre className="h-full w-full overflow-auto p-6 font-mono text-xs leading-relaxed">
                        <code>{loading ? (simulatedCode || "// Generating...") : (html || "// No code generated yet")}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Bubble({ role, content }: { role: ChatMessage["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm animate-in fade-in slide-in-from-bottom-1 ${
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
    <div className="rounded-2xl border border-dashed border-border p-5 text-sm bg-card/20">
      <p className="font-display text-lg font-semibold">
        What should we build today?
      </p>
      <p className="mt-1 text-muted-foreground text-xs">
        Describe your product, audience or vibe. The AI takes it from there.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {ideas.map((i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
