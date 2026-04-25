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
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-background/60 lg:flex"
    >
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        Versions
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {versions.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Your generated versions will appear here.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {versions.map((v, i) => {
              const isActive = v.index === activeIndex;
              const isLatest = i === versions.length - 1;
              return (
                <li key={v.index}>
                  <button
                    type="button"
                    onClick={() => onRevert(v)}
                    aria-current={isActive ? "true" : undefined}
                    className={`group flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">
                        v{i + 1}
                        {isLatest && " · latest"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(v.ts)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-foreground">
                      {v.label}
                    </p>
                    {!isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <RotateCcw className="h-2.5 w-2.5" />
                        Click to revert
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