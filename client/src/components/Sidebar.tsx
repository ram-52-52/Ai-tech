import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Sparkles, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/blogs", icon: FileText, label: "All Blogs" },
    { href: "/generate", icon: Sparkles, label: "Generate New" },
    { href: "/trends", icon: TrendingUp, label: "Trends" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card h-screen fixed left-0 top-0 hidden md:flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-foreground">
            AutoBlog<span className="text-primary">.ai</span>
          </h1>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
            <span className="text-xs font-bold text-muted-foreground">JD</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
