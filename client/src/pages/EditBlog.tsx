import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-blogs";
import { useSites, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, Save, Trash2, Eye, Globe, CalendarClock, Clock, 
  CheckCircle2, X, RefreshCw, Sparkles, Wand2, Type, 
  Image as ImageIcon, Hash, Tags
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export default function EditBlog() {
  const [match, params] = useRoute("/blogs/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: blog, isLoading } = useBlog(id);
  const { mutate: update, isPending: isSaving } = useUpdateBlog();
  const { mutate: remove, isPending: isDeleting } = useDeleteBlog();

  const { data: sites } = useSites();
  const { data: allScheduled } = useScheduledPosts();
  const { mutate: createScheduled, isPending: isScheduling } = useCreateScheduledPost();
  const { mutate: deleteScheduled } = useDeleteScheduledPost();

  const queryClient = useQueryClient();
  const scheduledForThisBlog = allScheduled?.filter((s) => s.blogId === id) ?? [];
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingFull, setIsRegeneratingFull] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize React Hook Form
  const { register, handleSubmit, setValue, watch, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      title: "",
      content: "",
      slug: "",
      metaDescription: "",
      isPublished: false,
      tags: "",
      imageUrl: "",
      topic: ""
    }
  });

  const [scheduleForm, setScheduleForm] = useState({
    siteId: "",
    scheduledAt: "",
  });

  const currentTitle = watch("title");
  const currentImageUrl = watch("imageUrl");

  useEffect(() => {
    if (blog) {
      reset({
        ...blog,
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || ""),
        metaDescription: blog.metaDescription || "",
        isPublished: blog.isPublished || false,
        imageUrl: blog.imageUrl || "",
        topic: blog.topic || ""
      });
    }
  }, [blog, reset]);

  // Removed redundant image rescue effect to trust backend-resolved URLs

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) return null;

  const onSubmit = (data: any) => {
    update({
      id,
      ...data,
      tags: data.tags.split(",").map((s: string) => s.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        toast({ title: "Changes Saved", description: "The blog post has been successfully updated." });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this blog?")) {
      remove(id, {
        onSuccess: () => setLocation("/blogs"),
      });
    }
  };

  const handleSchedule = () => {
    if (!scheduleForm.siteId) {
      toast({ title: "Select a site", description: "Please select a destination site first.", variant: "destructive" });
      return;
    }
    if (!scheduleForm.scheduledAt) {
      toast({ title: "Pick a date & time", description: "Please select when to schedule this post.", variant: "destructive" });
      return;
    }
    const scheduledDate = new Date(scheduleForm.scheduledAt);
    if (scheduledDate <= new Date()) {
      toast({ title: "Invalid time", description: "Scheduled time must be in the future.", variant: "destructive" });
      return;
    }

    createScheduled(
      {
        blogId: id,
        siteId: Number(scheduleForm.siteId),
        scheduledAt: scheduledDate,
      },
      {
        onSuccess: () => {
          setScheduleForm({ siteId: "", scheduledAt: "" });
          toast({ title: "Post scheduled", description: "Your blog will be posted at the selected time." });
        },
        onError: () => {
          toast({ title: "Schedule failed", description: "Could not schedule this post.", variant: "destructive" });
        },
      }
    );
  };

  const handleRegenerateImage = async () => {
    if (!currentTitle) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/blogs/${id}/regenerate-image`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: currentTitle })
      });
      if (!res.ok) throw new Error("Failed to regenerate");
      
      const updated = await res.json();
      // CRITICAL: Update form state to reflect new image and set dirty
      setValue("imageUrl", updated.imageUrl, { shouldDirty: true });
      
      // Invalidate queries to update dashboard
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.blogs.get.path, id] });
      
      toast({ title: "Featured Image Updated", description: "Successfully refreshed the visuals based on current title." });
    } catch (error) {
      toast({ title: "Image Sync Failed", description: "Could not fetch new featured visual.", variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateFull = async () => {
    if (!currentTitle) return;
    setIsRegeneratingFull(true);
    try {
      const res = await fetch(`/api/blogs/${id}/regenerate-full`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: currentTitle })
      });
      if (!res.ok) throw new Error("Failed to regenerate full content");
      
      const updatedBlog = await res.json();
      
      // CRITICAL: Update form state and set dirty to enable Save button
      setValue("content", updatedBlog.content, { shouldDirty: true });
      setValue("tags", updatedBlog.tags ? updatedBlog.tags.join(", ") : "", { shouldDirty: true });
      setValue("metaDescription", updatedBlog.metaDescription || currentTitle, { shouldDirty: true });
      setValue("imageUrl", updatedBlog.imageUrl, { shouldDirty: true });
      setValue("topic", updatedBlog.topic || "", { shouldDirty: true });

      // Invalidate queries to update dashboard
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.blogs.get.path, id] });

      toast({ 
        title: "Portfolio Refreshed", 
        description: "Full content and high-density visuals have been synchronized." 
      });
    } catch (error) {
      toast({ title: "Regeneration Failed", description: "OpenAI quota reached or network error.", variant: "destructive" });
    } finally {
      setIsRegeneratingFull(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-5 border-b border-border/50 -mx-6 px-8 transition-all">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/blogs")} className="h-10 w-10 hover:bg-secondary rounded-xl">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-display font-extrabold text-foreground tracking-tight">Edit Blog</h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time synchronization active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocation(`/blogs/${id}/view`)} className="rounded-xl bg-background shadow-sm">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl opacity-80 hover:opacity-100">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isSaving} 
            className={`rounded-xl px-8 font-bold shadow-xl transition-all ${isDirty ? 'shadow-primary/25 opacity-100' : 'opacity-100 grayscale-0'}`}
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="title" className="text-base text-muted-foreground/80 font-semibold px-1">Blog Title</Label>
                  <Input 
                    id="title"
                    {...register("title")}
                    className="text-lg font-display font-bold py-7 bg-background/50 border-border/50 focus:ring-primary/20 transition-all rounded-xl shadow-inner-sm"
                    placeholder="Enter a compelling title..."
                  />
                </div>
                <Button 
                  onClick={handleRegenerateFull}
                  disabled={isRegeneratingFull || !currentTitle}
                  className="h-14 px-6 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:shadow-lg hover:shadow-primary/20 transition-all group shrink-0"
                >
                  {isRegeneratingFull ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  )}
                  <span className="ml-2 hidden sm:inline">Update All from Title</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2 relative">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="content" className="text-base text-muted-foreground/80 font-semibold">Content</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                  className={`text-[10px] uppercase tracking-widest font-bold h-7 rounded-lg gap-2 ${showPreview ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                >
                  {showPreview ? <><Type className="w-3.5 h-3.5" /> Source Code</> : <><Eye className="w-3.5 h-3.5" /> Live Preview</>}
                </Button>
              </div>
              
              <div className="relative group/editor">
                {!showPreview ? (
                  <Textarea 
                    id="content"
                    {...register("content")}
                    className="min-h-[600px] font-mono text-sm leading-relaxed p-6 bg-background/50 border-border/50 focus:ring-primary/20 transition-all rounded-xl resize-none"
                    placeholder="Write your blog content here..."
                  />
                ) : (
                  <div className="min-h-[600px] p-8 bg-white/80 rounded-xl border border-border/50 overflow-auto prose prose-slate max-w-none shadow-inner-sm">
                    <div 
                      className="blog-preview-content"
                      dangerouslySetInnerHTML={{ 
                        __html: (watch("content") || "")
                      }} 
                    />
                  </div>
                )}
                
                {isRegeneratingFull && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[4px] rounded-xl flex items-center justify-center z-10 transition-all duration-300">
                    <div className="bg-background/95 border border-border/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
                      <div className="relative">
                        <Wand2 className="w-12 h-12 text-primary animate-pulse" />
                        <div className="absolute -inset-2 bg-primary/30 blur-xl rounded-full animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-lg font-bold tracking-tight text-foreground">Synchronizing Rich Content</span>
                        <span className="text-xs text-muted-foreground font-mono mt-1 italic max-w-[200px]">Optimizing structure and imagery...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] tracking-wider uppercase font-bold text-muted-foreground/40 text-right px-2 italic">Markdown & HTML Supported</p>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Featured Image
            </h3>
            
            <div className="aspect-video rounded-xl bg-secondary/30 overflow-hidden border border-border/50 relative group">
              {currentImageUrl ? (
                <img 
                  src={currentImageUrl || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200"}
                  alt={currentTitle} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              
              {(isRegenerating || isRegeneratingFull) && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-10 animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                      <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    </div>
                    <span className="text-[11px] font-bold text-primary tracking-widest uppercase animate-pulse text-center px-6">Fetching Visuals...</span>
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={handleRegenerateImage}
              disabled={isRegenerating || isRegeneratingFull || !currentTitle}
              className="w-full bg-background/50 hover:bg-secondary border-dashed border-2 rounded-xl h-11 transition-all"
            >
              {isRegenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 mr-2" />
              )}
              Regenerate Featured Image
            </Button>
            <p className="text-[10px] text-muted-foreground/60 text-center px-4 leading-tight italic">
              Uses high-quality search algorithms to find the most relevant cover image.
            </p>
          </div>

          {/* Publishing Settings */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Distribution
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/30">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Public Status</Label>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Visibility Toggle</p>
                </div>
                <Switch 
                  checked={watch("isPublished")}
                  onCheckedChange={(checked) => setValue("isPublished", checked, { shouldDirty: true })}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-primary" />
                  Topic / Category (Card Tag)
                </Label>
                <Input 
                  {...register("topic")} 
                  placeholder="e.g. Technology, Real Estate..." 
                  className="bg-background/50 h-9 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Tags className="w-3.5 h-3.5 text-primary" />
                  Tags (Comma separated)
                </Label>
                <Input 
                  {...register("tags")} 
                  placeholder="SEO, AI, Future..." 
                  className="bg-background/50 h-9 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Schedule Queue</Label>
                <div className="grid gap-4 bg-secondary/20 p-4 rounded-xl border border-border/30">
                  <div className="space-y-2">
                    <Label htmlFor="site-select">Destination Site</Label>
                    <Select
                      value={scheduleForm.siteId}
                      onValueChange={(val) => setScheduleForm(prev => ({ ...prev, siteId: val }))}
                    >
                      <SelectTrigger id="site-select" className="bg-background/50">
                        <SelectValue placeholder="Select site..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sites?.map((site) => (
                          <SelectItem key={site.id} value={String(site.id)}>
                            <span className="flex items-center gap-2">
                              {site.siteName}
                              <span className="text-[10px] text-muted-foreground uppercase">({site.siteType})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Broadcast Time</Label>
                    <Input
                      id="schedule-time"
                      type="datetime-local"
                      value={scheduleForm.scheduledAt}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="bg-background/50"
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    />
                  </div>

                  <Button
                    onClick={handleSchedule}
                    disabled={isScheduling}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all rounded-xl"
                  >
                    <CalendarClock className="w-4 h-4 mr-2" />
                    {isScheduling ? "Processing..." : "Schedule Post"}
                  </Button>
                </div>
              </div>

              {/* Scheduled List */}
              {scheduledForThisBlog.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Scheduled Jobs</Label>
                  <div className="space-y-2">
                    {scheduledForThisBlog.map((post) => {
                      const site = sites?.find(s => s.id === post.siteId);
                      return (
                        <div key={post.id} className="flex items-center justify-between bg-secondary/40 rounded-lg p-3 border border-border/20">
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-sm font-bold truncate">{site?.siteName ?? "Remote Site"}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                              <Clock className="w-3 h-3" />
                              {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                            </div>
                            <span className={`text-[10px] font-bold uppercase mt-1 ${post.status === "posted" ? "text-emerald-500" : post.status === "failed" ? "text-destructive" : "text-amber-500"}`}>
                              {post.status}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteScheduled(post.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* External Preview */}
          <div className="bg-gradient-to-br from-indigo-500/5 to-primary/5 rounded-2xl border border-primary/10 p-6 space-y-4">
            <h4 className="font-display font-bold text-primary flex items-center gap-2">
              <Eye className="w-4 h-4" /> Final Audit
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              Review exactly how your content appears to global visitors before finalizing changes.
            </p>
            <Button
              variant="outline"
              className="w-full bg-background/50 hover:bg-background border-primary/20 text-primary rounded-xl transition-all"
              onClick={() => window.open(`/api/blogs/preview/${id}`, '_blank')}
            >
              Preview on Live Engine
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
