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
    <div className={cn("dashboard-card p-6", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary">
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
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
      </div>
    </div>
  );
}
