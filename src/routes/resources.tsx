import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Sparkles, 
  Wand2, 
  Rocket, 
  Zap, 
  Layout, 
  Globe, 
  MousePointer2, 
  Code2, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Cpu,
  Palette
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Best Website Builders 2026 · PagePilot AI" },
      {
        name: "description",
        content: "Explore the best AI website builders curated by PagePilot AI.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const categories = [
    { id: "ai", name: "AI-Based Builders", icon: Sparkles },
    { id: "nocode", name: "No-Code Builders", icon: MousePointer2 },
    { id: "marketing", name: "Pro Marketing Tools", icon: BarChart3 },
    { id: "advanced", name: "Advanced / Developer", icon: Code2 },
  ];

  const tools = [
    {
      category: "ai",
      name: "AI Website Builder",
      description: "Write a prompt and get a full website ready with HTML export.",
      features: ["Prompt to Page", "HTML Export", "Instant Styling"],
      link: "https://landing-page.io",
      badge: "Lovable Style",
      color: "from-blue-500 to-indigo-600"
    },
    {
      category: "ai",
      name: "HubSpot Campaign Assistant",
      description: "Free AI tool that generates copy and web pages for your campaigns.",
      features: ["Free AI", "Copywriting", "HubSpot Integrated"],
      link: "https://www.hubspot.com/campaign-assistant",
      color: "from-orange-500 to-red-600"
    },
    {
      category: "ai",
      name: "Leadpages AI Builder",
      description: "Generate conversion-focused pages in 60 seconds with built-in A/B testing.",
      features: ["60s Generation", "A/B Testing", "High Conversion"],
      link: "https://www.leadpages.com",
      color: "from-purple-500 to-pink-600"
    },
    {
      category: "ai",
      name: "B12 AI Website Builder",
      description: "Full website builder with integrated business tools like email and payments.",
      features: ["Full Website", "Payments", "Email Tools"],
      link: "https://www.b12.io",
      color: "from-cyan-500 to-blue-600"
    },
    {
      category: "nocode",
      name: "Wix AI Website Builder",
      description: "Chat with the AI to get a full website ready. Best for beginners.",
      features: ["AI Chat Setup", "Full Customization", "Great for Beginners"],
      link: "https://www.wix.com",
      badge: "Easy",
      color: "from-gray-700 to-gray-900"
    },
    {
      category: "nocode",
      name: "Hostinger Website Builder",
      description: "Affordable and powerful AI-based builder easy for anyone to use.",
      features: ["Budget Friendly", "AI Designer", "Easy to Launch"],
      link: "https://www.hostinger.com/website-builder",
      color: "from-indigo-400 to-blue-500"
    },
    {
      category: "nocode",
      name: "Squarespace",
      description: "The gold standard for design templates with a premium, polished feel.",
      features: ["Premium Templates", "Designer Aesthetics", "Built-in E-commerce"],
      link: "https://www.squarespace.com",
      color: "from-black to-zinc-700"
    },
    {
      category: "nocode",
      name: "Weebly",
      description: "Simple drag-and-drop builder with a generous free plan available.",
      features: ["Free Plan", "Simple UI", "Basic Store Features"],
      link: "https://www.weebly.com",
      color: "from-blue-400 to-blue-600"
    },
    {
      category: "marketing",
      name: "Unbounce",
      description: "High-converting pages optimized specifically for marketing and ads.",
      features: ["Conversion Focus", "Smart Traffic", "Ad Integration"],
      link: "https://unbounce.com",
      color: "from-blue-600 to-indigo-700"
    },
    {
      category: "marketing",
      name: "Instapage",
      description: "Fast, premium pages with advanced personalization features.",
      features: ["Personalization", "Speed Boost", "Team Collaboration"],
      link: "https://instapage.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      category: "marketing",
      name: "Landingi",
      description: "Beginner-friendly builder with a strong set of conversion tools.",
      features: ["Beginner Friendly", "Marketing Automation", "Drag & Drop"],
      link: "https://landingi.com",
      color: "from-emerald-500 to-teal-600"
    },
    {
      category: "marketing",
      name: "GetResponse",
      description: "Powerful combo of page builder and email marketing automation.",
      features: ["Email Marketing", "Marketing Funnels", "Integrated Ads"],
      link: "https://www.getresponse.com",
      color: "from-blue-500 to-blue-700"
    },
    {
      category: "advanced",
      name: "Framer AI",
      description: "Modern SaaS websites with React-style design and animations.",
      features: ["React Design", "Stunning Animations", "High Performance"],
      link: "https://www.framer.com/ai",
      badge: "Modern",
      color: "from-sky-500 to-indigo-500"
    },
    {
      category: "advanced",
      name: "Embeddable AI",
      description: "Generate full websites and interactive widgets using advanced AI.",
      features: ["Interactive Widgets", "API Driven", "Dynamic Content"],
      link: "https://embeddable.ai",
      color: "from-emerald-400 to-green-600"
    },
    {
      category: "advanced",
      name: "Elementor (WordPress)",
      description: "The most powerful drag-and-drop builder for WordPress with deep customization.",
      features: ["WordPress Native", "Pixel Perfect", "Huge Ecosystem"],
      link: "https://elementor.com",
      color: "from-pink-600 to-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="relative pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-card/30 px-6 py-24 text-center">
          <div className="absolute inset-0 bg-hero-glow opacity-30" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Layers className="h-3.5 w-3.5" />
              Resource Directory
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Best AI <span className="text-gradient-brand">Website Builders</span> 2026
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the most powerful tools to launch your online presence. From prompt-based generators to professional marketing platforms.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pt-16">
          {/* Categories Navigation */}
          <div className="sticky top-20 z-30 mb-12 flex justify-center py-4">
             <div className="inline-flex gap-2 rounded-2xl border border-border bg-background/80 p-2 backdrop-blur-xl shadow-xl">
               {categories.map((c) => (
                 <a
                   key={c.id}
                   href={`#${c.id}`}
                   className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-accent"
                 >
                   <c.icon className="h-4 w-4" />
                   {c.name}
                 </a>
               ))}
             </div>
          </div>

          {/* Tools Grid */}
          <div className="space-y-24">
            {categories.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-36">
                <div className="mb-10 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{cat.name}</h2>
                    <p className="text-muted-foreground">Top choices for {cat.name.toLowerCase()}</p>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {tools
                    .filter((t) => t.category === cat.id)
                    .map((tool) => (
                      <a
                        key={tool.name}
                        href={tool.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative flex flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
                      >
                        <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                           {cat.id === 'ai' ? <Sparkles className="h-8 w-8" /> : 
                            cat.id === 'nocode' ? <MousePointer2 className="h-8 w-8" /> :
                            cat.id === 'marketing' ? <BarChart3 className="h-8 w-8" /> :
                            <Code2 className="h-8 w-8" />}
                        </div>
                        
                        {tool.badge && (
                          <span className="absolute right-6 top-6 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/20">
                            {tool.badge}
                          </span>
                        )}

                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{tool.name}</h3>
                        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>

                        <div className="mt-auto space-y-3">
                          {tool.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              {f}
                            </div>
                          ))}
                          <div className="pt-4 flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Visit Website <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </section>
            ))}
          </div>

          {/* Expert Advice Section */}
          <section className="mt-32 rounded-[3rem] bg-gradient-brand p-1 text-brand-foreground shadow-2xl">
            <div className="rounded-[2.8rem] bg-slate-900/90 p-12 backdrop-blur-3xl">
              <div className="mb-12 text-center">
                 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <Zap className="h-6 w-6 text-primary" />
                 </div>
                 <h2 className="text-4xl font-bold mb-4">Expert Advice</h2>
                 <p className="text-slate-400 max-w-2xl mx-auto">Still not sure which one to pick? Here's our simple breakdown for different needs.</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                   <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Wand2 className="h-5 w-5 text-primary" />
                     Lovable Experience
                   </h4>
                   <p className="text-sm text-slate-300 mb-6">If you want that "AI Magic" where you just describe and it builds:</p>
                   <ul className="space-y-4">
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Best Choice</span>
                        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">Website Builder</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Premium Feel</span>
                        <span className="text-xs bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full border border-sky-500/30">Framer AI</span>
                      </li>
                   </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                   <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Globe className="h-5 w-5 text-emerald-400" />
                     Zero Cost Entry
                   </h4>
                   <p className="text-sm text-slate-300 mb-6">Best platforms to start for free and test your ideas with no risk:</p>
                   <ul className="space-y-4">
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Free AI Tool</span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">HubSpot</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Easy Startup</span>
                        <span className="text-xs bg-slate-500/20 text-slate-300 px-3 py-1 rounded-full border border-slate-500/30">Wix</span>
                      </li>
                   </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10">
                   <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Palette className="h-5 w-5 text-purple-400" />
                     Client Work
                   </h4>
                   <p className="text-sm text-slate-300 mb-6">Built for professional marketers who need scaling and client tools:</p>
                   <ul className="space-y-4">
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Pro Marketing</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">Leadpages</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Conversion King</span>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">Unbounce</span>
                      </li>
                   </ul>
                </div>
              </div>

              <div className="mt-16 text-center">
                 <Link to="/build">
                   <Button size="lg" className="rounded-2xl bg-gradient-brand text-brand-foreground px-12 py-7 text-lg font-bold shadow-2xl transition-transform hover:scale-105">
                     Build your page now
                     <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                 </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
