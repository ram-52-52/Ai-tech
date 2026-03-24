import { useTrends, useRefreshTrends } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader } from "@/components/Loader";

export default function Trends() {
  const { data: trends, isLoading } = useTrends();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshTrends();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight pb-2">Current Trends</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Real-time topics gaining massive traction online.</p>
        </div>
        <Button 
          variant="default" 
          onClick={() => refresh()} 
          disabled={isRefreshing}
          className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-primary/25 rounded-2xl h-14 px-8 font-semibold text-base"
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
            whileHover={{ y: -6 }}
            className="group glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
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
