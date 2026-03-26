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
      revenue: `$${(users?.filter(u => u.plan === 'Starter').length || 0) * 29}`, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      name: "Growth", 
      price: "$79", 
      users: users?.filter(u => u.plan === 'Growth').length || 0, 
      revenue: `$${(users?.filter(u => u.plan === 'Growth').length || 0) * 79}`, 
      color: "from-indigo-500 to-purple-500" 
    },
    { 
      name: "Pro", 
      price: "$199", 
      users: users?.filter(u => u.plan === 'Pro').length || 0, 
      revenue: `$${(users?.filter(u => u.plan === 'Pro').length || 0) * 199}`, 
      color: "from-pink-500 to-rose-500" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SEO title="Billing & Subscriptions" description="Manage platform revenue and SaaS client subscriptions." />

      <div className="relative overflow-hidden p-8 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Financial Overview
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            Billing & Revenue
          </h1>
          <p className="text-slate-300 mt-1 text-sm md:text-lg font-medium max-w-2xl">
            Monitor MRR, track subscription health, and manage platform-wide invoicing metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Monthly Revenue</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-24" /> : <div className="text-3xl font-bold">${mrr.toLocaleString()}.00</div>}
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-bold">
              <ArrowUpRight className="w-3 h-3" /> Real-time MRR
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Trials</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-24" /> : <div className="text-3xl font-bold">{trials}</div>}
            <p className="text-xs text-blue-400 flex items-center gap-1 mt-1 font-bold">
              Free Tier Users
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Clients</CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-9 w-24" /> : <div className="text-3xl font-bold">{activeClients}</div>}
            <p className="text-xs text-muted-foreground mt-1">SaaS User Accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-xl font-bold">Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {planStats.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.users} active users</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{plan.revenue}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{plan.price}/mo</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-bold text-lg">Invoicing Engine</h4>
              <p className="text-xs text-muted-foreground">Automated Stripe Integration Coming Soon</p>
              <Button size="sm" className="mt-2 rounded-xl h-8 text-[11px] font-bold">Early Access</Button>
            </div>
          </div>
          <CardHeader className="p-6 border-b border-white/5 opacity-30 grayscale">
            <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 opacity-30 grayscale blur-[2px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {users?.slice(0, 4).map((u, i) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="px-6 py-4 text-sm">{u.username}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">Paid</span></td>
                    <td className="px-6 py-4 text-right text-sm">${planPrices[u.plan] || 0}</td>
                  </tr>
                )) || [1, 2, 3, 4].map(i => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-6 py-4 text-sm">Client {i}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">Paid</span></td>
                    <td className="px-6 py-4 text-right text-sm">$0.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
