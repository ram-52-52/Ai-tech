import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { type Blog } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Edit, Grid, Trash2, Clock, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteBlog } from "@/hooks/use-blogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SuperAdminBlogs() {
  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });
  const [, setLocation] = useLocation();
  const { mutate: deleteBlog } = useDeleteBlog();

  const getExcerpt = (html: string) => {
    if (!html) return "No content available.";
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.substring(0, 150) + "...";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-plus-jakarta">
      <SEO title="Blog Management | AI Core" description="Manage all platform blogs, edit content, and monitor publications." />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <Grid className="w-3 h-3" /> Blog Administration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Blog <span className="text-orange-500">Management</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-sm md:text-base font-medium font-semiboldng-tight">Review and manage all blog posts across the entire platform.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <RefreshCw className="w-10 h-10 text-orange-500 animate-spin" />
          <span className="text-xs font-semibold text-neutral-400 tracking-wide">Fetching Content...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {blogs?.map((blog: any) => (
            <div 
              key={blog.id} 
              className="premium-card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 overflow-hidden h-full flex flex-col cursor-pointer"
              onClick={() => setLocation(`/blogs/${blog.id}/view`)}
            >
              {blog.imageUrl && (
                <div className="w-full h-48 overflow-hidden relative shrink-0 border-b border-neutral-100 dark:border-white/5">
                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <Badge className={cn(
                    "absolute top-4 left-4 h-7 px-3 rounded-lg font-bold text-xs md:text-sm tracking-tight",
                    blog.isPublished 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  )}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              )}

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="flex items-center justify-between text-xs md:text-sm font-bold text-neutral-400 dark:text-neutral-500 tracking-wide">
                  <span className="flex items-center gap-2">
                     <Clock className="w-3 h-3 text-orange-500" /> {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-white/5 rounded border border-neutral-200 dark:border-neutral-800">ID: {blog.id}</span>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {blog.metaDescription || getExcerpt(blog.content)}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-xs md:text-sm font-bold text-orange-500">
                      {(blog.author || "SYS").substring(0, 2)}
                    </div>
                    <span className="text-xs md:text-sm font-bold text-neutral-500 dark:text-neutral-400 tracking-wide truncate max-w-[120px]">
                      {blog.author || "Admin"}
                    </span>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setLocation(`/blogs/${blog.id}`)}
                      className="h-9 w-9 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-orange-500 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-8 max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-bold text-2xl text-neutral-900 dark:text-white tracking-tight">Delete Blog?</AlertDialogTitle>
                          <AlertDialogDescription className="text-neutral-500 dark:text-neutral-400 mt-2">
                            Are you sure you want to delete "{blog.title}"? This action cannot be undone and the content will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-6 gap-3">
                          <AlertDialogCancel className="h-11 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-none">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBlog(blog.id)}
                            className="h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 px-6"
                          >
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!blogs || blogs.length === 0) && (
             <div className="col-span-full py-32 text-center rounded-[2.5rem] border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/[0.01]">
                <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">No blogs found in the platform archives.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
