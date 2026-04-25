import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Rocket,
  Zap,
  Globe,
  Smartphone,
  Gauge,
  ChevronDown,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LandingForge — Build Stunning AI Landing Pages Instantly" },
      {
        name: "description",
        content:
          "Describe your idea in one sentence. LandingForge's AI generates a complete, beautiful landing page in seconds — and you keep editing it just by chatting.",
      },
      { property: "og:title", content: "LandingForge — AI Landing Page Builder" },
      {
        property: "og:description",
        content:
          "Type an idea, get a stunning landing page in seconds. Share via link, edit by chatting.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Steps />
        <Features />
        <Templates />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = prompt.trim();
    navigate({ to: "/build", search: p ? { prompt: p } : {} });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by AI · No code required
        </div>

        <h1 className="max-w-4xl text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Build stunning{" "}
          <span className="text-gradient-brand">AI landing pages</span> instantly
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Describe your idea in one sentence. Our AI writes the copy, designs
          the layout, and ships a live page you can share — in under 30 seconds.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/10"
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A landing page for a meditation app for busy parents…"
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02]"
            >
              Generate page
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Try:</span>
          {[
            "Coffee subscription for remote workers",
            "AI-powered resume reviewer",
            "Boutique yoga studio in Lisbon",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-full border border-border bg-background/70 px-3 py-1 transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    {
      icon: Wand2,
      title: "Describe your idea",
      body: "Tell the AI about your product, audience, and vibe. One sentence is enough.",
    },
    {
      icon: Sparkles,
      title: "AI builds the page",
      body: "Headlines, sections, layout and visuals — generated in seconds, ready to ship.",
    },
    {
      icon: Rocket,
      title: "Share or keep editing",
      body: "Get a unique link instantly. Refine anything just by chatting with the AI.",
    },
  ];
  return (
    <section id="how" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            From idea to live page in 3 steps
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="absolute -top-4 left-7 inline-flex h-8 items-center justify-center rounded-full bg-gradient-brand px-3 text-xs font-bold text-brand-foreground shadow">
                Step {i + 1}
              </div>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Zap,
      tag: "Most popular",
      title: "Lightning-fast page builder",
      body: "Skip wireframes and CSS battles. Describe what you want, the AI handles structure, copy and responsive design automatically.",
      stat: "Live in under 30 seconds",
    },
    {
      icon: Gauge,
      tag: "Editor's choice",
      title: "Conversion-tuned by default",
      body: "Every page follows proven patterns: clear hero, benefits, social proof, sharp CTA. The AI optimizes for engagement out of the box.",
      stat: "Up to 3× higher engagement",
    },
    {
      icon: Globe,
      tag: "New",
      title: "Free to start, share by link",
      body: "Generate as many drafts as you want. Each page gets its own unique URL — no signup, no friction.",
      stat: "$0 to get started",
    },
    {
      icon: Smartphone,
      tag: "Pro",
      title: "SEO & mobile ready",
      body: "Semantic HTML, meta tags, and responsive layouts baked in. Your page looks sharp on any device, indexable by search engines from day one.",
      stat: "Perfect Lighthouse scores",
    },
  ];
  return (
    <section id="features" className="border-t border-border/60 bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for conversion
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Powerful by design, simple by default
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-brand-foreground shadow shadow-primary/30">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
              <p className="mt-5 text-sm font-semibold text-gradient-brand">
                {f.stat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Templates() {
  const templates = [
    {
      title: "SaaS Product Launch",
      body: "Crisp benefits, screenshots, and clear CTAs.",
      tone: "from-violet-500/30 to-fuchsia-500/30",
    },
    {
      title: "Mobile App Preorder",
      body: "Tease features, collect emails, drive installs.",
      tone: "from-sky-500/30 to-indigo-500/30",
    },
    {
      title: "E-commerce Drop",
      body: "Spotlight a limited drop with countdown and checkout.",
      tone: "from-rose-500/30 to-orange-500/30",
    },
    {
      title: "Webinar Registration",
      body: "Agenda, speakers, schedule and reminders that convert.",
      tone: "from-emerald-500/30 to-teal-500/30",
    },
    {
      title: "Online Course Launch",
      body: "Sell instructor-led or self-paced with outcomes.",
      tone: "from-amber-500/30 to-pink-500/30",
    },
    {
      title: "Real Estate Listing",
      body: "Highlights, neighborhood, and tour-request CTA.",
      tone: "from-cyan-500/30 to-blue-500/30",
    },
  ];
  return (
    <section id="templates" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Template library
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            See what it can create
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every template starts as a prompt. Tweak the brief, get a new page.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.title}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div
                className={`relative h-40 bg-gradient-to-br ${t.tone}`}
                aria-hidden
              >
                <div className="absolute inset-4 rounded-xl bg-card/70 p-4 backdrop-blur-sm">
                  <div className="h-2 w-16 rounded-full bg-gradient-brand" />
                  <div className="mt-2 h-2 w-24 rounded-full bg-foreground/20" />
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <div className="h-8 rounded bg-foreground/10" />
                    <div className="h-8 rounded bg-foreground/10" />
                    <div className="h-8 rounded bg-foreground/10" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What is an AI landing page builder?",
      a: "It's a tool that turns a simple text prompt into a complete, conversion-ready landing page — copy, layout, visuals and all — without any coding.",
    },
    {
      q: "Do I need design or coding skills?",
      a: "No. If you can describe your business in one sentence, you can ship a page. Refine anything later by chatting with the AI.",
    },
    {
      q: "Can I share the page with someone?",
      a: "Yes. Every generated page gets its own unique URL you can send to clients, post on social media, or use in ads.",
    },
    {
      q: "How do I edit a page after it's generated?",
      a: "Open the chat for that page and type what you'd like to change — 'make the hero darker', 'add a pricing section', 'rewrite the CTA'. The AI updates the page instantly.",
    },
    {
      q: "Is it really free?",
      a: "Yes, you can generate landing pages for free to start. No credit card required.",
    },
  ];
  return (
    <section id="faq" className="border-t border-border/60 bg-secondary/30 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-base font-semibold">{f.q}</span>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-12 text-center text-brand-foreground shadow-2xl shadow-primary/30">
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"
            aria-hidden
          />
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Your next landing page is one prompt away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base opacity-90">
            Describe it. Generate it. Share it. All in less time than it takes
            to brew a coffee.
          </p>
          <a
            href="/build"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-7 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-[1.03]"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Build your free landing page
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
