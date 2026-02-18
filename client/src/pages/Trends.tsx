import { useTrends, useRefreshTrends } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Trends() {
  const { data: trends, isLoading } = useTrends();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshTrends();

  if (isLoading) {
    return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Current Trends</h1>
          <p className="text-muted-foreground mt-1">Real-time topics gaining traction online.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refresh()} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Trends
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends?.map((trend, idx) => (
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              {trend.volume && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-foreground/80">
                  {trend.volume.toLocaleString()} searches
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold font-display text-foreground mb-3">{trend.topic}</h3>
            
            <div className="mt-6 flex items-center gap-3">
              <Button className="flex-1" size="sm" asChild>
                <Link href={`/generate?topic=${encodeURIComponent(trend.topic)}`}>
                  Generate Blog
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
        
        {!trends?.length && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No trends found. Try refreshing.
          </div>
        )}
      </div>
    </div>
  );
}
