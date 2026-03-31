import { useTrends, useRefreshTrends } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader } from "@/components/Loader";
import { SEO } from "@/components/SEO";

export default function Trends() {
  const { data: trends, isLoading } = useTrends();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshTrends();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO 
        title="Trending Topics | AI TECH" 
        description="Real-time topics gaining traction across global networks." 
      />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/5 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Market Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Trending Topic<span className="text-orange-500 ml-4">Analysis</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium tracking-tight">Discover high-traction topics from across the web for instant content generation.</p>
        </div>
        <Button 
          variant="default" 
          onClick={() => refresh()} 
          disabled={isRefreshing}
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 rounded-2xl px-10 h-16 font-bold text-sm md:text-base tracking-tight transition-all duration-500 hover:-translate-y-1 text-white border-none group"
        >
          <RefreshCw className={`w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-700 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Discovery Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
        {trends?.map((trend, idx) => (
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="premium-card group rounded-[2.5rem] hover:-translate-y-2 transition-all duration-700 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
          >
            <div className="p-6 xl:p-8 h-full flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 rounded-full" />
                              <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                     <TrendingUp className="w-6 h-6" />
                   </div>
                    {trend.volume && (
                      <div className="flex flex-col items-end">
                       <span className="text-xs md:text-sm font-bold text-orange-500">Popular</span>
                       <span className="text-xs md:text-sm font-medium text-neutral-400 dark:text-neutral-500 tracking-tight mt-0.5">
                         {trend.volume.toLocaleString()} sources detected
                       </span>
                    </div>
                    )}
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight leading-tight group-hover:text-orange-500 transition-colors flex-1">{trend.topic}</h2>
                              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                  <Link href={`/generate?topic=${encodeURIComponent(trend.topic)}`} className="flex-1">
                    <Button className="w-full h-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-sm md:text-base tracking-tight transition-all group-hover:-translate-y-1 border-none shadow-lg">
                      Generate Content
                    </Button>
                  </Link>
                 <Button variant="ghost" size="icon" className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl text-muted-foreground hover:text-foreground">
                   <Search className="w-4 h-4" />
                 </Button>
               </div>
            </div>
          </motion.div>
        ))}
        
        {!trends?.length && (
          <div className="col-span-full py-20 premium-card text-center rounded-[3rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-600">No trending topics discovered in the current cycle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
