import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/use-blogs";
import { useSites, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { api } from "@shared/routes";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { handleRegenerateImage, handleRegenerateFull } from "@/services/api/blogAPI";
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
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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

export default function EditBlog() {
  const [match, params] = useRoute("/blogs/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
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

  const backPath = isSuperAdmin ? "/superadmin/blogs" : "/blogs";

  const handleDelete = () => {
    remove(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Blog post has been removed." });
        setLocation(backPath);
      },
    });
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

  const handleRegenerateImageClick = async () => {
    if (!currentTitle) return;
    setIsRegenerating(true);
    const res = await handleRegenerateImage(id, currentTitle);
    if (res.success) {
      setValue("imageUrl", res.data.imageUrl, { shouldDirty: true });
      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.blogs.get.path, id] });
      toast({ title: "Featured Image Updated", description: "Successfully refreshed the visuals based on current title." });
    } else {
      toast({ title: "Image Sync Failed", description: res.error || "Could not fetch new featured visual.", variant: "destructive" });
    }
    setIsRegenerating(false);
  };

  const handleRegenerateFullClick = async () => {
    if (!currentTitle) return;
    setIsRegeneratingFull(true);
    const res = await handleRegenerateFull(id, currentTitle);
    if (res.success) {
      const updatedBlog = res.data;
      setValue("content", updatedBlog.content, { shouldDirty: true });
      setValue("tags", updatedBlog.tags ? updatedBlog.tags.join(", ") : "", { shouldDirty: true });
      setValue("metaDescription", updatedBlog.metaDescription || currentTitle, { shouldDirty: true });
      setValue("imageUrl", updatedBlog.imageUrl, { shouldDirty: true });
      setValue("topic", updatedBlog.topic || "", { shouldDirty: true });

      queryClient.invalidateQueries({ queryKey: [api.blogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.blogs.get.path, id] });

      toast({ 
        title: "Portfolio Refreshed", 
        description: "Full content and high-density visuals have been synchronized." 
      });
    } else {
      toast({ title: "Regeneration Failed", description: res.error || "OpenAI quota reached or network error.", variant: "destructive" });
    }
    setIsRegeneratingFull(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-plus-jakarta">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 bg-white dark:bg-neutral-950 py-4 md:py-6 border-b border-neutral-200 dark:border-neutral-800 -mx-4 px-4 md:-mx-8 md:px-12 transition-all">
        <div className="flex items-center gap-5">
          <Button variant="outline" size="icon" onClick={() => setLocation(backPath)} className="h-12 w-12 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 rounded-xl group transition-all shadow-sm">
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
              Edit <span className="text-orange-500">Blog Post</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs md:text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2 tracking-tight">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Live saving active
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-6 md:mt-0">
          <Button variant="ghost" onClick={() => setLocation(`/blogs/${id}/view`)} className="h-11 px-5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm md:text-base font-bold tracking-tight hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={isDeleting} className="h-11 px-5 rounded-xl text-sm md:text-base font-bold tracking-tight text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-4 md:p-8 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Delete Post?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 mt-2 font-medium tracking-tight">
                  Are you sure you want to delete <span className="text-orange-500 font-bold">"{blog.title}"</span>? This action is permanent and all associated content will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-6 gap-3">
                <AlertDialogCancel className="rounded-xl h-11 px-6 text-sm md:text-base font-bold tracking-tight bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border-none text-neutral-900 dark:text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6 text-sm md:text-base font-bold tracking-tight shadow-lg shadow-red-500/20"
                >
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isSaving} 
            className="flex-1 sm:flex-none h-11 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm md:text-base font-bold tracking-tight shadow-lg shadow-orange-500/20 transition-all border-none"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-0 sm:px-4">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="premium-card p-5 md:p-8 space-y-6 md:space-y-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-xl">
            <div className="space-y-3 focus-within:translate-x-1 transition-transform px-1 md:px-0">
              <Label htmlFor="title" className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white px-1 tracking-tight">Post Title</Label>
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                <Input 
                  id="title"
                  {...register("title")}
                  className="h-14 text-lg font-bold bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 transition-all rounded-xl px-5"
                  placeholder="Enter a compelling title..."
                />
                <Button 
                  onClick={handleRegenerateFullClick}
                  disabled={isRegeneratingFull || !currentTitle}
                  className="h-14 px-6 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shrink-0"
                >
                  {isRegeneratingFull ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  <span className="font-bold text-xs md:text-sm tracking-tight">Full Regenerate</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3 relative">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="content" className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">Blog Content</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                  className={`text-xs md:text-sm tracking-tight font-bold h-8 px-4 rounded-lg gap-2 transition-all ${showPreview ? "bg-orange-500 text-white" : "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"}`}
                >
                  {showPreview ? <><Type className="w-3.5 h-3.5" /> Editor</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
                </Button>
              </div>
              
              <div className="relative group px-1 md:px-0">
                {!showPreview ? (
                  <Textarea 
                    id="content"
                    {...register("content")}
                    className="min-h-[400px] md:min-h-[600px] text-sm md:text-base leading-relaxed p-5 md:p-6 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 transition-all rounded-2xl resize-none shadow-inner"
                    placeholder="Start writing your amazing content here..."
                  />
                ) : (
                  <div className="min-h-[400px] md:min-h-[600px] p-5 md:p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-auto prose prose-neutral dark:prose-invert prose-orange max-w-none shadow-sm">
                    <div 
                      className="blog-preview-content text-sm md:text-base"
                      dangerouslySetInnerHTML={{ 
                        __html: (watch("content") || "")
                      }} 
                    />
                  </div>
                )}
                
                {isRegeneratingFull && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40 transition-all duration-300">
                    <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
                      <Wand2 className="w-16 h-16 text-orange-500 animate-bounce" />
                      <div className="space-y-2">
                        <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Writing Excellence</span>
                        <p className="text-sm text-neutral-500 font-semiboldium tracking-tight">AI is currently refining your content and assets. This may take a moment.</p>
                      </div>
                      <div className="h-1.5 w-48 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          {/* Featured Image */}
          <div className="premium-card p-6 space-y-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-xl">
            <h3 className="font-bold text-xs md:text-sm tracking-wide text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              Featured Image
            </h3>
            
            <div className="aspect-video rounded-2xl bg-neutral-100 dark:bg-neutral-950 overflow-hidden border border-neutral-200 dark:border-white/10 relative group">
              {currentImageUrl ? (
                <img 
                  src={currentImageUrl}
                  alt={currentTitle} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              
              {(isRegenerating || isRegeneratingFull) && (
                <div className="absolute inset-0 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={handleRegenerateImageClick}
              disabled={isRegenerating || isRegeneratingFull || !currentTitle}
              className="w-full h-11 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-800 rounded-xl text-xs md:text-sm font-bold tracking-tight transition-colors shadow-sm text-neutral-900 dark:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Regenerate Image
            </Button>
          </div>

          {/* Publishing Settings */}
          <div className="premium-card p-6 space-y-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-xl">
            <h3 className="font-bold text-xs md:text-sm tracking-wide text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <Globe className="w-4 h-4 text-orange-500" />
              Post Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/10">
                <div className="space-y-0.5">
                  <Label className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">Publish Visibility</Label>
                  <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-tight">Visible to your audience</p>
                </div>
                <Switch 
                  checked={watch("isPublished")}
                  onCheckedChange={(checked) => setValue("isPublished", checked, { shouldDirty: true })}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mb-1 tracking-tight">
                  <Hash className="w-3.5 h-3.5 text-orange-500" />
                  Primary Topic
                </Label>
                <Input 
                  {...register("topic")} 
                  placeholder="e.g. Technology" 
                  className="bg-neutral-50 dark:bg-neutral-800 h-11 text-sm md:text-base rounded-xl border-neutral-200 dark:border-neutral-800 px-4 font-semibold text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mb-1 tracking-tight">
                  <Tags className="w-3.5 h-3.5 text-orange-500" />
                  Keywords
                </Label>
                <Input 
                  {...register("tags")} 
                  placeholder="AI, Innovation, SaaS" 
                  className="bg-neutral-50 dark:bg-neutral-800 h-11 text-sm md:text-base rounded-xl border-neutral-200 dark:border-neutral-800 px-4 font-semibold text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-4">
                  <Label className="text-xs md:text-sm font-semibold text-neutral-500 px-1 tracking-tight">Publisher Schedule</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-semibold text-neutral-400 tracking-tight px-1">Destination</p>
                      <Select
                        value={scheduleForm.siteId}
                        onValueChange={(val) => setScheduleForm(prev => ({ ...prev, siteId: val }))}
                      >
                         <SelectTrigger className="bg-neutral-50 dark:bg-neutral-800 h-11 rounded-xl border-neutral-200 dark:border-neutral-800 px-4 text-xs md:text-sm font-semibold tracking-tight">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl">
                          {sites?.map((site) => (
                            <SelectItem key={site.id} value={String(site.id)}>
                              <span className="font-semibold text-xs md:text-sm tracking-tight">{site.siteName}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-semibold text-neutral-400 tracking-tight px-1">Post Date & Time</p>
                      <Input
                        type="datetime-local"
                        value={scheduleForm.scheduledAt}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="bg-neutral-50 dark:bg-neutral-800 h-11 rounded-xl border-neutral-200 dark:border-neutral-800 px-4 text-sm md:text-base font-semibold text-neutral-900 dark:text-white"
                        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>

                   <Button
                    onClick={handleSchedule}
                    disabled={isScheduling}
                    className="w-full h-12 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm md:text-base tracking-tight shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                  >
                    <CalendarClock className="w-3.5 h-3.5 mr-2" />
                    Set Schedule
                  </Button>
                </div>
              </div>

              {/* Scheduled List */}
              {scheduledForThisBlog.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-white/5">
                  <Label className="text-xs md:text-sm font-bold tracking-wide text-neutral-400">Upcoming Posts</Label>
                  <div className="space-y-2">
                    {scheduledForThisBlog.map((post) => {
                      const site = sites?.find(s => s.id === post.siteId);
                      return (
                        <div key={post.id} className="flex items-center justify-between bg-white dark:bg-white/5 rounded-xl p-3 border border-neutral-200 dark:border-white/10 group">
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white truncate tracking-tight">{site?.siteName ?? "Remote Site"}</span>
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-neutral-500 tracking-tight">
                              <Clock className="w-3 h-3 text-orange-500" />
                              {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteScheduled(post.id)} className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg group-hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
