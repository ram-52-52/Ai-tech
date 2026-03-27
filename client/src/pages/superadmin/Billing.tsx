import { CreditCard, TrendingUp, DollarSign, Users, ArrowUpRight, Download, Sparkles, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { handleGetGlobalStats, handleGetAllUsers } from "@/services/api/superAdminAPI";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  username: string;
  clientId: string;
  role: string;
  plan: string;
  blogsGeneratedThisMonth: number;
  createdAt: string;
}

interface GlobalStats {
  totalUsers: number;
  totalBlogs: number;
  totalPublished: number;
  totalDrafts: number;
}

const planPrices: Record<string, number> = {
  'Free Trial': 0,
  'Starter': 29,
  'Growth': 79,
  'Pro': 199
};

export default function SuperAdminBilling() {
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await handleGetAllUsers();
      if (!res.success) throw new Error(res.error || "Failed to fetch users");
      return res.data;
    }
  });

  const { data: globalStats, isLoading: isStatsLoading } = useQuery<GlobalStats>({
    queryKey: ["/api/admin/global-stats"],
    queryFn: async () => {
      const res = await handleGetGlobalStats();
      if (!res.success) throw new Error(res.error || "Failed to fetch stats");
      return res.data;
    }
  });

  const isLoading = isUsersLoading || isStatsLoading;
  
  const activeClients = users?.filter(u => u.role === 'user').length || 0;
  const trials = users?.filter(u => u.plan === 'Free Trial').length || 0;
  const mrr = users?.reduce((acc, u) => acc + (planPrices[u.plan] || 0), 0) || 0;

  const planStats = [
    { 
      name: "Starter", 
      price: "$29", 
      users: users?.filter(u => u.plan === 'Starter').length || 0, 
      revenue: `$${(users?.filter(u => u.plan === 'Starter').length || 0) * 29}`
    },
    { 
      name: "Growth", 
      price: "$79", 
      users: users?.filter(u => u.plan === 'Growth').length || 0, 
      revenue: `$${(users?.filter(u => u.plan === 'Growth').length || 0) * 79}`
    },
    { 
      name: "Pro", 
      price: "$199", 
      users: users?.filter(u => u.plan === 'Pro').length || 0, 
      revenue: `$${(users?.filter(u => u.plan === 'Pro').length || 0) * 199}`
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO title="Financial Overview | AI TECH" description="Monitor platform revenue and SaaS client subscriptions." />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <CreditCard className="w-3.5 h-3.5" /> Billing Synchronization
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Financial <span className="text-orange-500">Overview</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium tracking-tight">Centralized monitoring for revenue, client subscriptions, and platform health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="premium-card p-6 md:p-8 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 rounded-[2rem]">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" />
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs md:text-sm font-semibold text-neutral-500 tracking-wide">Monthly Revenue</span>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? <Skeleton className="h-10 w-32 bg-neutral-100 dark:bg-white/5" /> : <div className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">${mrr.toLocaleString()}.00</div>}
          <div className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-500 tracking-wide">
            <ArrowUpRight className="w-4 h-4" /> Revenue Growth
          </div>
        </div>

        <div className="premium-card p-6 md:p-8 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 rounded-[2rem]">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" />
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs md:text-sm font-semibold text-neutral-500 tracking-wide">Trial Accounts</span>
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? <Skeleton className="h-10 w-32 bg-neutral-100 dark:bg-white/5" /> : <div className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{trials}</div>}
          <div className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold text-orange-500 tracking-wide">
            <Sparkles className="w-4 h-4" /> Conversion Potential
          </div>
        </div>

        <div className="premium-card p-6 md:p-8 bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 rounded-[2rem]">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full" />
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs md:text-sm font-semibold text-neutral-500 tracking-wide">Total Clients</span>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? <Skeleton className="h-10 w-32 bg-neutral-100 dark:bg-white/5" /> : <div className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{activeClients}</div>}
          <div className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-600 dark:text-amber-500 tracking-wide">
             Active Subscriptions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="premium-card bg-white dark:bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem]">
          <div className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="text-lg md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Subscription Tier Overview</h3>
            <Terminal className="w-4 h-4 text-orange-500" />
          </div>
          <div className="p-4 md:p-8 space-y-4 md:space-y-6">
            {planStats.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between p-4 md:p-6 rounded-[1.25rem] md:rounded-[1.5rem] bg-neutral-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-neutral-800 hover:border-orange-500/30 transition-all duration-300 group/item">
                <div className="flex items-center gap-3 md:gap-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 transition-all group-hover/item:scale-110`}>
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight">{plan.name}</h3>
                    <p className="text-[10px] md:text-sm text-neutral-500 dark:text-neutral-400 tracking-wide mt-1 font-semibold">{plan.users} SYNCED NODES</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold text-orange-500">{plan.revenue}</div>
                  <div className="text-[10px] md:text-sm text-neutral-500 dark:text-neutral-400 tracking-tight">{plan.price}/mo protocol</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-neutral-900 overflow-hidden border border-neutral-200 dark:border-neutral-800 relative rounded-[2.5rem]">
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl px-8 md:px-12 py-10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col items-center gap-6 max-w-[calc(100%-2rem)] md:max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h4 className=" font-bold text-xl md:text-2xl tracking-tight text-neutral-900 dark:text-white">Billing Center</h4>
                <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-3 font-medium leading-relaxed">Professional Stripe integration pending connection.</p>
              </div>
              <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-14 text-sm text-white border-none shadow-xl shadow-orange-500/20">Connect Stripe</Button>
            </div>
          </div>
          
          <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between mb-0">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Transaction Ledger</h3>
            <Download className="w-4 h-4 text-orange-500" />
          </div>
          <div className="p-0 opacity-10 blur-[2px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-xs md:text-sm font-bold tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-8 py-6">Account Identifier</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {users?.slice(0, 5).map((u, i) => (
                  <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="px-8 py-6 text-sm font-semibold">{u.username}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs md:text-sm font-bold border border-emerald-500/20">Authorized</span></td>
                    <td className="px-8 py-6 text-right text-sm font-bold text-orange-500">${planPrices[u.plan] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
