import { PieChart, TrendingUp, Zap, AlertTriangle, ArrowUpRight, CheckCircle2, Crown, ZapIcon, BatteryMedium, Activity, LayoutDashboard, FileText, Sparkles, Edit3, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminPlan() {
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const { data: plans, isLoading: plansLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/plans"]
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (vars: { name: string, updates: any }) => {
      const res = await fetch(`/api/admin/plans/${vars.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars.updates)
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setEditingPlan(null);
      toast({ title: "Plan updated", description: "The subscription tier has been successfully updated." });
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: async (plan: any) => {
      const res = await fetch(`/api/admin/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan)
      });
      if (!res.ok) throw new Error("Creation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setIsAddingNew(false);
      setEditingPlan(null);
      toast({ title: "Plan created", description: "A new subscription tier has been added." });
    }
  });

  const usage = {
    openai: { used: 8500, total: 10000 },
    dalle: { used: 420, total: 500 },
    storage: { used: 1.2, total: 5, unit: "GB" }
  };

  const openaiPercentage = (usage.openai.used / usage.openai.total) * 100;

  const PlanModal = ({ plan, onSave, onCancel, isNew = false }: any) => {
    const [localPlan, setLocalPlan] = useState(plan || {
      name: "", priceMonthly: 0, priceYearly: 0, blogLimit: 0, features: [], isMostPopular: false
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 px-4">
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 w-full max-w-lg p-8 md:p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase">
              {isNew ? "Create New Tier" : `Modify ${plan.name}`}
            </h3>
            <p className="text-sm text-neutral-500 font-medium">Configure subscription pricing and features.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Plan Name</label>
                <input 
                  disabled={!isNew}
                  value={localPlan.name}
                  onChange={(e) => setLocalPlan({ ...localPlan, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                  placeholder="e.g., Enterprise"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Monthly Price (INR)</label>
                <input 
                  type="number"
                  value={localPlan.priceMonthly}
                  onChange={(e) => setLocalPlan({ ...localPlan, priceMonthly: Number(e.target.value) })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Yearly Price (INR)</label>
                <input 
                  type="number"
                  value={localPlan.priceYearly}
                  onChange={(e) => setLocalPlan({ ...localPlan, priceYearly: Number(e.target.value) })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Blog Limit</label>
                <input 
                  type="number"
                  value={localPlan.blogLimit}
                  onChange={(e) => setLocalPlan({ ...localPlan, blogLimit: Number(e.target.value) })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Features (Comma separated)</label>
              <textarea 
                value={localPlan.features.join(", ")}
                onChange={(e) => setLocalPlan({ ...localPlan, features: e.target.value.split(",").map(f => f.trim()).filter(Boolean) })}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 rounded-2xl p-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 min-h-[100px]"
                placeholder="24/7 Support, Custom Domain, etc."
              />
            </div>

            <div className="flex items-center gap-3">
                <input 
                    type="checkbox"
                    checked={localPlan.isMostPopular}
                    onChange={(e) => setLocalPlan({ ...localPlan, isMostPopular: e.target.checked })}
                    className="w-5 h-5 accent-orange-500"
                />
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Mark as Most Popular</label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-8">
            <Button 
              onClick={() => onSave(localPlan)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20"
            >
              {isNew ? "Create Plan" : "Save Plan"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-14 h-14 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO title="Plan Management | AI TECH" description="Manage subscription tiers and system-wide resources." />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <Zap className="w-3.5 h-3.5" /> Platform Governance
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Plan <span className="text-orange-500">Management</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium tracking-tight">Configure subscription tiers and monitor system resources.</p>
        </div>
        <Button 
            onClick={() => setIsAddingNew(true)}
            className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-10 h-16 font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/20 group/btn"
        >
            <ZapIcon className="w-5 h-5 mr-3 fill-current group-hover/btn:scale-110 transition-transform" />
            New Tier
        </Button>
      </div>

      {/* Tiers Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Subscription Tiers</h2>
                <p className="text-sm text-neutral-500 font-medium">Configure pricing and blog limits for each plan.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {plans?.map((plan) => (
                <Card key={plan.name} className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-xl transition-all hover:shadow-[0_20px_60px_-15px_rgba(255,90,0,0.15)] hover:border-orange-500/50 group relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-orange-500 transition-colors" />
                    <CardHeader className="p-10 pb-6 relative">
                        <div className="flex justify-between items-start">
                            <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${plan.isMostPopular ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                {plan.name}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setEditingPlan(plan)}
                                className="w-10 h-10 rounded-2xl hover:bg-orange-500/10 hover:text-orange-500 transition-all border border-transparent hover:border-orange-500/20"
                            >
                                <Edit3 className="w-5 h-5" />
                            </Button>
                        </div>
                        <CardTitle className="text-4xl font-black mt-8 dark:text-white tracking-tighter flex items-baseline gap-2">
                            ₹{plan.priceMonthly}<span className="text-lg font-medium text-neutral-400">/mo</span>
                        </CardTitle>
                        <CardDescription className="text-xs font-bold text-neutral-500 dark:text-neutral-500 mt-2">
                            Yearly Commitment: ₹{plan.priceYearly}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-4 space-y-8">
                        <div className="flex items-center gap-4 p-5 bg-neutral-50 dark:bg-black/40 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Monthly Quota</p>
                                <p className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">{plan.blogLimit} AI Blogs / month</p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-5">Enterprise Access Features</p>
                            <ul className="space-y-4">
                                {plan.features.slice(0, 5).map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="leading-snug">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      {editingPlan && (
        <PlanModal 
            plan={editingPlan} 
            onSave={(updates: any) => updatePlanMutation.mutate({ name: editingPlan.name, updates })}
            onCancel={() => setEditingPlan(null)}
        />
      )}

      {isAddingNew && (
        <PlanModal 
            isNew 
            onSave={(plan: any) => createPlanMutation.mutate(plan)}
            onCancel={() => setIsAddingNew(false)}
        />
      )}

      {/* Usage Analytics Module */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 premium-card bg-white dark:bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 relative group rounded-[2.5rem] shadow-xl">
          <div className="p-6 md:p-10 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">API Consumption</h3>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide mt-1">Real-time usage across AI models</p>
            </div>
            <Activity className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div className="p-6 md:p-10 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">OpenAI Tokens</h4>
                  <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide mt-1">GPT-4o Managed Service</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-orange-500">{usage.openai.used.toLocaleString()}</span>
                  <span className="text-xs md:text-sm text-neutral-400 font-semibold tracking-wide ml-2">/ {usage.openai.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${openaiPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card bg-orange-500/5 dark:bg-neutral-900 p-8 md:p-10 border border-orange-500/20 rounded-[2.5rem] shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-8 transition-all group-hover:scale-110 shadow-lg shadow-orange-500/5">
                <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white">SYSTEM SUMMARY</h3>
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-2">{plans?.length} ACTIVE PLANS • {usage.openai.total} TOTAL TOKENS</p>
            
            <div className="mt-10 space-y-6 pt-6 border-t border-orange-500/10">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Avg Subscription</span>
                    <span className="text-sm font-black text-neutral-900 dark:text-white">₹2,900/mo</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Active Clients</span>
                    <span className="text-sm font-black text-neutral-900 dark:text-white">128</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
