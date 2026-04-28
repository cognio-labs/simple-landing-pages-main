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
  Code2,
  Eye,
  Settings,
  X,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/lib/guest";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileTree } from "@/components/builder/file-tree";
import { cn } from "@/lib/utils";

type Search = { prompt?: string; id?: string };

export const Route = createFileRoute("/build")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    prompt: typeof raw.prompt === "string" ? raw.prompt : undefined,
    id: typeof raw.id === "string" ? raw.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Build your website · Aryan AI Studio" },
      {
        name: "description",
        content: "Build and edit your website live with AI.",
      },
    ],
  }),
  component: BuildPage,
});

function BuildPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const guestId = getOrCreateGuestId();

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [tokensRemaining, setTokensRemaining] = useState<number>(3);

  const [pageId, setPageId] = useState<string | null>(search.id ?? null);
  const [html, setHtml] = useState<string>("");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [selectedFile, setSelectedFile] = useState<string | null>("src/pages/Index.tsx");

  const initialPromptRef = useRef<string | null>(search.prompt ?? null);
  const sentInitialRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void (async () => {
      const { data, error: invokeErr } = await supabase.functions.invoke("generate-page", {
        body: { mode: "balance", guestId },
      });
      if (invokeErr) return;
      if (!data) return;
      const d = data as { plan?: "free" | "pro"; tokensRemaining?: number };
      if (d.plan) setPlan(d.plan);
      if (typeof d.tokensRemaining === "number") setTokensRemaining(d.tokensRemaining);
    })();
  }, [authLoading, guestId]);

  // Load existing page
  useEffect(() => {
    if (!pageId) return;
    (async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .maybeSingle();
      if (error) {
        setError(error.message);
        return;
      }
      if (data) {
        setHtml(data.html);
        const msgs = (data.messages as any[] | null) ?? [];
        setMessages(msgs);
        
        // Find latest files in messages
        const lastWithFiles = [...msgs].reverse().find(m => m.files);
        if (lastWithFiles?.files) {
          setFiles(lastWithFiles.files);
          if (!selectedFile || !lastWithFiles.files[selectedFile]) {
            const firstFile = Object.keys(lastWithFiles.files).find(k => k.endsWith('.tsx') || k.endsWith('.html'));
            if (firstFile) setSelectedFile(firstFile);
          }
        }

        const versions = buildVersions(msgs);
        setActiveVersionIndex(versions.length ? versions[versions.length - 1].index : null);
      }
    })();
  }, [pageId]);

  // Initial prompt handling
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
        { body: { message, pageId, guestId } },
      );
      if (invokeErr) throw invokeErr;
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error ?? "Unknown error");
      }
      const result = data as {
        pageId: string;
        html: string;
        files: Record<string, string>;
        assistantMessage: string;
        plan?: "free" | "pro";
        tokensRemaining?: number;
      };
      
      if (result.plan) setPlan(result.plan);
      if (typeof result.tokensRemaining === "number") setTokensRemaining(result.tokensRemaining);
      
      setHtml(result.html);
      setFiles(result.files);
      setMessages((prev) => {
        const next: ChatMessage[] = [
          ...prev,
          {
            role: "assistant",
            content: result.assistantMessage,
            html: result.html,
            files: result.files,
            ts: new Date().toISOString(),
          } as any,
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
        { role: "assistant", content: `⚠️ ${msg}` } as any,
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    send(msg);
  };

  const copyShare = () => {
    const url = `${window.location.origin}/p/${pageId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-[#0a0a0a]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-[#0a0a0a] text-foreground overflow-hidden selection:bg-primary/30">
        {/* Modern Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0d0d0d] px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-sm font-bold tracking-tight">Aryan AI Studio</span>
            </Link>
            
            <div className="h-4 w-px bg-white/10" />
            
            <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  activeTab === "preview" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  activeTab === "code" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pageId && (
              <div className="flex items-center gap-2 mr-2">
                <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1 text-[10px] font-mono text-muted-foreground lg:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  live: /{pageId}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={copyShare}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" asChild>
                   <a href={`/p/${pageId}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                </Button>
              </div>
            )}
            
            <Button size="sm" className="h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              Publish
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/10 bg-white/5">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar: Chat */}
            <ResizablePanel defaultSize={25} minSize={20} className="bg-[#0d0d0d] border-r border-white/5">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Assistant</span>
                  <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-2 py-0.5 border border-orange-500/20">
                    <span className="text-[10px] font-bold text-orange-500">{tokensRemaining} tokens</span>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <p className="text-sm">Describe what you want to build and let the AI do the magic.</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2", m.role === 'user' ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        m.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-white/5 text-foreground border border-white/10 rounded-tl-none"
                      )}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1 opacity-50">
                        {m.role === 'user' ? 'You' : 'Aryan AI'}
                      </span>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                      Thinking...
                    </div>
                  )}
                </div>

                {error && (
                  <div className="m-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
                  <form onSubmit={handleSubmit} className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="Ask me to build or change anything..."
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 pr-12 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                  <p className="mt-2 text-[10px] text-center text-muted-foreground/40">
                    Built by Aryan · Powered by AI
                  </p>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-white/5" />

            {/* Right Side: Preview or Code */}
            <ResizablePanel defaultSize={75} className="bg-[#050505]">
              {activeTab === "preview" ? (
                <div className="flex h-full flex-col">
                  {/* Preview Toolbar */}
                  <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#0d0d0d]/50 px-4 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md bg-black/40 p-1 border border-white/5">
                        <button onClick={() => setViewMode("desktop")} className={cn("p-1 rounded", viewMode === 'desktop' ? "bg-white/10 text-white" : "text-muted-foreground")}><Monitor className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setViewMode("tablet")} className={cn("p-1 rounded", viewMode === 'tablet' ? "bg-white/10 text-white" : "text-muted-foreground")}><Tablet className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setViewMode("mobile")} className={cn("p-1 rounded", viewMode === 'mobile' ? "bg-white/10 text-white" : "text-muted-foreground")}><Smartphone className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="h-4 w-px bg-white/10 mx-2" />
                      <span className="text-[11px] font-mono text-muted-foreground opacity-60">
                        {viewMode === 'desktop' ? '1280px' : viewMode === 'tablet' ? '768px' : '375px'} × 100%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1.5" onClick={() => setHtml(html)}>
                        <RefreshCw className="h-3 w-3" />
                        Reload
                      </Button>
                    </div>
                  </div>

                  {/* Preview Iframe */}
                  <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
                    <div 
                      className={cn(
                        "h-full bg-white shadow-2xl transition-all duration-500 ease-in-out rounded-xl overflow-hidden ring-1 ring-white/10",
                        viewMode === 'desktop' ? "w-full" : viewMode === 'tablet' ? "w-[768px]" : "w-[375px]"
                      )}
                    >
                      {html ? (
                        <iframe
                          title="Preview"
                          srcDoc={html}
                          className="h-full w-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-12 text-[#0a0a0a]">
                           <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                             <Sparkles className="h-8 w-8 text-primary" />
                           </div>
                           <h3 className="text-xl font-bold">Crafting your vision</h3>
                           <p className="text-sm text-muted-foreground max-w-xs">Our AI is designing a professional website based on your requirements.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full">
                  <ResizablePanelGroup direction="horizontal">
                    {/* Explorer */}
                    <ResizablePanel defaultSize={20} minSize={15} className="bg-[#0d0d0d] border-r border-white/5">
                      <FileTree files={files} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
                    </ResizablePanel>
                    
                    <ResizableHandle className="bg-white/5" />
                    
                    {/* Editor */}
                    <ResizablePanel defaultSize={80}>
                      <div className="flex h-full flex-col">
                        <div className="flex h-10 items-center border-b border-white/5 bg-[#0d0d0d] px-2">
                          {selectedFile && (
                            <div className="flex items-center gap-2 rounded-t-lg bg-[#1a1a1a] px-4 py-2 text-xs text-white border-t border-x border-white/5">
                              <FileText className="h-3 w-3 text-blue-400" />
                              {selectedFile.split('/').pop()}
                              <X className="h-2 w-2 ml-2 opacity-30 hover:opacity-100 cursor-pointer" />
                            </div>
                          )}
                          <div className="flex-1" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100">
                             <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex-1 bg-[#050505] p-0 font-mono text-sm overflow-hidden">
                           {selectedFile && files[selectedFile] ? (
                             <div className="relative h-full">
                               <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d0d0d] border-r border-white/5 flex flex-col items-end px-3 py-4 text-white/20 select-none">
                                 {files[selectedFile].split('\n').map((_, i) => (
                                   <div key={i}>{i + 1}</div>
                                 ))}
                               </div>
                               <textarea
                                 value={files[selectedFile]}
                                 readOnly
                                 className="h-full w-full bg-transparent p-4 pl-16 text-white/80 outline-none resize-none selection:bg-primary/40 selection:text-white"
                                 spellCheck={false}
                               />
                             </div>
                           ) : (
                             <div className="flex h-full items-center justify-center text-muted-foreground text-xs italic">
                               Select a file to view code
                             </div>
                           )}
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
}
