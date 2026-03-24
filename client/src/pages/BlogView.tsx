import { useRoute, useLocation } from "wouter";
import { useBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, Calendar, Tag, Share2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react"; // Added useEffect import

export default function BlogView() {
  const [match, params] = useRoute("/blogs/:id/view");
  // Changed id extraction to match instruction, assuming useParams is available or intended.
  // Note: In wouter, params are typically obtained from useRoute. If useParams is a custom hook, it needs to be defined.
  // For standard wouter, `const id = parseInt(params?.id || "0");` would be the typical way.
  const id = parseInt(params?.id || "0"); // Keeping original wouter id extraction for compatibility, as useParams is not a wouter hook.
  const [, setLocation] = useLocation();

  const { data: blog, isLoading } = useBlog(id);

  // Removed redundant image rescue effect to trust backend-resolved URLs

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display">Blog not found</h2>
        <Button onClick={() => setLocation("/blogs")}>Back to Blogs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => setLocation("/blogs")} className="hover:bg-secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation(`/blogs/${id}`)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Blog
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-primary">
            <span className="bg-primary/10 px-3 py-1 rounded-full text-[10px] sm:text-xs">
              {((blog.topic && !["WEB DEVELOPMENT", "CLIMATE CHANGE", "WEB-DEVELOPMENT", "CLIMATE-CHANGE"].includes(blog.topic.toUpperCase())) 
                ? blog.topic 
                : (blog.title.split('\n')[0].replace(/^["']|["']$/g, '').replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, '').replace(/^\d+\s*[:.-]\s*/, '').substring(0, 40))
              ) || blog.tags?.[0] || "Article"}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(blog.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground leading-tight">
            {(() => {
              let t = blog.title.split('\n')[0].trim();
              t = t.replace(/^["']|["']$/g, ''); 
              t = t.replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, ''); 
              t = t.replace(/^\d+\s*[:.-]\s*/, ''); 
              if (t.toLowerCase().includes('" or "')) t = t.split('" or "')[0];
              if (t.toLowerCase().includes(' or ')) t = t.split(' or ')[0];
              return t.trim();
            })()}
          </h1>

        </div>

        {blog.imageUrl && (
          <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-sm">
          {blog.content?.includes("In the rapidly evolving landscape of") && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-amber-500 font-bold font-display">AI Content Preview</h4>
                <p className="text-xs text-amber-800/70 mt-1 leading-relaxed">
                  This blog is in <strong>Preview Mode</strong>. The placeholder text below demonstrates the article structure.
                </p>
              </div>
            </div>
          )}
          <article 
            className="blog-content prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: (blog.content || "")
                .replace(/<div style="background: #f8fafc;[\s\S]*?Creative Preview Mode[\s\S]*?<\/div>/gi, "")
            }}
          />
        </div>

        {/* Tags Footer */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mr-2 py-1">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Tags:</span>
            </div>
            {blog.tags.map(tag => (
              <span key={tag} className="bg-secondary/50 text-secondary-foreground px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors cursor-default">
                {tag}
              </span>
            ))}
          </div>
        )}
    </div>
  </div>
);
}
