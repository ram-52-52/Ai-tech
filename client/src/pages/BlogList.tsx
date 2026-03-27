import { useState } from "react";
import { useBlogs, useDeleteBlog } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { BlogSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";

export default function BlogList() {
  const { data: blogs, isLoading } = useBlogs();
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

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

  const totalPages = Math.ceil(sortedBlogs.length / itemsPerPage);
  const currentBlogs = sortedBlogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta text-glow">
      <SEO 
        title="Content Library | AI TECH" 
        description="Manage your library of AI-generated articles. Edit, publish, or generate new content." 
      />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <FileText className="w-3.5 h-3.5" /> Content Repository
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Blog <span className="text-orange-500">Library</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium tracking-tight">Your organized library of AI-generated articles and professional drafts.</p>
        </div>
        <Button 
          variant="default" 
          asChild
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 rounded-2xl px-10 h-16 font-bold text-sm md:text-base tracking-tight transition-all duration-500 hover:-translate-y-1 text-white border-none group"
        >
          <Link href="/generate">
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            Create New
          </Link>
        </Button>
      </div>

      {sortedBlogs.length === 0 ? (
        <div className="premium-card rounded-[2.5rem] md:rounded-[3rem]">
          <div className="bg-white dark:bg-black/40 backdrop-blur-3xl rounded-[2.45rem] md:rounded-[2.95rem] p-10 md:p-20 text-center">
             <EmptyState 
               icon={FileText}
               title="LIBRARY EMPTY"
               description="Start generating your first AI blog to populate your content library."
               actionText="Generate Now"
               onAction={() => window.location.href = '/generate'}
             />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentBlogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10 border-t border-neutral-100 dark:border-neutral-900">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                    setPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-12 rounded-xl px-6 font-bold text-xs uppercase tracking-widest border-neutral-200 dark:border-neutral-800"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setPage(i + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                            page === i + 1 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 px-0' 
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-12 rounded-xl px-6 font-bold text-xs uppercase tracking-widest border-neutral-200 dark:border-neutral-800"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
