import { History, RotateCcw } from "lucide-react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  html?: string;
  ts?: string;
};

export type Version = {
  index: number; // index in messages array of the assistant snapshot
  label: string; // the user prompt that produced it
  ts?: string;
  html: string;
};

export function buildVersions(messages: ChatMessage[]): Version[] {
  const versions: Version[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "assistant" && m.html) {
      // The user message just before this assistant snapshot is the prompt
      let label = "Initial generation";
      for (let j = i - 1; j >= 0; j--) {
        if (messages[j].role === "user") {
          label = messages[j].content;
          break;
        }
      }
      versions.push({ index: i, label, ts: m.ts, html: m.html });
    }
  }
  return versions;
}

function formatTime(ts?: string) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  versions: Version[];
  activeIndex: number | null;
  onRevert: (v: Version) => void;
  open: boolean;
};

export function VersionsSidebar({ versions, activeIndex, onRevert, open }: Props) {
  if (!open) return null;
  return (
    <aside
      aria-label="Version history"
      className="flex w-72 shrink-0 flex-col border-r border-border bg-background/80 backdrop-blur-md lg:w-64 lg:bg-card/30 lg:backdrop-blur-none"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        <History className="h-3.5 w-3.5" />
        Version History
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
        {versions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/50 text-muted-foreground/50">
               <History className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground">
              No versions yet. Start chatting to create your first website!
            </p>
          </div>
        ) : (
          <ol className="space-y-2">
            {[...versions].reverse().map((v, i) => {
              const actualIndex = versions.length - 1 - i;
              const isActive = v.index === activeIndex;
              const isLatest = actualIndex === versions.length - 1;
              return (
                <li key={v.index}>
                  <button
                    type="button"
                    onClick={() => onRevert(v)}
                    aria-current={isActive ? "true" : undefined}
                    className={`group flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card/50 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-muted-foreground/70">
                        v{actualIndex + 1}
                        {isLatest && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" title="Latest version" />
                        )}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground/60">
                        {formatTime(v.ts)}
                      </span>
                    </div>
                    <p className={`line-clamp-2 text-xs leading-relaxed transition-colors ${
                      isActive ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                      {v.label}
                    </p>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        Current version
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <RotateCcw className="h-2.5 w-2.5" />
                        Restore this version
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
