import { useState } from "react";
import { useSites, useCreateSite, useUpdateSite, useDeleteSite, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { useBlogs } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Link as LinkIcon, CheckCircle2, Clock, Plug, Pencil, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: blogs, isLoading: blogsLoading } = useBlogs();
  const { data: scheduled, isLoading: scheduledLoading } = useScheduledPosts();
  const { mutate: createSite, isPending: isCreatingSite } = useCreateSite();
  const { mutate: updateSite, isPending: isUpdatingSite } = useUpdateSite();
  const { mutate: deleteSite, isPending: isDeletingSite } = useDeleteSite();
  const { mutate: createScheduled, isPending: isCreatingScheduled } = useCreateScheduledPost();
  const { mutate: deleteScheduled, isPending: isDeletingScheduled } = useDeleteScheduledPost();
  const { toast } = useToast();
  const [testingSiteId, setTestingSiteId] = useState<number | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
  const [editCredentials, setEditCredentials] = useState({ username: "", password: "" });

  const startEditing = (site: { id: number; username: string | null; password: string | null }) => {
    setEditingSiteId(site.id);
    setEditCredentials({ username: site.username ?? "", password: site.password ?? "" });
  };

  const saveCredentials = (siteId: number) => {
    if (!editCredentials.password.trim()) {
      toast({ title: "Error", description: "Token / Password cannot be empty", variant: "destructive" });
      return;
    }
    updateSite(
      { id: siteId, data: { username: editCredentials.username.trim(), password: editCredentials.password.trim() } },
      {
        onSuccess: () => {
          toast({ title: "Credentials updated", description: "Saved successfully. Click Test to verify." });
          setEditingSiteId(null);
        },
        onError: (err: any) => {
          toast({ title: "Update failed", description: err?.message ?? "Unknown error", variant: "destructive" });
        },
      }
    );
  };

  const testConnection = async (siteId: number) => {
    setTestingSiteId(siteId);
    try {
      const data = await apiRequest("POST", `/api/external-sites/${siteId}/test`) as { message: string };
      toast({ title: "Connection Successful", description: data.message });
    } catch (err: any) {
      const msg = err?.message ?? "Connection failed";
      toast({ title: "Connection Failed", description: msg, variant: "destructive" });
    } finally {
      setTestingSiteId(null);
    }
  };

  const [siteForm, setSiteForm] = useState({
    siteName: "",
    siteType: "wordpress",
    siteUrl: "",
    username: "",
    password: "",
    isEnabled: true,
  });

  const [scheduleForm, setScheduleForm] = useState({
    blogId: "",
    siteId: "",
    scheduledAt: "",
  });

  const handleAddSite = () => {
    if (!siteForm.siteName || !siteForm.siteUrl || !siteForm.username || !siteForm.password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    createSite(
      {
        siteName: siteForm.siteName,
        siteType: siteForm.siteType,
        siteUrl: siteForm.siteUrl,
        username: siteForm.username,
        password: siteForm.password,
        isEnabled: siteForm.isEnabled,
      },
      {
        onSuccess: () => {
          setSiteForm({ siteName: "", siteType: "wordpress", siteUrl: "", username: "", password: "", isEnabled: true });
          toast({ title: "Success", description: "Site added successfully" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add site", variant: "destructive" });
        },
      }
    );
  };

  const handleSchedulePost = () => {
    if (!scheduleForm.blogId || !scheduleForm.siteId || !scheduleForm.scheduledAt) {
      toast({ title: "Error", description: "Please select blog, site, and schedule time", variant: "destructive" });
      return;
    }

    createScheduled(
      {
        blogId: Number(scheduleForm.blogId),
        siteId: Number(scheduleForm.siteId),
        scheduledAt: new Date(scheduleForm.scheduledAt),
      },
      {
        onSuccess: () => {
          setScheduleForm({ blogId: "", siteId: "", scheduledAt: "" });
          toast({ title: "Success", description: "Post scheduled successfully" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to schedule post", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage external sites and schedule blog posts</p>
      </div>

      {/* External Sites Section */}
      <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
        <div className="border-b border-border/50 pb-4">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-primary" />
            External Sites
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Add websites where you want to auto-post your blogs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              placeholder="My WordPress Blog"
              value={siteForm.siteName}
              onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteType">Site Type</Label>
            <Select value={siteForm.siteType} onValueChange={(val) => setSiteForm({ ...siteForm, siteType: val })}>
              <SelectTrigger id="siteType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wordpress">WordPress</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="custom">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">Website URL</Label>
            <Input
              id="siteUrl"
              placeholder="https://myblog.com"
              value={siteForm.siteUrl}
              onChange={(e) => setSiteForm({ ...siteForm, siteUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              placeholder="admin@example.com"
              value={siteForm.username}
              onChange={(e) => setSiteForm({ ...siteForm, username: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password / API Key</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={siteForm.password}
              onChange={(e) => setSiteForm({ ...siteForm, password: e.target.value })}
            />
          </div>

          <div className="space-y-2 flex items-end">
            <div className="flex items-center gap-3 w-full">
              <Switch
                checked={siteForm.isEnabled}
                onCheckedChange={(checked) => setSiteForm({ ...siteForm, isEnabled: checked })}
              />
              <Label className="text-sm cursor-pointer">Enabled</Label>
            </div>
          </div>
        </div>

        <Button onClick={handleAddSite} disabled={isCreatingSite} className="w-full shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingSite ? "Adding..." : "Add Site"}
        </Button>

        {sitesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          </div>
        ) : sites && sites.length > 0 ? (
          <div className="space-y-3 pt-4">
            {sites.map((site) => (
              <div key={site.id} className="bg-secondary/30 rounded-lg border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{site.siteName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="truncate max-w-[180px]">{site.siteUrl}</span>
                      <span>•</span>
                      <span className="uppercase font-medium">{site.siteType}</span>
                      {site.isEnabled ? (
                        <>
                          <span>•</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Enabled</span>
                        </>
                      ) : <span className="text-muted-foreground/60">Disabled</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editingSiteId === site.id ? setEditingSiteId(null) : startEditing(site)}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      data-testid={`button-edit-site-${site.id}`}
                    >
                      {editingSiteId === site.id ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      {editingSiteId === site.id ? "Cancel" : "Edit"}
                    </Button>
                    {(site.siteType === "medium" || site.siteType === "wordpress" || site.siteType === "ghost") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testConnection(site.id)}
                        disabled={testingSiteId === site.id}
                        className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        data-testid={`button-test-site-${site.id}`}
                      >
                        <Plug className="w-3.5 h-3.5" />
                        {testingSiteId === site.id ? "Testing..." : "Test"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSite(site.id)}
                      disabled={isDeletingSite}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      data-testid={`button-delete-site-${site.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingSiteId === site.id && (
                  <div className="border-t border-border/50 bg-background/50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Update Credentials</p>
                    {site.siteType === "medium" && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                        Medium requires an <strong>Integration Token</strong> — not your login password.<br />
                        Get it at: <strong>medium.com → Settings → Security and apps → Integration tokens</strong>
                      </p>
                    )}
                    {site.siteType !== "medium" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Username</Label>
                        <Input
                          value={editCredentials.username}
                          onChange={(e) => setEditCredentials({ ...editCredentials, username: e.target.value })}
                          placeholder="Username"
                          className="h-8 text-sm"
                          data-testid={`input-edit-username-${site.id}`}
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {site.siteType === "medium" ? "Integration Token" : site.siteType === "ghost" ? "Admin API Key (id:secret)" : "Application Password"}
                      </Label>
                      <Input
                        type="password"
                        value={editCredentials.password}
                        onChange={(e) => setEditCredentials({ ...editCredentials, password: e.target.value })}
                        placeholder={site.siteType === "medium" ? "Paste your Integration Token here..." : site.siteType === "ghost" ? "id:secret" : "App password"}
                        className="h-8 text-sm font-mono"
                        data-testid={`input-edit-password-${site.id}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {editCredentials.password.trim().length > 0 && `${editCredentials.password.trim().length} characters`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveCredentials(site.id)}
                      disabled={isUpdatingSite}
                      className="w-full"
                      data-testid={`button-save-credentials-${site.id}`}
                    >
                      {isUpdatingSite ? "Saving..." : "Save & Close"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No sites configured yet. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* Schedule Posts Section */}
      <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
        <div className="border-b border-border/50 pb-4">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Schedule Blog Posts
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Schedule your blogs to be posted to external sites</p>
        </div>

        {!sites || sites.length === 0 ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Add external sites first before scheduling posts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="selectBlog">Select Blog</Label>
              <Select value={scheduleForm.blogId} onValueChange={(val) => setScheduleForm({ ...scheduleForm, blogId: val })}>
                <SelectTrigger id="selectBlog">
                  <SelectValue placeholder="Choose a blog..." />
                </SelectTrigger>
                <SelectContent>
                  {blogs?.map((blog) => (
                    <SelectItem key={blog.id} value={String(blog.id)}>
                      {blog.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectSite">Select Site</Label>
              <Select value={scheduleForm.siteId} onValueChange={(val) => setScheduleForm({ ...scheduleForm, siteId: val })}>
                <SelectTrigger id="selectSite">
                  <SelectValue placeholder="Choose a site..." />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={String(site.id)}>
                      {site.siteName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
              />
            </div>
          </div>
        )}

        {sites && sites.length > 0 && (
          <Button onClick={handleSchedulePost} disabled={isCreatingScheduled} className="w-full shadow-lg shadow-primary/20">
            <Calendar className="w-4 h-4 mr-2" />
            {isCreatingScheduled ? "Scheduling..." : "Schedule Post"}
          </Button>
        )}

        {scheduledLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          </div>
        ) : scheduled && scheduled.length > 0 ? (
          <div className="space-y-3 pt-4">
            {scheduled.map((post) => {
              const blog = blogs?.find((b) => b.id === post.blogId);
              const site = sites?.find((s) => s.id === post.siteId);
              return (
                <div key={post.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{blog?.title || "Unknown Blog"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>→ {site?.siteName || "Unknown Site"}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(post.scheduledAt), "MMM d, yyyy h:mm a")}</span>
                      <span>•</span>
                      <span className={post.status === "posted" ? "text-emerald-600" : post.status === "failed" ? "text-destructive font-semibold" : "text-amber-600"}>
                        {post.status.toUpperCase()}
                      </span>
                    </div>
                    {post.status === "failed" && (post as any).errorMessage && (
                      <p className="text-xs text-destructive/80 mt-1">{(post as any).errorMessage}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScheduled(post.id)}
                    disabled={isDeletingScheduled}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No scheduled posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
