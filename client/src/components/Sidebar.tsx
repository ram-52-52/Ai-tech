import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Sparkles, TrendingUp, Settings, LogOut, ShieldAlert, Users, CreditCard, Activity, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "superadmin";
  const navItems = isSuperAdmin ? SUPERADMIN_NAVIGATION_ITEMS : NAVIGATION_ITEMS;
  
  const filteredLinks = navItems.filter(item => 
    item.roles.includes(user?.role as any)
  );

  return (
    <aside className="w-[280px] h-[calc(100vh-2rem)] fixed left-4 top-4 rounded-[2.5rem] shadow-2xl overflow-hidden hidden lg:flex flex-col z-50 transition-all duration-700 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="p-8 relative flex-1">
        {/* Logo Section */}
        <div 
          className="mb-12 group" 
          onClick={() => window.location.href = '/'}
        >
          <Logo />
        </div>

        {/* Navigation Section */}
        <nav className="space-y-2">
          {filteredLinks.map((link: any) => {
            const isActive = link.href === "/" 
              ? location === "/" 
              : location === link.href || location.startsWith(link.href + "/");
            const Icon = ICON_MAP[link.icon];
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-4 px-6 pr-12 py-4 rounded-full transition-all duration-300 group font-bold text-sm md:text-[15px] tracking-wide relative overflow-hidden h-14 font-outfit",
                  isActive 
                    ? "text-white" 
                    : "text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-x-2 inset-y-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/20 -z-10" 
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-transparent group-hover:bg-neutral-100 dark:group-hover:bg-white/5 -z-10 transition-colors" />
                )}
                {Icon && (
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300 relative z-10", 
                    isActive ? "scale-110 text-white" : "group-hover:scale-110"
                  )} />
                )}
                <span className="relative z-10 truncate">{link.label}</span>
                {isActive && (
                  <div className="absolute right-5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] z-10" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3 overflow-hidden group/profile cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-orange-500 text-xs">
                {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white truncate tracking-tight">{user?.username || 'Administrator'}</p>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">{user?.role || 'Account Holder'}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Button 
          variant="ghost" 
          className="w-full h-12 justify-start text-red-500 hover:text-white hover:bg-red-500 rounded-xl px-4 group transition-all duration-300 border border-transparent hover:border-red-400/50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-xs md:text-sm tracking-tight">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
