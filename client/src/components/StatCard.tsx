import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("dashboard-card p-6 relative group overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-500 group-hover:scale-110">
            {icon}
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trendUp 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            )}>
              {trend}
            </span>
          )}
        </div>
      <div className="mt-auto relative z-10">
        <p className="text-muted-foreground text-sm font-semibold mb-1 uppercase tracking-widest">{title}</p>
        <h3 className="text-4xl font-display font-black text-foreground group-hover:text-glow transition-all duration-300">{value}</h3>
      </div>
      </div>
    </div>
  );
}
