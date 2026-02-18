import { useBlogs, useDeleteBlog } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function BlogList() {
  const { data: blogs, isLoading } = useBlogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortedBlogs = blogs 
    ? [...blogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">All Blogs</h1>
          <p className="text-muted-foreground mt-1">Manage, edit, and publish your generated content.</p>
        </div>
        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" asChild>
          <Link href="/generate">
            <Plus className="w-5 h-5 mr-2" />
            Generate New
          </Link>
        </Button>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold font-display text-foreground mb-2">No blogs yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by generating your first AI-powered blog post based on trending topics.
          </p>
          <Button asChild>
            <Link href="/generate">Generate Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
