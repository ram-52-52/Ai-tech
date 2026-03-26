import { useBlogs, useTrends } from "@/hooks/use-blogs";
import { useGlobalStats } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/StatCard";
import { BlogCard } from "@/components/BlogCard";
import { FileText, CheckCircle2, TrendingUp, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/Loader";
import { SEO } from "@/components/SEO";
import { BlogSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { StatCardSkeleton } from "@/components/StatCard";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const { data: blogs, isLoading: blogsLoading } = useBlogs();
  const { data: trends, isLoading: trendsLoading } = useTrends();
  const { data: globalStats, isLoading: statsLoading } = useGlobalStats(isSuperAdmin);

  if (blogsLoading || trendsLoading || (isSuperAdmin && statsLoading)) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <SEO title="Dashboard" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BlogSkeleton />
              <BlogSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allBlogs = blogs || [];
  const publishedCount = allBlogs.filter(b => b.isPublished).length;
  const draftCount = allBlogs.length - publishedCount;
  
  // Calculate a fake "views" stat just for visual
  const totalViews = allBlogs.length * 142 + 2543;

  const recentBlogs = [...allBlogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const topTrends = trends?.slice(0, 4) || [];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <SEO 
        title="Dashboard" 
        description="View your AI-Tech SaaS overview, track trends, and manage your latest blogs." 
      />
      <motion.header variants={itemVariants} className="mb-10 pt-4 md:pt-0">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-lg font-medium">Welcome back! Here's what's happening with your content.</p>
        </div>
      </motion.header>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-6",
        isSuperAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}>
        <StatCard 
          title={isSuperAdmin ? "Total Platform Blogs" : "Total Blogs"} 
          value={isSuperAdmin ? (globalStats?.totalBlogs || 0) : allBlogs.length} 
          icon={<FileText className="w-5 h-5 text-primary" />}
          trend={isSuperAdmin ? undefined : "+12%"}
          trendUp={isSuperAdmin ? undefined : true}
        />
        <StatCard 
          title="Published" 
          value={isSuperAdmin ? (globalStats?.totalPublished || 0) : publishedCount} 
          icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
        />
        <StatCard 
          title="Drafts" 
          value={isSuperAdmin ? (globalStats?.totalDrafts || 0) : draftCount} 
          icon={<RefreshCw className="w-5 h-5 text-primary" />}
        />
        {isSuperAdmin && (
          <StatCard 
            title="Total Clients" 
            value={globalStats?.totalUsers || 0} 
            icon={<UserPlus className="w-5 h-5 text-primary" />}
          />
        )}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Recent Blogs Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-foreground">Recent Posts</h2>
            <Link href="/blogs" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">View All &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence>
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog, idx) => (
                  <motion.div
                    key={blog.id}
                    variants={itemVariants}
                    layout
                  >
                    <BlogCard blog={blog} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2">
                  <EmptyState 
                    icon={FileText}
                    title="No blogs created yet"
                    description="Get started by generating your first piece of AI content. It's fast, professional, and SEO-optimized."
                    actionText="Create Your First Blog"
                    onAction={() => window.location.href = '/generate'}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Trends Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-foreground">Trending Topics</h2>
            <Link href="/trends" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">See All &rarr;</Link>
          </div>

          <div className="glass-panel rounded-2xl p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            
            {topTrends.length > 0 ? (
              <div className="divide-y divide-border/50 relative">
                {topTrends.map((trend, i) => (
                  <div key={trend.id} className="p-5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shadow-sm">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-foreground/90">{trend.topic}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary/20" asChild>
                      <Link href={`/generate?topic=${encodeURIComponent(trend.topic)}`}>
                        <Sparkles className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm relative">
                <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                No trends available.
              </div>
            )}
            <div className="p-4 bg-background/50 border-t border-border/50 relative backdrop-blur-md">
              <Button className="w-full rounded-xl" variant="outline" asChild>
                <Link href="/generate">Generate from Trends</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
