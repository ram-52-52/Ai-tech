import { format } from "date-fns";
import { Calendar, Eye, Edit2, Trash2 } from "lucide-react";
import { type Blog } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useDeleteBlog } from "@/hooks/use-blogs";
import { useToast } from "@/hooks/use-toast";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog(blog.id, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Blog post has been removed." });
        }
      });
    }
  };

  return (
    <div className="dashboard-card overflow-hidden flex flex-col h-full group">
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
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
            blog.isPublished 
              ? "bg-emerald-500/90 text-white" 
              : "bg-amber-500/90 text-white"
          }`}>
            {blog.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(blog.createdAt), "MMM d, yyyy")}</span>
          {blog.topic && (
            <>
              <span>•</span>
              <span className="uppercase tracking-wider font-semibold text-primary/80">{blog.topic}</span>
            </>
          )}
        </div>
        
        <h3 className="text-lg font-bold font-display text-foreground mb-3 line-clamp-2 leading-tight">
          {blog.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
          {blog.metaDescription || blog.content.substring(0, 150) + "..."}
        </p>
        
        <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/blogs/${blog.id}`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
