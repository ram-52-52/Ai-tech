import { useBlogs, useTrends } from "@/hooks/use-blogs";
import { StatCard } from "@/components/StatCard";
import { BlogCard } from "@/components/BlogCard";
import { FileText, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: blogs, isLoading: blogsLoading } = useBlogs();
  const { data: trends, isLoading: trendsLoading } = useTrends();

  if (blogsLoading || trendsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your content.</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Blogs" 
          value={allBlogs.length} 
          icon={<FileText className="w-5 h-5" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Published" 
          value={publishedCount} 
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard 
          title="Drafts" 
          value={draftCount} 
          icon={<RefreshCw className="w-5 h-5" />}
        />
        <StatCard 
          title="Total Views" 
          value={totalViews.toLocaleString()} 
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+24%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Blogs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Recent Posts</h2>
            <Link href="/blogs" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center bg-secondary/30 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No blogs created yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/generate">Create Your First Blog</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Trends Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Trending Topics</h2>
            <Link href="/trends" className="text-sm font-medium text-primary hover:underline">See All</Link>
          </div>

          <div className="dashboard-card p-0 overflow-hidden">
            {topTrends.length > 0 ? (
              <div className="divide-y divide-border">
                {topTrends.map((trend, i) => (
                  <div key={trend.id} className="p-4 hover:bg-secondary/50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{trend.topic}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs" asChild>
                      <Link href={`/generate?topic=${encodeURIComponent(trend.topic)}`}>Create</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No trends available.
              </div>
            )}
            <div className="p-4 bg-secondary/30 border-t border-border">
              <Button className="w-full" variant="outline" asChild>
                <Link href="/generate">Generate from Trends</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
