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
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PagePilot AI — Build Beautiful Websites in Seconds with AI" },
      {
        name: "description",
        content:
          "Create, customize, and launch beautiful multi-page websites — no coding needed. PagePilot AI generates complete sites instantly.",
      },
      { property: "og:title", content: "PagePilot AI — AI Website Builder" },
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
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Steps />
        <Templates />
        <ConversionFeatures />
        <Pricing />
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
          Build <span className="text-gradient-brand">Beautiful</span> Websites in Seconds with AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Create, customize, and launch beautiful multi-page websites — no coding needed.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/10"
        >
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A website for a meditation app for busy parents…"
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02]"
            >
              Generate website
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
      title: "AI builds the website",
      body: "Navigation, pages, sections, layout and visuals — generated in seconds, ready to ship.",
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
            From idea to live website in 3 steps
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

function Templates() {
  const navigate = useNavigate();
  const templates = [
    {
      title: "SaaS Product Launch",
      body: "Announce your new SaaS with crisp benefits, screenshots, and clear CTAs.",
      image:
        "https://images.unsplash.com/photo-1556155092-8707de31f9c4?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a SaaS product launch. Include Home, Features, Pricing, FAQ, and Contact. Modern, clean, and conversion-focused.",
    },
    {
      title: "Mobile App Preorder",
      body: "Tease features, collect emails, and drive early installs with urgency.",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a mobile app launch. Include Home, Features, Roadmap, Testimonials, and Contact. Energetic and modern.",
    },
    {
      title: "E-commerce Drop",
      body: "Spotlight a limited-run product drop with countdown and fast checkout.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a limited-run e-commerce drop. Include Home, Products, About, Shipping & Returns, and Contact. Bold and premium.",
    },
    {
      title: "Fintech Demo Booking",
      body: "Explain compliance-aware value props and convert traffic into demo calls.",
      image:
        "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a fintech product. Include Home, Security, Use Cases, Pricing, and Book a Demo. Trustworthy and crisp.",
    },
    {
      title: "Healthcare Clinic Lead Gen",
      body: "Educate patients and capture inquiries with HIPAA-friendly structure.",
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a healthcare clinic. Include Home, Services, Doctors, Insurance, and Contact. Calm, accessible, and reassuring.",
    },
    {
      title: "Online Course Launch",
      body: "Sell an instructor-led or self-paced course with outcomes and modules.",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for an online course. Include Home, Curriculum, Instructor, Pricing, and FAQ. Clear, structured, and motivating.",
    },
    {
      title: "Webinar Registration",
      body: "Convert visitors with agenda, speakers, schedule, and reminders.",
      image:
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a webinar. Include Home, Agenda, Speakers, Register, and FAQ. Simple, focused, and modern.",
    },
    {
      title: "Real Estate Property Lead Gen",
      body: "Showcase listings with highlights, neighborhood, and tour request CTA.",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      prompt:
        "A multi-page website for a real estate listing. Include Home, Gallery, Neighborhood, Amenities, and Book a Tour. Luxury editorial style.",
    },
  ];

  return (
    <section id="templates" className="border-t border-border/60 py-24 bg-secondary/10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Template Library
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            See what it can create
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore our curated selection of high-converting templates.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => navigate({ to: "/build", search: { prompt: t.prompt } })}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="aspect-video w-full bg-muted overflow-hidden">
                <img
                  src={t.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{t.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.body}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/build" })}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Generate a website <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ConversionFeatures() {
  const features = [
    {
      tag: "Most Popular",
      icon: Rocket,
      title: "Lightning-Fast Website Builder",
      body: "With our AI website builder, you can create a professional multi-page website in just a few clicks. The system handles navigation, structure, layout, and responsive design automatically, so you never waste time on coding or complex setup. Whether you’re testing a marketing idea or launching a new product, you can go live in minutes instead of weeks.",
      cta: "Start Building Now",
      stat: "Launch in under 5 minutes",
      detail: "Fast, responsive layouts in minutes.",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
    },
    {
      tag: "Editor's Choice",
      icon: Gauge,
      title: "AI-Powered Conversion Engine",
      body: "Our AI website generator doesn’t just design pages—it optimizes them for performance. From crafting clear positioning to selecting persuasive call-to-action buttons, the AI uses proven conversion principles to maximize engagement. This ensures every page in your site is designed to capture leads and drive sales effortlessly.",
      cta: "Boost Conversions",
      stat: "3x higher engagement rates",
      detail: "Persuasion-first sections and CTAs.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    },
    {
      tag: "New Feature",
      icon: Globe,
      title: "Free AI Website Builder",
      body: "Building your online presence shouldn’t be costly. With our free AI website builder, you can design, customize, and publish complete websites without paying upfront fees. Experiment with different ideas, test audiences, and grow your business risk-free. When you’re ready to scale, the platform grows with you.",
      cta: "Try for Free",
      stat: "$0 to get started",
      detail: "Start free with 3 tokens.",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    },
    {
      tag: "Pro Feature",
      icon: Smartphone,
      title: "Complete AI Website Builder",
      body: "Go beyond simple pages with a full ai website builder that allows you to create entire websites, including product showcases, blogs, and multi-page funnels. Every page is fully optimized for SEO, mobile devices, and speed, ensuring your business stays competitive online. Perfect for startups, agencies, or entrepreneurs who want scalability from day one.",
      cta: "Build Full Sites",
      stat: "SEO and mobile ready",
      detail: "Multi-page foundations with SEO basics.",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    },
    {
      tag: "Creative Tool",
      icon: Wand2,
      title: "Fake Website Maker",
      body: "Create realistic fake websites and mockups in minutes. Perfect for presentations, client demos, portfolio showcases, or testing design concepts. Generate professional-looking dummy sites with authentic content, images, and layouts that look indistinguishable from real websites.",
      cta: "Create Fake Website!",
      stat: "100% Realistic",
      detail: "Mockups for demos and pitches.",
      image:
        "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
    }
  ];

  return (
    <section id="features" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for Conversion, Powered by AI
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Smarter AI Landing Page Builder
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our AI website builder gives you layouts and copy optimized for engagement, saving you hours of manual work.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center mb-24">
          <div className="space-y-6">
             <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="text-xl font-bold mb-2">Websites in Minutes</h3>
                <p className="text-muted-foreground text-sm">Generate a complete multi-page website from a simple idea—fast, professional, and ready to use.</p>
             </div>
             <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
                <h3 className="text-xl font-bold mb-2">Powerful AI Landing Page Generator</h3>
                <p className="text-muted-foreground text-sm">Use the AI website generator to create pages with strong headlines, visuals, and CTAs that drive higher conversions.</p>
             </div>
             <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                <h3 className="text-xl font-bold mb-2">Free AI Website Builder Access</h3>
                <p className="text-muted-foreground text-sm">Get started with our free AI website builder, perfect for testing ideas or launching your first campaign without upfront costs.</p>
             </div>
          </div>
          <div className="relative">
             <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="rounded-3xl shadow-2xl border border-border"
            />
          </div>
        </div>

        <div className="space-y-24">
          {features.map((f, i) => (
            <div key={f.title} className={`flex flex-col gap-12 lg:flex-row items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
                  {f.tag}
                </div>
                <h3 className="text-3xl font-bold tracking-tight">{f.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                   <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-md transition-transform hover:scale-105">
                     {f.cta}
                   </button>
                   <div className="space-y-1">
                      <p className="text-sm font-bold">{f.stat}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                   </div>
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl aspect-square bg-muted rounded-3xl flex items-center justify-center border border-border overflow-hidden">
                <img src={f.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
           <div className="text-center p-8 rounded-2xl border border-border bg-card">
              <h4 className="text-xl font-bold mb-3">Complete AI Website Builder Solution</h4>
              <p className="text-sm text-muted-foreground">Build full websites, including blogs, product pages, and multi-page sites—without writing code.</p>
           </div>
           <div className="text-center p-8 rounded-2xl border border-border bg-card">
              <h4 className="text-xl font-bold mb-3">Conversion-Optimized by Default</h4>
              <p className="text-sm text-muted-foreground">Every page is SEO-friendly, mobile-ready, and tested for performance, so your visitors turn into customers effortlessly.</p>
           </div>
           <div className="text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
              <h4 className="text-xl font-bold mb-3 text-primary">Smarter AI Builder</h4>
              <p className="text-sm text-muted-foreground">The most powerful AI generator for modern marketing teams and entrepreneurs.</p>
           </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      description: "Try it without signing up",
      price: "₹0",
      credits: "3 Tokens",
      features: ["3 tokens total", "Create 1 site + a few edits", "Shareable preview links", "Projects sidebar"],
    },
    {
      name: "Pro",
      description: "For clients and daily work",
      price: "₹999/mo",
      credits: "20 Tokens / month",
      featured: true,
      features: ["20 tokens/month", "Faster generation", "Priority updates", "Everything in Free"],
    },
  ];

  return (
    <section id="pricing" className="border-t border-border/60 py-24 bg-secondary/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Start free, upgrade when ready
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with 3 tokens. Upgrade to Pro for 20 tokens every month.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border p-8 shadow-sm transition-all hover:shadow-xl ${
                p.featured
                  ? "border-primary bg-background ring-1 ring-primary shadow-primary/10 scale-105 z-10"
                  : "border-border bg-card"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase text-primary-foreground shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-primary">{p.credits}</p>
              </div>
              <ul className="mb-8 space-y-4 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={p.featured ? "/pro" : "/build"}
                className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all ${
                  p.featured
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02]"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p.featured ? "Upgrade to Pro" : "Start Free"}
              </a>
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
      q: "How do tokens work?",
      a: "Each time you generate or update a website it uses 1 token. Free users get 3 tokens total. Pro users get 20 tokens every month.",
    },
    {
      q: "Do I need to sign up?",
      a: "No. You can generate as a guest and still get shareable preview links. You can upgrade to Pro anytime.",
    },
    {
      q: "Can I share my generated site?",
      a: "Yes. Every generated website gets a shareable link you can send to anyone to view in the browser.",
    },
    {
      q: "Can I upgrade anytime?",
      a: "Yes. Upgrade to Pro to unlock 20 tokens/month.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support all major credit cards, PayPal, and various global payment providers through our secure checkout.",
    },
  ];
  return (
    <section id="faq" className="border-t border-border/60 bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have other questions? Feel free to contact our support team.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm open:shadow-md transition-all"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-lg font-semibold">{f.q}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border group-open:rotate-180 transition-transform">
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </summary>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
    <section className="py-24 bg-gradient-brand text-brand-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold backdrop-blur-md">
           <Sparkles className="h-4 w-4" /> Start your creative journey today
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Ready to build a stunning website?
        </h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Create professional websites with our AI tools. Start free, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/build"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-xl transition-transform hover:scale-105"
          >
            Start for Free <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#templates"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-8 py-4 text-base font-bold text-white border border-white/20 backdrop-blur-md transition-all hover:bg-white/20"
          >
            View Templates
          </a>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm opacity-80">
           <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400" /> Live in 5 minutes</span>
           <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400" /> No credit card required</span>
           <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400" /> Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
