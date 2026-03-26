import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse-subtle rounded-xl bg-slate-200 dark:bg-slate-800", className)}
      {...props}
    />
  )
}

export function BlogSkeleton() {
  return (
    <div className="glass-card rounded-[2rem] p-6 space-y-4">
      <Skeleton className="w-full aspect-video rounded-2xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export { Skeleton }
