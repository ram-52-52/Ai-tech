import { useBlogs, useTrends } from "@/hooks/use-blogs";
import { StatCard } from "@/components/StatCard";
import { BlogCard } from "@/components/BlogCard";
import { FileText, CheckCircle2, TrendingUp, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/Loader";

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
  const { data: blogs, isLoading: blogsLoading } = useBlogs();
  const { data: trends, isLoading: trendsLoading } = useTrends();

  if (blogsLoading || trendsLoading) {
    return <Loader />;
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
      className="space-y-8"
    >
      <motion.header variants={itemVariants} className="mb-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight pb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg font-medium">Welcome back! Here's what's happening with your content.</p>
      </motion.header>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Blogs" 
          value={allBlogs.length} 
          icon={<FileText className="w-5 h-5 text-primary" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Published" 
          value={publishedCount} 
          icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
        />
        <StatCard 
          title="Drafts" 
          value={draftCount} 
          icon={<RefreshCw className="w-5 h-5 text-primary" />}
        />
        <StatCard 
          title="Total Views" 
          value={totalViews.toLocaleString()} 
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          trend="+24%"
          trendUp={true}
        />
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
                <div className="col-span-2 py-16 text-center glass-card rounded-2xl border border-dashed border-border/60">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No blogs created yet</h3>
                  <p className="text-muted-foreground mb-6">Get started by generating your first piece of AI content.</p>
                  <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                    <Link href="/generate">Create Your First Blog</Link>
                  </Button>
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
