import { useState } from "react";
import { useSites, useCreateSite, useUpdateSite, useDeleteSite, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { useBlogs } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Link as LinkIcon, CheckCircle2, Clock, Plug, Pencil, X, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Loader } from "@/components/Loader";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      const res = await apiRequest("POST", `/api/external-sites/${siteId}/test`);
      const data = await res.json() as { message: string };
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
    const isEmbed = siteForm.siteType === "embed_widget";
    if (!siteForm.siteName || !siteForm.siteUrl || (!isEmbed && (!siteForm.username || !siteForm.password))) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createSite(
      {
        siteName: siteForm.siteName,
        siteType: siteForm.siteType,
        siteUrl: siteForm.siteUrl,
        username: isEmbed ? "n/a" : siteForm.username,
        password: isEmbed ? "n/a" : siteForm.password,
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-5xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight pb-2">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Manage external sites and schedule blog posts</p>
      </motion.div>

      {/* External Sites Section */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-8 space-y-6">
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
              className="bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-inner focus-visible:ring-primary h-12 rounded-xl text-base transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteType">Site Type</Label>
            <Select value={siteForm.siteType} onValueChange={(val) => setSiteForm({ ...siteForm, siteType: val })}>
              <SelectTrigger id="siteType" className="bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-inner h-12 rounded-xl text-base focus:ring-primary transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wordpress">WordPress</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="embed_widget">Embed Widget (External Feed)</SelectItem>
                <SelectItem value="custom">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {siteForm.siteType === "wordpress" ? (
            <div className="col-span-1 md:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/10 border border-blue-200/60 dark:border-blue-800/50 rounded-2xl p-8 text-center space-y-5 shadow-inner">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold font-display text-blue-900 dark:text-blue-100">Connect Your WordPress.com Blog</h3>
              <p className="text-sm font-medium text-blue-800/80 dark:text-blue-300">
                Authorize AutoBlog.ai to automatically publish posts to your free WordPress.com site.
              </p>
              <Button
                onClick={() => {
                  const WP_CLIENT_ID = "135690";
                  const WP_REDIRECT_URI = "http://localhost:5000/api/wordpress/callback";
                  const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${WP_CLIENT_ID}&redirect_uri=${encodeURIComponent(WP_REDIRECT_URI)}&response_type=code`;
                  window.location.href = authUrl;
                }}
                className="bg-gradient-to-r from-[#0087be] to-[#005a80] hover:shadow-[0_0_20px_rgba(0,135,190,0.4)] transition-all text-white px-8 py-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 mx-auto shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.05-.18 2.986-.51-.024-.037-.046-.078-.065-.123l-2.763-8.082V12.786M4.545 15.698c0-1.875.568-3.078 1.137-4.102.568-.91.966-1.536.966-2.5 0-1.138-.853-2.162-2.046-2.162h-.057A9.855 9.855 0 0 0 2.05 12c0 2.628 1.026 5.016 2.69 6.786l2.083-6.046c-.225-.453-.45-.984-.45-1.54M17.02 10.648c0 1.48-.342 2.787-.796 3.98l-3.23 9.096A9.97 9.97 0 0 0 21.95 12c0-4.11-2.484-7.644-6.096-9.15.568 1.08.91 2.33.91 3.58.002.855-.17 1.706-.512 2.484.455.454.767 1.08.767 1.734m-4.862-8.52A9.957 9.957 0 0 0 12 2C6.48 2 2 6.48 2 12c0 .285.013.565.035.845.82-.46 2.088-1.597 2.088-1.597.23-.17.172-.51-.113-.51h-.967c1.196-4.557 5.35-7.97 10.32-7.97 1.63 0 3.176.388 4.544 1.077l-1.65 4.383-4.1-3.628z"/>
                </svg>
                Connect with WordPress
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">{siteForm.siteType === "embed_widget" ? "Allowed Domain URL" : "Website URL"}</Label>
                <Input
                  id="siteUrl"
                  placeholder={siteForm.siteType === "embed_widget" ? "https://my-friend-site.com" : "https://myblog.com"}
                  value={siteForm.siteUrl}
                  onChange={(e) => setSiteForm({ ...siteForm, siteUrl: e.target.value })}
                  className="bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-inner focus-visible:ring-primary h-12 rounded-xl text-base transition-all"
                />
              </div>

              {siteForm.siteType !== "embed_widget" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / Email</Label>
                    <Input
                      id="username"
                      placeholder="admin@example.com"
                      value={siteForm.username}
                      onChange={(e) => setSiteForm({ ...siteForm, username: e.target.value })}
                      className="bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-inner focus-visible:ring-primary h-12 rounded-xl text-base transition-all"
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
                      className="bg-white/50 dark:bg-black/20 border-white/40 dark:border-white/10 shadow-inner focus-visible:ring-primary h-12 rounded-xl text-base transition-all"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-3 w-full pb-2">
                  <Switch
                    checked={siteForm.isEnabled}
                    onCheckedChange={(checked) => setSiteForm({ ...siteForm, isEnabled: checked })}
                  />
                  <Label className="text-sm cursor-pointer">Enabled</Label>
                </div>
              </div>
            </>
          )}
        </div>

        {siteForm.siteType !== "wordpress" && (
          <Button onClick={handleAddSite} disabled={isCreatingSite} className="w-full shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity h-14 rounded-2xl text-lg font-bold text-white hover:-translate-y-0.5">
            <Plus className="w-5 h-5 mr-3" />
            {isCreatingSite ? "Adding..." : "Add Site"}
          </Button>
        )}

        {sitesLoading ? (
          <Loader className="min-h-[200px]" />
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
                      {site.password === "provide_token_in_ui" && (
                        <>
                          <span>•</span>
                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/50 flex items-center gap-1">
                            <Plug className="w-2.5 h-2.5" />
                            DEMO MODE
                          </span>
                        </>
                      )}
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
                    {(site.siteType === "medium" || site.siteType === "wordpress" || site.siteType === "ghost" || site.siteType === "linkedin") && (
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
                    {site.siteType === "embed_widget" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Get Snippet
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-slate-50 dark:bg-slate-900 border-none shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-display font-black text-slate-900 dark:text-slate-50">Embed Widget Snippet</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shrink-0">
                                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-sm text-blue-800/80 dark:text-blue-300 leading-relaxed">
                                Copy and paste this code into your external website's HTML where you want the feed to appear.
                                <br />
                                <span className="font-bold">Important:</span> This will only work on <code className="bg-blue-100 dark:bg-blue-800/50 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-200">{site.siteUrl}</code>.
                              </p>
                            </div>

                            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
                              <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">HTML Snippet</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs font-bold text-primary hover:bg-primary/10 transition-all gap-2"
                                  onClick={() => {
                                    const code = `<div id="autoblog-feed" class="autoblog-feed-container"></div>
<script>
  fetch('${window.location.origin}/api/v1/feed/${site.clientId}')
    .then(res => res.json())
    .then(blogs => {
      const container = document.getElementById('autoblog-feed');
      blogs.forEach(blog => {
        container.innerHTML += \`
          <article class="autoblog-post" style="margin-bottom: 2rem;">
            <h2 class="autoblog-title" style="margin-bottom: 0.5rem; font-size: 1.5rem;">\${blog.title}</h2>
            \${blog.imageUrl ? \`<img class="autoblog-thumbnail" src="\${blog.imageUrl}" alt="\${blog.title}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;" loading="lazy" />\` : ''}
            <div class="autoblog-content" style="line-height: 1.6;">\${blog.content}</div>
          </article>
          <hr class="autoblog-divider" style="border: 0; border-top: 1px solid #eee; margin: 2rem 0;" />\`;
      });
    }).catch(err => console.error("AutoBlog Widget Error:", err));
</script>`;
                                    navigator.clipboard.writeText(code);
                                    toast({ title: "Copied!", description: "Snippet copied to clipboard" });
                                  }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Copy Code
                                </Button>
                              </div>
                              <div className="bg-[#0d1117] p-6 overflow-x-auto">
                                <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300 whitespace-pre">
{`<div id="autoblog-feed" class="autoblog-feed-container"></div>
<script>
  fetch('${window.location.origin}/api/v1/feed/${site.clientId}')
    .then(res => res.json())
    .then(blogs => {
      const container = document.getElementById('autoblog-feed');
      blogs.forEach(blog => {
        container.innerHTML += \`
          <article class="autoblog-post" style="margin-bottom: 2rem;">
            <h2 class="autoblog-title">\${blog.title}</h2>
            \${blog.imageUrl ? \`<img class="autoblog-thumbnail" src="\${blog.imageUrl}" ... />\` : ''}
            <div class="autoblog-content">\${blog.content}</div>
          </article>
          <hr class="autoblog-divider" />\`;
      });
    }).catch(err => console.error("AutoBlog Widget Error:", err));
</script>`}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                    {site.siteType === "linkedin" && (
                      <p className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
                        LinkedIn requires an <strong>Access Token</strong>.<br />
                        Get one at: <strong>linkedin.com/developers</strong> → create an app → Products → "Share on LinkedIn" → OAuth 2.0 Tools → generate a token with <code>w_member_social</code> scope.
                      </p>
                    )}
                    {site.siteType !== "medium" && site.siteType !== "linkedin" && (
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
                        {site.siteType === "medium" ? "Integration Token" : site.siteType === "linkedin" ? "Access Token" : site.siteType === "ghost" ? "Admin API Key (id:secret)" : "Application Password"}
                      </Label>
                      <Input
                        type="password"
                        value={editCredentials.password}
                        onChange={(e) => setEditCredentials({ ...editCredentials, password: e.target.value })}
                        placeholder={site.siteType === "medium" ? "Paste your Integration Token here..." : site.siteType === "linkedin" ? "Paste your LinkedIn Access Token here..." : site.siteType === "ghost" ? "id:secret" : "App password"}
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
      </motion.div>

      {/* Schedule Posts Section */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-8 space-y-6">
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
          <Button onClick={handleSchedulePost} disabled={isCreatingScheduled} className="w-full shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity h-14 rounded-2xl text-lg font-bold text-white hover:-translate-y-0.5">
            <Calendar className="w-5 h-5 mr-3" />
            {isCreatingScheduled ? "Scheduling..." : "Schedule Post"}
          </Button>
        )}

        {scheduledLoading ? (
          <Loader className="min-h-[200px]" />
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
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-xs text-destructive/80 line-clamp-1 max-w-[200px] md:max-w-[400px]">
                          {(post as any).errorMessage}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 py-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-white shrink-0">
                              View Error
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-destructive flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Publishing Failed
                              </DialogTitle>
                            </DialogHeader>
                            <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-xs font-mono whitespace-pre-wrap break-all text-destructive">
                              {(post as any).errorMessage}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScheduled(post.id)}
                    disabled={isDeletingScheduled}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
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
      </motion.div>
    </motion.div>
  );
}
