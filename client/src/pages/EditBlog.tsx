import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-blogs";
import { useSites, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Save, Trash2, Eye, Globe, CalendarClock, Clock, CheckCircle2, X } from "lucide-react";
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

  const { data: sites } = useSites();
  const { data: allScheduled } = useScheduledPosts();
  const { mutate: createScheduled, isPending: isScheduling } = useCreateScheduledPost();
  const { mutate: deleteScheduled } = useDeleteScheduledPost();

  const scheduledForThisBlog = allScheduled?.filter((s) => s.blogId === id) ?? [];

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    metaDescription: "",
    isPublished: false,
    tags: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    siteId: "",
    scheduledAt: "",
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

  const handleSchedule = () => {
    if (!scheduleForm.siteId) {
      toast({ title: "Select a site", description: "Please choose an external site to post to.", variant: "destructive" });
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b border-border/50 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/blogs")} data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-bold text-foreground">Edit Blog</h1>
            <span className="text-xs text-muted-foreground">Last saved: {format(new Date(), "h:mm a")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} data-testid="button-delete">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-primary/20" data-testid="button-save">
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
                data-testid="input-title"
                value={formData.title} 
                onChange={e => handleChange("title", e.target.value)}
                className="text-lg font-display font-bold py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-base">Content</Label>
              <Textarea 
                id="content"
                data-testid="input-content"
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
          {/* Publishing */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
            <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-4">Publishing</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Published Status</Label>
                <p className="text-xs text-muted-foreground">Visible to the public</p>
              </div>
              <Switch 
                data-testid="switch-published"
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
                    data-testid="input-slug"
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
                  data-testid="input-meta"
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
                  data-testid="input-tags"
                  value={formData.tags}
                  onChange={e => handleChange("tags", e.target.value)}
                  placeholder="tech, ai, future..."
                />
              </div>
            </div>
          </div>

          {/* Schedule Post */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-5">
            <h3 className="font-display font-semibold text-lg border-b border-border/50 pb-4 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              Schedule Post
            </h3>

            {!sites || sites.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  No external sites configured. Go to <button className="underline font-medium" onClick={() => setLocation("/settings")}>Settings</button> to add sites first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-site">Website</Label>
                  <Select
                    value={scheduleForm.siteId}
                    onValueChange={(val) => setScheduleForm(prev => ({ ...prev, siteId: val }))}
                  >
                    <SelectTrigger id="schedule-site" data-testid="select-schedule-site">
                      <SelectValue placeholder="Select a site..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.filter(s => s.isEnabled).map((site) => (
                        <SelectItem key={site.id} value={String(site.id)} data-testid={`option-site-${site.id}`}>
                          <span className="flex items-center gap-2">
                            {site.siteName}
                            <span className="text-xs text-muted-foreground uppercase">({site.siteType})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Date & Time</Label>
                  <Input
                    id="schedule-time"
                    data-testid="input-schedule-time"
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  />
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={isScheduling}
                  className="w-full shadow-lg shadow-primary/20"
                  data-testid="button-schedule"
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  {isScheduling ? "Scheduling..." : "Schedule Post"}
                </Button>
              </div>
            )}

            {/* Scheduled entries for this blog */}
            {scheduledForThisBlog.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scheduled</p>
                {scheduledForThisBlog.map((post) => {
                  const site = sites?.find(s => s.id === post.siteId);
                  return (
                    <div
                      key={post.id}
                      data-testid={`scheduled-item-${post.id}`}
                      className="flex items-center justify-between bg-secondary/30 rounded-lg border border-border/50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{site?.siteName ?? "Unknown Site"}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{format(new Date(post.scheduledAt), "MMM d, yyyy h:mm a")}</span>
                        </div>
                        <span className={`text-xs font-semibold mt-0.5 inline-block ${post.status === "posted" ? "text-emerald-600" : post.status === "failed" ? "text-destructive" : "text-amber-600"}`}>
                          {post.status === "posted" ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Posted</span>
                          ) : post.status === "failed" ? "⚠ FAILED" : post.status.toUpperCase()}
                        </span>
                        {post.status === "failed" && (post as any).errorMessage && (
                          <p className="text-xs text-destructive/80 mt-0.5 break-words">{(post as any).errorMessage}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                        onClick={() => deleteScheduled(post.id)}
                        data-testid={`button-delete-scheduled-${post.id}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              See how your blog post looks to visitors before publishing.
            </p>
            <Button
              variant="outline"
              className="w-full bg-background"
              onClick={() => window.open(`/api/blogs/preview/${id}`, '_blank')}
              data-testid="button-preview"
            >
              Open Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
