import { useBlogs, useDeleteBlog } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader } from "@/components/Loader";
import { SEO } from "@/components/SEO";
import { BlogSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { FileText } from "lucide-react";

export default function BlogList() {
  const { data: blogs, isLoading } = useBlogs();

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <SEO title="All Blogs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogSkeleton />
          <BlogSkeleton />
          <BlogSkeleton />
        </div>
      </div>
    );
  }

  const sortedBlogs = blogs 
    ? [...blogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="space-y-10">
      <SEO 
        title="All Blogs" 
        description="Manage your library of AI-generated articles. Edit, publish, or generate new content." 
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 glass-panel rounded-[2.5rem] border-white/20 relative overflow-hidden">
        <div className="relative z-10 w-full">
          <h1 className="text-3xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight pb-2">All Blogs</h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg font-medium max-w-md">Manage, edit, and publish your AI-generated content with ease.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto mt-4 sm:mt-0">
          <Button size="lg" className="rounded-2xl shadow-2xl shadow-primary/30 h-14 px-8 font-bold text-base bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity w-full sm:w-auto" asChild>
            <Link href="/generate">
              <Plus className="w-5 h-5 mr-2" />
              Generate New
            </Link>
          </Button>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {sortedBlogs.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="No blogs yet"
          description="Get started by generating your first AI-powered blog post based on trending topics."
          actionText="Generate Content"
          onAction={() => window.location.href = '/generate'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBlogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <BlogCard blog={blog} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
