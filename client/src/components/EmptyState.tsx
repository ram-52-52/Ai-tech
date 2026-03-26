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
      "flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700",
      className
    )}>
      <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary mb-8 shadow-2xl shadow-primary/10 ring-1 ring-primary/20">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionText && (
        <Button 
          onClick={onAction}
          className="rounded-2xl px-8 py-6 h-auto font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
        >
          <Plus className="w-5 h-5 mr-2" />
          {actionText}
        </Button>
      )}
    </div>
  );
}
