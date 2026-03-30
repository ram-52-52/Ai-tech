import { Link, useLocation } from "wouter";
import { Menu, Sparkles, LayoutDashboard, FileText, TrendingUp, Settings, LogOut, ShieldAlert, Users, CreditCard, Activity, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { NAVIGATION_ITEMS, SUPERADMIN_NAVIGATION_ITEMS } from "@/constants/navigationConstant";
import { Logo } from "@/components/Logo";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  FileText,
  Sparkles,
  TrendingUp,
  Settings,
  ShieldAlert,
  Users,
  CreditCard,
  Activity,
  PieChart,
};

export function MobileHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "superadmin";
  const navItems = isSuperAdmin ? SUPERADMIN_NAVIGATION_ITEMS : NAVIGATION_ITEMS;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const links = navItems.filter(item => 
    item.roles.includes(user?.role as any)
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-20 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between px-6 z-40 lg:hidden bg-white/80 dark:bg-neutral-950/80 backdrop-blur-3xl">
      <div className="flex items-center gap-3" onClick={() => (window.location.href = "/")}>
        <Logo showText={true} className="scale-90 origin-left" />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-orange-500 hover:bg-neutral-200 dark:hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-3xl flex flex-col shadow-2xl">
            <SheetHeader className="p-8 border-b border-neutral-100 dark:border-white/5 text-left">
              <SheetTitle className="flex items-center gap-3">
                <Logo showText={true} className="scale-90 origin-left" />
              </SheetTitle>
            </SheetHeader>
            
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {links.map((link: any) => {
                const isActive = link.href === "/" 
                  ? location === "/" 
                  : location === link.href || location.startsWith(link.href + "/");
                const Icon = ICON_MAP[link.icon];
                
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-6 pr-12 py-4 rounded-full transition-all duration-300 group font-bold text-xs md:text-sm tracking-wide relative overflow-hidden h-14 font-outfit",
                      isActive 
                        ? "text-white" 
                        : "text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-x-2 inset-y-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/20 -z-10" />
                    )}
                    {Icon && <Icon className={cn("w-5 h-5 transition-transform duration-300 relative z-10", isActive ? "scale-110 text-white" : "group-hover:scale-110")} />}
                    <span className="relative z-10 truncate">{link.label}</span>
                    {isActive && (
                      <div className="absolute right-5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] z-10" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-neutral-100 dark:border-white/5 space-y-4 bg-neutral-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3 px-1">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-orange-500 text-xs text-center">
                    {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                </div>
                <div className="flex-1 min-w-0 font-semibold">
                  <p className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white truncate tracking-tight">{user?.username || 'Administrator'}</p>
                  <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">{user?.role || 'Account Holder'}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full h-12 justify-start text-red-500 hover:text-white hover:bg-red-500 rounded-xl px-4 group transition-all duration-300 border border-transparent hover:border-red-400/50"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                <span className="font-bold text-xs md:text-sm tracking-tight">Sign Out</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
