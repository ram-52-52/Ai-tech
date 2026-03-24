import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Sparkles, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <aside className="w-[260px] border border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-3xl h-[calc(100vh-2rem)] fixed left-4 top-4 rounded-[2rem] shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden hidden md:flex flex-col z-50 transition-all duration-500">
      <div className="p-6 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
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
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-semibold text-sm relative overflow-hidden",
                  isActive 
                    ? "text-white shadow-lg shadow-primary/20 dark:shadow-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 opacity-90 -z-10" />
                )}
                <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-primary")} />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
              <span className="text-xs font-bold text-muted-foreground">JD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
