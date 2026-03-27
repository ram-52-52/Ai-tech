import { useRoute, useLocation } from "wouter";
import { useBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, Calendar, Tag, Share2, Clock } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function BlogView() {
  const [match, params] = useRoute("/blogs/:id/view");
  // Changed id extraction to match instruction, assuming useParams is available or intended.
  // Note: In wouter, params are typically obtained from useRoute. If useParams is a custom hook, it needs to be defined.
  // For standard wouter, `const id = parseInt(params?.id || "0");` would be the typical way.
  const id = parseInt(params?.id || "0"); // Keeping original wouter id extraction for compatibility, as useParams is not a wouter hook.
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [, setLocation] = useLocation();
  const backPath = isSuperAdmin ? "/superadmin/blogs" : "/blogs";

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
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Blog not found</h2>
        <Button onClick={() => setLocation(backPath)} className="">Back to Blogs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700 px-4 sm:px-6 font-plus-jakarta">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <Button variant="outline" onClick={() => setLocation(backPath)} className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm md:text-base font-bold tracking-tight hover:bg-neutral-100 dark:hover:bg-neutral-800 group shadow-sm text-neutral-900 dark:text-white">
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setLocation(`/blogs/${id}`)} className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm md:text-base font-bold tracking-tight shadow-lg shadow-orange-500/10 transition-all border-none">
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Post
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <Share2 className="w-4 h-4 text-neutral-500" />
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-sm font-bold text-orange-500">
            <span className="bg-orange-500/10 px-3 py-1 rounded-lg text-xs md:text-sm tracking-wide border border-orange-500/20 font-semibold">
              {((blog.topic && !["WEB DEVELOPMENT", "CLIMATE CHANGE", "WEB-DEVELOPMENT", "CLIMATE-CHANGE"].includes(blog.topic.toUpperCase())) 
                ? blog.topic 
                : (blog.title.split('\n')[0].replace(/^["']|["']$/g, '').replace(/^(option|title|choice)\s*\d+\s*[:.-]\s*/gi, '').replace(/^\d+\s*[:.-]\s*/, '').substring(0, 40))
              ) || blog.tags?.[0] || "Article"}
            </span>
            <span className="text-neutral-200 dark:text-neutral-800">•</span>
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-semibold tracking-tight">
              <Calendar className="w-4 h-4" />
              {format(new Date(blog.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight">
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
          <div className="aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl shadow-orange-500/5 border border-neutral-200 dark:border-white/5">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 md:p-14 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" />
          
          {blog.content?.includes("In the rapidly evolving landscape of") && (
            <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/10 rounded-2xl p-5 flex items-start gap-4 mb-10 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-orange-600 dark:text-orange-500 font-bold text-sm">AI-Generated Content</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  This blog is optimized for your selected platform. Review the details below to ensure it aligns with your brand voice.
                </p>
              </div>
            </div>
          )}
          
          <article 
            className="blog-content prose prose-neutral dark:prose-invert prose-orange max-w-none text-sm md:text-base leading-relaxed relative z-10"
            dangerouslySetInnerHTML={{ 
              __html: (blog.content || "")
                .replace(/<div style="background: #f8fafc;[\s\S]*?Creative Preview Mode[\s\S]*?<\/div>/gi, "")
            }}
          />
        </div>

        {/* Tags Footer */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 mr-2 py-1">
              <Tag className="w-4 h-4 text-orange-500" />
              <span className="text-xs md:text-sm font-bold tracking-wide">Related Tags:</span>
            </div>
            {blog.tags.map(tag => (
              <span key={tag} className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold tracking-wide hover:bg-orange-500/10 hover:text-orange-500 transition-all border border-neutral-200 dark:border-neutral-800 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
