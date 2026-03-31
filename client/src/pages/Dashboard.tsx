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
      className="font-plus-jakarta"
    >
      <SEO 
        title="Dashboard" 
        description="View your AI Core overview, track trends, and manage your latest blogs." 
      />
      <motion.header variants={itemVariants} className="mb-10 pt-4 md:pt-0">
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
            Dashboard <span className="text-orange-500">Overview</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-sm md:text-base font-medium tracking-tight">
            Manage your content generation and monitor platform activity
          </p>
        </div>
      </motion.header>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6",
        isSuperAdmin ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-3"
      )}>
        <StatCard 
          title={isSuperAdmin ? "Total Platform Blogs" : "My Total Blogs"} 
          value={isSuperAdmin ? (globalStats?.totalBlogs || 0) : allBlogs.length} 
          icon={<FileText className="w-6 h-6" />}
          trend={isSuperAdmin ? undefined : "+12%"}
          trendUp={isSuperAdmin ? undefined : true}
        />
        <StatCard 
          title="Published Multi-Platform" 
          value={isSuperAdmin ? (globalStats?.totalPublished || 0) : publishedCount} 
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <StatCard 
          title="Drafts In Progress" 
          value={isSuperAdmin ? (globalStats?.totalDrafts || 0) : draftCount} 
          icon={<RefreshCw className="w-6 h-6" />}
        />
        {isSuperAdmin && (
          <StatCard 
            title="Registered Accounts" 
            value={globalStats?.totalUsers || 0} 
            icon={<UserPlus className="w-6 h-6" />}
          />
        )}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-10 mt-8 xl:mt-12">
        {/* Recent Blogs Section */}
        <motion.div variants={itemVariants} className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Recent <span className="text-orange-500">Blogs</span></h2>
            <Link href="/blogs" className="text-xs md:text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-2">
              View all posts <TrendingUp className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
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
                    title="No Blogs Found"
                    description="You haven't generated any blogs yet. Start creating high-quality content today."
                    actionText="Generate Now"
                    onAction={() => window.location.href = '/generate'}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Trends Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Popular <span className="text-orange-500">Topics</span></h2>
          </div>

          <div className="premium-card p-0 overflow-hidden relative border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-3xl">
            {topTrends.length > 0 ? (
              <div className="divide-y divide-neutral-100 dark:divide-white/5">
                {topTrends.map((trend, i) => (
                  <div key={trend.id} className="p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="text-xs md:text-sm font-semibold text-orange-500/40 group-hover:text-orange-500 transition-colors">
                        0{i + 1}
                      </span>
                      <span className="font-semibold text-sm md:text-base text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                        {trend.topic}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white" asChild>
                      <Link href={`/generate?topic=${encodeURIComponent(trend.topic)}`}>
                        <Sparkles className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-neutral-400 dark:text-neutral-600 font-medium tracking-tight text-xs">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
                Updating trends...
              </div>
            )}
            <div className="p-5 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
              <Button className="w-full h-12 rounded-xl text-sm md:text-base font-bold tracking-tight" variant="outline" asChild>
                <Link href="/generate">Create New Post</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
