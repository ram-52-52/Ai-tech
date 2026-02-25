import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Trash2, Eye, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EditBlog() {
  const [match, params] = useRoute("/blogs/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: blog, isLoading } = useBlog(id);
  const { mutate: update, isPending: isSaving } = useUpdateBlog();
  const { mutate: remove, isPending: isDeleting } = useDeleteBlog();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    metaDescription: "",
    isPublished: false,
    tags: "",
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        content: blog.content,
        slug: blog.slug,
        metaDescription: blog.metaDescription || "",
        isPublished: blog.isPublished || false,
        tags: blog.tags ? blog.tags.join(", ") : "",
      });
    }
  }, [blog]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" /></div>;
  }

  if (!blog) {
    return <div className="text-center py-20">Blog not found</div>;
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
    
    update({
      id,
      title: formData.title,
      content: formData.content,
      slug: formData.slug,
      metaDescription: formData.metaDescription,
      isPublished: formData.isPublished,
      tags: tagsArray,
    }, {
      onSuccess: () => {
        toast({ title: "Saved successfully", description: "Your changes have been saved." });
      },
      onError: () => {
        toast({ title: "Error saving", description: "Could not save changes.", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this blog?")) {
      remove(id, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Blog has been removed." });
          setLocation("/blogs");
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/blogs")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-bold text-foreground">Edit Blog</h1>
            <span className="text-xs text-muted-foreground">Last saved: {format(new Date(), "h:mm a")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-primary/20">
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Blog Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => handleChange("title", e.target.value)}
                className="text-lg font-display font-bold py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-base">Content</Label>
              <Textarea 
                id="content" 
                value={formData.content}
                onChange={e => handleChange("content", e.target.value)}
                className="min-h-[500px] font-mono text-sm leading-relaxed p-4"
              />
              <p className="text-xs text-muted-foreground text-right">Markdown supported</p>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
            <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-4">Publishing</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Published Status</Label>
                <p className="text-xs text-muted-foreground">Visible to the public</p>
              </div>
              <Switch 
                checked={formData.isPublished}
                onCheckedChange={checked => handleChange("isPublished", checked)}
              />
            </div>

            <div className="pt-4 border-t border-border/50 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="slug" 
                    value={formData.slug} 
                    onChange={e => handleChange("slug", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Meta Description</Label>
                <Textarea 
                  id="meta" 
                  value={formData.metaDescription} 
                  onChange={e => handleChange("metaDescription", e.target.value)}
                  className="h-24 resize-none"
                  placeholder="Brief summary for SEO..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  value={formData.tags}
                  onChange={e => handleChange("tags", e.target.value)}
                  placeholder="tech, ai, future..."
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              See how your blog post looks to visitors before publishing.
            </p>
            <Button variant="outline" className="w-full bg-background" onClick={() => window.open(`/api/blogs/preview/${id}`, '_blank')}>
              Open Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
