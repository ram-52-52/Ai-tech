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
    <div className={cn("premium-card p-8 min-h-[160px] relative group overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem]", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-colors duration-500" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          {trend && (
            <span className={cn(
              "text-xs md:text-sm font-bold px-3 py-1 rounded-full border",
              trendUp 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1 mt-4">
          <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm font-semibold tracking-tight">{title}</p>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors duration-300 tracking-tight">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6 h-32 space-y-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

import { Skeleton } from "./ui/skeleton";
