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
      className="glass-card overflow-hidden flex flex-col h-full group relative border-white/20 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
      <div className="h-48 bg-secondary/50 relative overflow-hidden">
        {blog.imageUrl ? (
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <span className="text-6xl font-display font-bold">Ab.</span>
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {isSuperAdmin && (blog as any).author && (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 border border-white/20">
              Client: {(blog as any).author}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border border-white/10 ${
            blog.isPublished 
              ? "bg-emerald-500/90 text-white" 
              : "bg-amber-500/90 text-white"
          }`}>
            {blog.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-3">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">{format(new Date(blog.createdAt), "MMM d, yyyy")}</span>
          {(blog.topic || (blog.tags?.[0])) && (
            <>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-primary line-clamp-1 max-w-[150px]">
                {((blog.topic && !["WEB DEVELOPMENT", "CLIMATE CHANGE", "WEB-DEVELOPMENT", "CLIMATE-CHANGE"].includes(blog.topic.toUpperCase())) 
                  ? blog.topic 
                  : (blog.title.split('\n')[0].replace(/^["']|["']$/g, '').replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, '').replace(/^\d+\s*[:.-]\s*/, '').substring(0, 30))
                ) || blog.tags?.[0]}
              </span>
            </>
          )}
        </div>
        
        <h3 className="text-lg font-bold font-display text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {(() => {
            let t = blog.title.split('\n')[0].trim();
            t = t.replace(/^["']|["']$/g, ''); 
            t = t.replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, ''); 
            t = t.replace(/^\d+\s*[:.-]\s*/, ''); 
            if (t.toLowerCase().includes('" or "')) t = t.split('" or "')[0];
            if (t.toLowerCase().includes(' or ')) t = t.split(' or ')[0];
            return t.trim();
          })()}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
          {blog.metaDescription || "No description provided."}
        </p>
        
        <div className="flex items-center gap-2 pt-4 border-t border-border/50 mt-auto">
          <Button variant="ghost" size="sm" aria-label={`View ${blog.title}`} className="flex-1 bg-secondary/30 hover:bg-primary hover:text-white transition-all rounded-xl" asChild>
            <Link href={`/blogs/${blog.id}/view`}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="icon" aria-label={`Edit ${blog.title}`} className="h-9 w-9 shrink-0 hover:bg-secondary rounded-xl" asChild>
            <Link href={`/blogs/${blog.id}`}>
              <Edit2 className="w-4 h-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 shrink-0 text-destructive hover:text-white hover:bg-destructive transition-colors"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel border-white/20 dark:border-white/10 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground font-display text-xl">Delete Blog Post?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-base">
                  This action cannot be undone. This will permanently delete your blog post <span className="font-semibold text-foreground">"{blog.title}"</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    deleteBlog(blog.id, {
                      onSuccess: () => {
                        toast({ title: "Deleted", description: "Blog post has been removed." });
                      }
                    });
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-white rounded-xl shadow-lg shadow-destructive/20"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.article>
  );
}
