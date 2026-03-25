import { Link, useLocation } from "wouter";
import { Menu, Sparkles, LayoutDashboard, FileText, TrendingUp, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function MobileHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const links = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/blogs", icon: FileText, label: "All Blogs" },
    { href: "/generate", icon: Sparkles, label: "Generate New" },
    { href: "/trends", icon: TrendingUp, label: "Trends" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-lg flex items-center justify-between px-4 z-40 md:hidden">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="font-display font-bold text-lg tracking-tight text-foreground">
          AutoBlog<span className="text-primary">.ai</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-border/50 bg-background/95 backdrop-blur-xl">
            <SheetHeader className="p-6 border-b border-border/50 text-left">
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-foreground">
                  AutoBlog<span className="text-primary">.ai</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            
            <nav className="p-4 space-y-1">
              {links.map((link) => {
                const isActive = location === link.href;
                const Icon = link.icon;
                
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-semibold text-sm relative overflow-hidden",
                      isActive 
                        ? "text-white shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
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

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 space-y-4 bg-background">
               <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </Button>
               <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">Dashboard</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
