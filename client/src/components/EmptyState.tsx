import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-1000",
      className
    )}>
      <div className="w-24 h-24 rounded-[2.5rem] bg-orange-500/10 flex items-center justify-center text-primary mb-10 shadow-sm ring-1 ring-primary/20 transition-transform duration-700">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionText && (
        <Button 
          onClick={onAction}
          className="rounded-2xl px-10 h-14 font-bold text-sm md:text-base shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 bg-orange-500 hover:bg-orange-600 text-white border-none"
        >
          <Plus className="w-5 h-5 mr-3" />
          {actionText}
        </Button>
      )}
    </div>
  );
}
