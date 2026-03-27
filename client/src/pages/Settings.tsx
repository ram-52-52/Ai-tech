import { useState } from "react";
import { useSites, useCreateSite, useUpdateSite, useDeleteSite, useScheduledPosts, useCreateScheduledPost, useDeleteScheduledPost } from "@/hooks/use-sites";
import { useBlogs } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Link as LinkIcon, CheckCircle2, Clock, Plug, Pencil, X, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/hooks/use-auth";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { handleTestConnection } from "@/services/api/settingsAPI";

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
  const { user } = useAuth();
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
    const res = await handleTestConnection(siteId);
    if (res.success) {
      toast({ title: "Connection Successful", description: res.data.message });
    } else {
      toast({ title: "Connection Failed", description: res.error || "Connection failed", variant: "destructive" });
    }
    setTestingSiteId(null);
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

  if (sitesLoading || blogsLoading || scheduledLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <SEO title="Settings" />
        <Skeleton className="h-20 w-3/4 rounded-3xl" />
        <div className="premium-card rounded-[2.5rem] p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta"
    >
      <SEO
        title="Platform Settings | AI TECH"
        description="Configure your external CMS connections and automate your blog publishing schedule."
      />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-10 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group transition-all">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <Plug className="w-3.5 h-3.5" /> Connection Hub
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Platform <span className="text-orange-500">Settings</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium font-semibold leading-relaxed tracking-tight">
            Synchronize your external platforms, configure secure CMS integrations, and orchestrate your automated publishing workflow from one central dashboard.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* External Sites Section */}
        <div className="premium-card p-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] shadow-xl space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/5">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Connected Platforms</h2>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide">Distribute your content to global networks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Site Name</Label>
              <Input
                placeholder="e.g. Corporate Blog"
                value={siteForm.siteName}
                onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-orange-500/20 transition-all text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Integration Type</Label>
              <Select value={siteForm.siteType} onValueChange={(val) => setSiteForm({ ...siteForm, siteType: val })}>
                <SelectTrigger className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-0 focus:border-orange-500/20 transition-all text-neutral-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <SelectItem value="wordpress" className="font-semibold text-xs md:text-sm py-3">WordPress</SelectItem>
                  <SelectItem value="medium" className="font-semibold text-xs md:text-sm py-3">Medium</SelectItem>
                  <SelectItem value="linkedin" className="font-semibold text-xs md:text-sm py-3">LinkedIn</SelectItem>
                  <SelectItem value="ghost" className="font-semibold text-xs md:text-sm py-3">Ghost</SelectItem>
                  <SelectItem value="embed_widget" className="font-semibold text-xs md:text-sm py-3">Embed Widget</SelectItem>
                  <SelectItem value="custom" className="font-semibold text-xs md:text-sm py-3">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {siteForm.siteType === "wordpress" ? (
              <div className="col-span-1 md:col-span-2 relative overflow-hidden bg-orange-500/5 border border-orange-500/10 rounded-3xl p-10 text-center space-y-6">
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none" />
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">WordPress Direct Link</h3>
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed tracking-tight">
                  Authorize <span className="text-orange-500 font-bold">AI TECH</span> to automatically publish high-fidelity blogs directly to your WordPress site.
                </p>
                <Button
                  onClick={() => {
                    const WP_CLIENT_ID = "135690";
                    const WP_REDIRECT_URI = "http://localhost:5000/api/wordpress/callback";
                    const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${WP_CLIENT_ID}&redirect_uri=${encodeURIComponent(WP_REDIRECT_URI)}&response_type=code`;
                    window.location.href = authUrl;
                  }}
                  className="h-14 px-12 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-sm md:text-base tracking-tight transition-all duration-500 shadow-lg shadow-orange-500/20 group hover:-translate-y-1 text-white border border-orange-400/20"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.05-.18 2.986-.51-.024-.037-.046-.078-.065-.123l-2.763-8.082V12.786M4.545 15.698c0-1.875.568-3.078 1.137-4.102.568-.91.966-1.536.966-2.5 0-1.138-.853-2.162-2.046-2.162h-.057A9.855 9.855 0 0 0 2.05 12c0 2.628 1.026 5.016 2.69 6.786l2.083-6.046c-.225-.453-.45-.984-.45-1.54M17.02 10.648c0 1.48-.342 2.787-.796 3.98l-3.23 9.096A9.97 9.97 0 0 0 21.95 12c0-4.11-2.484-7.644-6.096-9.15.568 1.08.91 2.33.91 3.58.002.855-.17 1.706-.512 2.484.455.454.767 1.08.767 1.734m-4.862-8.52A9.957 9.957 0 0 0 12 2C6.48 2 2 6.48 2 12c0 .285.013.565.035.845.82-.46 2.088-1.597 2.088-1.597.23-.17.172-.51-.113-.51h-.967c1.196-4.557 5.35-7.97 10.32-7.97 1.63 0 3.176.388 4.544 1.077l-1.65 4.383-4.1-3.628z" />
                  </svg>
                  Sign in with WordPress
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Domain URL</Label>
                  <Input
                    placeholder={siteForm.siteType === "embed_widget" ? "https://your-domain.com" : "https://your-blog.com"}
                    value={siteForm.siteUrl}
                    onChange={(e) => setSiteForm({ ...siteForm, siteUrl: e.target.value })}
                    className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-orange-500/20 transition-all text-neutral-900 dark:text-white"
                  />
                </div>

                {siteForm.siteType !== "embed_widget" && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Username</Label>
                      <Input
                        placeholder="admin@yourdomain.com"
                        value={siteForm.username}
                        onChange={(e) => setSiteForm({ ...siteForm, username: e.target.value })}
                        className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-orange-500/20 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">API Secret / Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={siteForm.password}
                        onChange={(e) => setSiteForm({ ...siteForm, password: e.target.value })}
                        className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-orange-500/20 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 h-14 mt-[31px]">
                  <Switch
                    checked={siteForm.isEnabled}
                    onCheckedChange={(checked) => setSiteForm({ ...siteForm, isEnabled: checked })}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-900 dark:text-white cursor-pointer">Connection Active</Label>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-100 dark:border-white/5">
            {siteForm.siteType !== "wordpress" && (
              <Button
                onClick={handleAddSite}
                disabled={isCreatingSite}
                className="w-full h-16 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-xl rounded-2xl font-bold text-sm md:text-base tracking-tight transition-all duration-500 hover:-translate-y-1"
              >
                {isCreatingSite ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Plus className="w-5 h-5 mr-3" />}
                Connect Platform
              </Button>
            )}
          </div>

          <div className="space-y-4 pt-10 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400 dark:text-neutral-500 ml-1">Active Integrations</h3>
            <div className="space-y-3">
              {sites?.map((site) => (
                <div key={site.id} className="group bg-neutral-50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/[0.04] rounded-[2rem] border border-neutral-200 dark:border-white/5 transition-all duration-500 overflow-hidden">
                  <div className="p-8 flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center font-bold text-orange-500 text-xs transition-transform group-hover:scale-105">
                        {site.siteType.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight group-hover:text-orange-500 transition-colors">{site.siteName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-tight">{site.siteUrl}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/10" />
                          <span className={`text-xs md:text-sm font-bold tracking-wide ${site.isEnabled ? 'text-orange-500' : 'text-neutral-300 dark:text-neutral-700'}`}>
                            {site.isEnabled ? 'Active' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editingSiteId === site.id ? setEditingSiteId(null) : startEditing(site)}
                        className="h-10 px-6 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-sm md:text-base tracking-tight transition-all shadow-sm text-neutral-900 dark:text-white"
                      >
                        {editingSiteId === site.id ? <X className="w-3.5 h-3.5 mr-2" /> : <Pencil className="w-3.5 h-3.5 mr-2" />}
                        {editingSiteId === site.id ? "Cancel" : "Edit Config"}
                      </Button>
                      {(site.siteType === "medium" || site.siteType === "wordpress" || site.siteType === "ghost" || site.siteType === "linkedin") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(site.id)}
                          disabled={testingSiteId === site.id}
                          className="h-10 px-6 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 hover:bg-orange-500/10 hover:text-orange-500 font-bold text-sm md:text-base tracking-tight transition-all shadow-sm text-neutral-900 dark:text-white"
                        >
                          {testingSiteId === site.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Plug className="w-3.5 h-3.5 mr-2" />}
                          Diagnostics
                        </Button>
                      )}
                      {site.siteType === "embed_widget" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 px-6 rounded-xl border-orange-500/20 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white font-bold text-sm md:text-base tracking-tight transition-all shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5 mr-2" />
                              Get Snippet
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl p-4 md:p-10 flex flex-col gap-0">
                            <DialogHeader>
                              <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white text-center">Integration Snippet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-8 py-6">
                              <div className="p-8 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-4">
                                <h3 className="text-xs md:text-sm font-bold text-orange-500 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" /> Setup Instructions
                                </h3>
                                <div className="space-y-3 text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                  <p><span className="text-orange-500 mr-2">01.</span> Copy the integration code below.</p>
                                  <p><span className="text-orange-500 mr-2">02.</span> Paste the div into your site's target location.</p>
                                  <p><span className="text-orange-500 mr-2">03.</span> Include the widget script in your global head or body.</p>
                                </div>
                              </div>

                              <div className="relative group rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-950 shadow-lg">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                  <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-10 px-6 rounded-xl font-bold text-xs md:text-sm tracking-tight text-orange-500 hover:bg-orange-500/10 transition-all"
                                    onClick={() => {
                                      const sid = site.id;
                                      const code = `<div id="ai-tech-blog-feed" data-site-id="${sid}"></div>\n<script src="https://ai-tech-5l4y.onrender.com/blog-widget.js"></script>`;
                                      navigator.clipboard.writeText(code);
                                      toast({ title: "Copied", description: "Integration snippet copied to clipboard." });
                                    }}
                                  >
                                    Copy Code
                                  </Button>
                                </div>
                                <div className="p-8 overflow-x-auto">
                                  <pre className="font-mono text-xs leading-loose text-orange-500/80 whitespace-pre">
                                    {`<div id="ai-tech-blog-feed" data-site-id="${site.id}"></div>
<script src="https://ai-tech-5l4y.onrender.com/blog-widget.js"></script>`}
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
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingSiteId === site.id && (
                    <div className="p-10 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 text-orange-500 animate-pulse" />
                        <p className="text-xs md:text-sm font-semibold tracking-wide text-orange-500">Updating credentials</p>
                      </div>

                      {site.siteType === "medium" && (
                        <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                          <p className="text-xs md:text-sm text-orange-500 font-semibold tracking-wide leading-relaxed">
                            Medium requires an <span className="underline">Integration Token</span>. Create one in Settings → Security.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {site.siteType !== "medium" && site.siteType !== "linkedin" && (
                          <div className="space-y-3">
                             <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Username</Label>
                            <Input
                              value={editCredentials.username}
                              onChange={(e) => setEditCredentials({ ...editCredentials, username: e.target.value })}
                              className="rounded-xl h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-semibold text-xs md:text-sm px-5"
                            />
                          </div>
                        )}
                        <div className="space-y-3 col-span-full">
                           <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">API Secret / Password</Label>
                          <Input
                            type="password"
                            value={editCredentials.password}
                            onChange={(e) => setEditCredentials({ ...editCredentials, password: e.target.value })}
                            className="rounded-xl h-12 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-semibold text-xs md:text-sm px-5"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => saveCredentials(site.id)}
                        disabled={isUpdatingSite}
                        className="w-full h-14 bg-orange-500 hover:bg-orange-600 font-bold text-sm md:text-base tracking-tight text-white rounded-2xl shadow-lg shadow-orange-500/10 transition-all border-none"
                      >
                        {isUpdatingSite ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify and Save"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Posts Section */}
        <div className="premium-card p-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] shadow-xl space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/5">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Publishing Schedule</h2>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide">Automate your content distribution across active networks</p>
            </div>
          </div>

          {(!sites || sites?.length === 0) ? (
            <div className="p-8 bg-neutral-50 dark:bg-neutral-800 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl text-center">
               <p className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400">Connect a platform above to begin scheduling posts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                 <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Select Article</Label>
                <Select value={scheduleForm.blogId} onValueChange={(val) => setScheduleForm({ ...scheduleForm, blogId: val })}>
                <SelectTrigger className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-0 focus:border-orange-500/20 transition-all text-neutral-900 dark:text-white">
                    <SelectValue placeholder="Choose Blog Post..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    {blogs?.map((blog) => (
                      <SelectItem key={blog.id} value={String(blog.id)} className="font-semibold text-xs md:text-sm py-3">
                        {blog.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                 <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Target Platform</Label>
                <Select value={scheduleForm.siteId} onValueChange={(val) => setScheduleForm({ ...scheduleForm, siteId: val })}>
                  <SelectTrigger className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 font-semibold text-xs px-6 focus:ring-0 focus:border-orange-500/20 transition-all">
                    <SelectValue placeholder="Choose Platform..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={String(site.id)} className="font-semibold text-xs md:text-sm py-3">
                        {site.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                 <Label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 ml-1">Publish Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="rounded-2xl h-14 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-semibold text-sm md:text-base px-6 focus:ring-orange-500/20 transition-all text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {sites && sites?.length > 0 && (
            <Button
              onClick={handleSchedulePost}
              disabled={isCreatingScheduled}
              className="w-full h-16 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-xl rounded-2xl font-bold text-sm md:text-base tracking-tight transition-all duration-500 hover:-translate-y-1"
            >
              <Clock className="w-5 h-5 mr-3" />
              {isCreatingScheduled ? "Scheduling..." : "Create Automated Post"}
            </Button>
          )}

          <div className="space-y-4 pt-10 border-t border-neutral-100 dark:border-white/5">
             <h3 className="text-xs md:text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500 ml-1">Upcoming Queue</h3>
            <div className="space-y-3">
              {scheduled?.map((post) => {
                const blog = blogs?.find((b) => b.id === post.blogId);
                const site = sites?.find((s) => s.id === post.siteId);
                return (
                  <div key={post.id} className="group bg-neutral-50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/[0.04] rounded-2xl border border-neutral-200 dark:border-white/5 p-6 flex items-center justify-between transition-all duration-500">
                    <div className="flex-1">
                       <p className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight group-hover:text-orange-500 transition-colors">{blog?.title || "Draft Article"}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide">→ {site?.siteName || "System"}</span>
                        <span className="flex items-center gap-1.5 text-xs md:text-sm text-orange-500 font-semibold tracking-wide">
                          <Clock className="w-3 h-3" /> {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-tight border ${post.status === "posted" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            post.status === "failed" ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          }`}>
                           {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteScheduled(post.id)}
                      disabled={isDeletingScheduled}
                      className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              {(!scheduled || scheduled?.length === 0) && (
                <div className="py-12 text-center">
                  <p className="text-xs text-neutral-400 font-medium">No posts currently in the queue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
