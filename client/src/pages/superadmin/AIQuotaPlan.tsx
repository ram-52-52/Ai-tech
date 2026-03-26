import { PieChart, TrendingUp, Zap, AlertTriangle, ArrowUpRight, CheckCircle2, Crown, ZapIcon, BatteryMedium, Activity, LayoutDashboard, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Progress } from "@/components/ui/progress";

export default function SuperAdminPlan() {
  const usage = {
    openai: { used: 8500, total: 10000 },
    dalle: { used: 420, total: 500 },
    storage: { used: 1.2, total: 5, unit: "GB" }
  };

  const openaiPercentage = (usage.openai.used / usage.openai.total) * 100;
  const showWarning = openaiPercentage >= 80;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SEO title="AI Quota & Plan" description="Monitor system-wide AI token usage and manage subscription tiers." />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3 text-amber-400" /> Platform Infrastructure
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            AI Quota & Plan
          </h1>
          <p className="text-slate-300 mt-1 text-sm md:text-lg font-medium">Manage top-level API limits and global subscription performance.</p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-2xl px-8 h-12 font-bold shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1">
          <ZapIcon className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      {showWarning && (
        <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-amber-400">Critical Usage Alert</h4>
              <p className="text-sm text-amber-300/70">Main OpenAI API instance is at {openaiPercentage.toFixed(0)}% capacity. High-volume periods may experience latency.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 whitespace-nowrap">
            Top-up Credits
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BatteryMedium className="w-32 h-32 text-indigo-400 rotate-12" />
          </div>
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              API Usage Metrics
            </CardTitle>
            <CardDescription>System-wide token consumption and storage occupancy.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-foreground">OpenAI API Calls</h4>
                  <p className="text-xs text-muted-foreground">GPT-4o Multi-tenant Instance</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-primary">{usage.openai.used.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {usage.openai.total.toLocaleString()}</span>
                </div>
              </div>
              <Progress value={openaiPercentage} className="h-3 bg-white/5" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-foreground">DALL-E 3 Images</h4>
                  <p className="text-xs text-muted-foreground">Visual Asset Generation</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-indigo-400">{usage.dalle.used}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {usage.dalle.total}</span>
                </div>
              </div>
              <Progress value={(usage.dalle.used / usage.dalle.total) * 100} className="h-3 bg-white/5" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-foreground">Cloud Storage</h4>
                  <p className="text-xs text-muted-foreground">Media & Blog Database</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400">{usage.storage.used} {usage.storage.unit}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {usage.storage.total} {usage.storage.unit}</span>
                </div>
              </div>
              <Progress value={(usage.storage.used / usage.storage.total) * 100} className="h-3 bg-white/5" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-white/10 bg-indigo-600/10 backdrop-blur-3xl rounded-[2.5rem] p-8 border-l-4 border-l-primary shadow-2xl relative overflow-hidden">
            <CardHeader className="p-0 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/20">
                <Crown className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-black text-white">Pro Tier</CardTitle>
              <CardDescription className="text-indigo-200/50">Enterprise SaaS Platform Plan</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 opacity-60">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="font-bold">Active Subscription</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 opacity-60">Renewal Date</p>
                <p className="font-bold">April 12, 2026</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  Expires in 15 days
                </div>
                <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase text-white hover:bg-white/10">Manage</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2.5rem] p-8 transition-all hover:bg-black/60 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Auto-Refill</p>
            </div>
            <h4 className="font-bold text-lg mb-1">Credit Auto-Refill</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Automatically top-up $50 whenever usage hits 95%. Currently disabled.</p>
            <Button variant="ghost" className="p-0 h-auto text-primary text-xs font-bold mt-4 group-hover:translate-x-1 transition-transform hover:underline hover:bg-transparent">Enable Smart Billing &rarr;</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
