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
  Check,
  Code2,
  Layout,
  Cpu,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aryan AI Studio — AI-Powered Website Builder" },
      {
        name: "description",
        content:
          "The most powerful AI website builder for creators and entrepreneurs. Generate professional websites from a single prompt.",
      },
      { property: "og:title", content: "Aryan AI Studio" },
      {
        property: "og:description",
        content:
          "Build beautiful multi-page websites in seconds with AI. Create, customize, and launch complete sites instantly.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <LivePreview />
        <Pricing />
        <FAQ />
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
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute -top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />
      
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="h-3.5 w-3.5" />
          The Future of Web Design is Here
        </div>

        <h1 className="max-w-4xl text-balance font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Turn your <span className="text-primary italic">vision</span> into a <span className="text-white">live website</span> in seconds
        </h1>

        <p className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Aryan AI Studio generates professional, high-converting websites from a simple prompt. No code. No stress. Just magic.
        </p>

        <form
          onSubmit={submit}
          className="mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <div className="flex-1 flex items-center px-4">
              <Wand2 className="h-5 w-5 text-muted-foreground mr-3" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your website idea..."
                className="flex-1 bg-transparent py-4 text-base md:text-lg outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all hover:scale-[1.03] active:scale-95"
            >
              Build with AI
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground/60 animate-in fade-in duration-700 delay-500">
          <span>Try:</span>
          {[
            "Dark luxury portfolio for a designer",
            "Modern SaaS landing page",
            "Minimalist blog for a travel writer",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-full border border-white/5 bg-white/5 px-4 py-1.5 transition-all hover:border-primary/50 hover:text-white hover:bg-primary/5"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Cpu,
      title: "Advanced AI Engine",
      body: "Powered by the latest LLMs, generating not just code, but structure and strategy.",
    },
    {
      icon: Code2,
      title: "Clean React Code",
      body: "Every site is built with React and Tailwind CSS. Modern, fast, and scalable.",
    },
    {
      icon: Layout,
      title: "Designer Quality",
      body: "Professional layouts with perfect spacing, typography, and interactive elements.",
    },
    {
      icon: Zap,
      title: "Instant Live Preview",
      body: "See your changes in real-time as you chat with the assistant to refine details.",
    },
  ];

  return (
    <section className="py-24 border-y border-white/5 bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] transition-all hover:border-primary/30 hover:bg-primary/[0.03]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />
       <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
             <div className="flex-1">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                  From <span className="text-primary italic">Thought</span> to <span className="text-white underline decoration-primary decoration-4 underline-offset-8">Published</span> in 5 Minutes.
                </h2>
                <div className="space-y-8">
                   {[
                     { step: "01", title: "Describe Your Vision", text: "Tell the AI what you want to build. One sentence or a detailed brief." },
                     { step: "02", title: "Watch It Build", text: "Our AI constructs the entire site—pages, copy, images, and layout." },
                     { step: "03", title: "Refine by Chatting", text: "Ask for changes like 'make it darker' or 'add a testimonial section'." },
                     { step: "04", title: "Go Live", text: "Publish to your own subdomain instantly with one click." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6">
                        <span className="text-2xl font-black text-white/10">{item.step}</span>
                        <div>
                           <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                           <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 w-full">
                <div className="relative rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 shadow-2xl overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" 
                    alt="Builder UI" 
                    className="rounded-2xl border border-white/5 shadow-inner"
                   />
                   <div className="absolute bottom-10 left-10 right-10 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Assistant</span>
                      </div>
                      <p className="text-sm italic">"I've updated the hero section with a glassmorphism effect as requested."</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function LivePreview() {
  return (
    <section className="py-24 bg-primary/5 border-y border-white/5">
       <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 italic">Ready to see it in action?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">Join thousands of creators who use Aryan AI Studio to launch their ideas faster than ever.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">Start Building Now</button>
             <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">View Showcase</button>
          </div>
       </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      features: ["3 Design Tokens", "Multi-page Generation", "Live Share Links", "Projects Dashboard"],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      features: ["20 Design Tokens /mo", "Custom Subdomains", "Export Code", "Priority AI Engine", "Remove Branding"],
      cta: "Upgrade to Pro",
      featured: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full opacity-30 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, powerful pricing.</h2>
          <p className="text-muted-foreground">No hidden fees. Just creation.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <div key={i} className={cn(
              "p-10 rounded-[40px] border transition-all duration-500",
              p.featured 
                ? "bg-white/[0.04] border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)] scale-105 relative" 
                : "bg-white/[0.02] border-white/5 hover:border-white/20"
            )}>
              {p.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-[10px] font-black uppercase text-primary-foreground">
                  Recommended
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black">{p.price}</span>
                {p.period && <span className="text-muted-foreground">{p.period}</span>}
              </div>
              <ul className="space-y-4 mb-10 text-sm">
                {p.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={cn(
                "w-full h-14 rounded-2xl font-bold transition-all",
                p.featured 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="py-24 border-t border-white/5">
       <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">FAQ</h2>
          <div className="space-y-4 text-left">
             {[
               { q: "How many websites can I build?", a: "With Free, you get 3 design tokens. Each generation or major update uses 1 token. Pro gives you 20 tokens every month." },
               { q: "Can I use my own domain?", a: "Yes, Pro users can set up custom subdomains like yourname.aryanai.studio instantly." },
               { q: "Can I export the code?", a: "Yes, Pro users can export the full React + Tailwind code to host it anywhere." }
             ].map((item, i) => (
               <details key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] group">
                  <summary className="font-bold flex justify-between items-center cursor-pointer list-none">
                     {item.q}
                     <ChevronDown className="h-5 w-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
               </details>
             ))}
          </div>
       </div>
    </section>
  );
}
