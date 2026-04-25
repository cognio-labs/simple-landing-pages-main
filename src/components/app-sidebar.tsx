import { 
  Home, 
  Search, 
  Layers, 
  Link2, 
  Folder, 
  Star, 
  User, 
  Share2, 
  Settings,
  Plus,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const location = useLocation();
  
  const mainItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "#", kbd: "Ctrl K" },
    { icon: Layers, label: "Resources", href: "/resources" },
    { icon: Link2, label: "Connectors", href: "#" },
  ];

  const projectItems = [
    { icon: Folder, label: "All projects", href: "/build" },
    { icon: Star, label: "Starred", href: "#" },
    { icon: User, label: "Created by me", href: "#" },
    { icon: Share2, label: "Shared with me", href: "#" },
  ];

  return (
    <aside className="hidden flex-col border-r border-border bg-card/30 w-64 lg:flex">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          {mainItems.map((item) => (
            <Link
              key={item.label}
              to={item.href as any}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                location.pathname === item.href 
                  ? "bg-accent text-foreground font-medium" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {item.kbd && (
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-sans text-muted-foreground">
                  {item.kbd}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <div className="px-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Projects
            </h3>
          </div>
          <div className="space-y-1">
            {projectItems.map((item) => (
              <Link
                key={item.label}
                to={item.href as any}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  location.pathname === item.href && item.href !== "#"
                    ? "bg-accent text-foreground font-medium" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                 <ChevronDown className="h-3 w-3" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-border">
         <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-lg transition-colors">
            <Settings className="h-4 w-4" />
            Settings
         </button>
      </div>
    </aside>
  );
}
