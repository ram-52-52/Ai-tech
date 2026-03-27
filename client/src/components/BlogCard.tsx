import { format } from "date-fns";
import { Calendar, Eye, Edit2, Trash2 } from "lucide-react";
import { type Blog } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useDeleteBlog } from "@/hooks/use-blogs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
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

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { toast } = useToast();

  return (
    <motion.article 
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="premium-card overflow-hidden flex flex-col h-full group relative border border-neutral-200 dark:border-neutral-800 hover:border-orange-500 transition-all duration-300 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-sm hover:shadow-xl"
    >
      {/* Image Section */}
      <div className="h-52 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        {blog.imageUrl ? (
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <span className="text-4xl font-bold text-neutral-200 dark:text-neutral-800 tracking-tighter">AI</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className={`px-3 py-1 rounded-lg text-xs md:text-sm font-bold tracking-wide shadow-md ${
            blog.isPublished 
              ? "bg-emerald-500 text-white" 
              : "bg-orange-500 text-white shadow-xl shadow-orange-500/20"
          }`}>
            {blog.isPublished ? "Published" : "Drafting"}
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-400 dark:text-neutral-500 mb-3 tracking-tight">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span>{format(new Date(blog.createdAt), "MMM dd, yyyy")}</span>
          {isSuperAdmin && (blog as any).author && (
            <>
              <span className="mx-1">•</span>
              <span className="text-orange-500/80 font-bold">{(blog as any).author.split('@')[0]}</span>
            </>
          )}
        </div>
        
        <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors tracking-tight">
          {(() => {
            let t = blog.title.split('\n')[0].trim();
            t = t.replace(/^["']|["']$/g, ''); 
            t = t.replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, ''); 
            t = t.replace(/^\d+\s*[:.-]\s*/, ''); 
            return t.trim();
          })()}
        </h3>
        
        <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm line-clamp-2 mb-6 flex-1 font-medium leading-relaxed tracking-tight">
          {blog.metaDescription || "Click to view the full content of this blog post and manage its details."}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
          <Button variant="outline" size="sm" className="flex-1 h-10 rounded-xl text-sm md:text-base font-bold tracking-tight bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-sm text-neutral-900 dark:text-white" asChild>
            <Link href={`/blogs/${blog.id}/view`}>
              <Eye className="w-3.5 h-3.5 mr-2" />
              View Post
            </Link>
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white shadow-sm" asChild>
            <Link href={`/blogs/${blog.id}`}>
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 shrink-0 bg-red-500/5 text-red-500/50 hover:text-white hover:bg-red-500 transition-all duration-300 rounded-xl"
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-4 md:p-8 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none text-center md:text-left">Delete Blog Post?</AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base mt-2 font-medium text-center md:text-left">
                  Are you sure you want to delete <span className="text-orange-500 font-bold">"{blog.title}"</span>? This action is permanent and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-6 gap-3">
                <AlertDialogCancel className="rounded-xl h-11 px-6 text-sm md:text-base font-bold bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border-none text-neutral-900 dark:text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    deleteBlog(blog.id, {
                      onSuccess: () => {
                        toast({ title: "Deleted", description: "The blog post has been removed successfully." });
                      }
                    });
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6 text-sm md:text-base font-bold shadow-lg shadow-red-500/20 border-none"
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.article>
  );
}
