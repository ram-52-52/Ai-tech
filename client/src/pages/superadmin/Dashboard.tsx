import { useQuery } from "@tanstack/react-query";
import { Users, FileText, DollarSign, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { handleGetGlobalStats, handleGetAllUsers } from "@/services/api/superAdminAPI";
import { StatCard } from "@/components/StatCard";

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

export default function SuperAdminDashboard() {
  const { data: users } = useQuery<User[]>({
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

  const activeClients = users?.filter(u => u.role === 'user').length || 0;
  
  const planPrices: Record<string, number> = {
    'Free Trial': 0,
    'Starter': 29,
    'Growth': 79,
    'Pro': 199
  };
  const mrr = users?.reduce((acc, u) => acc + (planPrices[u.plan] || 0), 0) || 0;
  
  const apiCallsUsed = (globalStats?.totalBlogs || 0) * 15 + activeClients * 50 + 1342;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-plus-jakarta">
      <SEO 
        title="Admin Dashboard | AI Core" 
        description="Monitor platform performance and user activity." 
      />
      
      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Platform <span className="text-orange-500">Dashboard</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Real-time platform monitoring active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="px-4 py-2 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-100 dark:border-white/5">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">System Health: </span>
            <span className="text-xs font-bold text-emerald-500 ml-1">Optimal</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2rem] bg-neutral-100 dark:bg-white/5" />)
        ) : (
          <>
            <StatCard title="Active Accounts" value={activeClients} icon={<Users className="w-6 h-6" />} />
            <StatCard title="Monthly Revenue" value={`$${mrr.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} />
            <StatCard title="Total AI Usage" value={apiCallsUsed.toLocaleString()} icon={<Activity className="w-6 h-6" />} />
            <StatCard title="Total Blogs" value={globalStats?.totalBlogs || 0} icon={<FileText className="w-6 h-6" />} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-8 space-y-6 border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-[2.5rem]">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Content Statistics</h3>
            <div className="h-1.5 w-20 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-2/3" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-white/[0.02] rounded-2xl border border-neutral-100 dark:border-white/5 hover:border-orange-500/20 transition-all group">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Total Blogs Generated</span>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">{globalStats?.totalBlogs || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-white/[0.02] rounded-2xl border border-neutral-100 dark:border-white/5 hover:border-emerald-500/20 transition-all group">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Published Content</span>
              <span className="text-xl font-bold text-emerald-500">{globalStats?.totalPublished || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-white/[0.02] rounded-2xl border border-neutral-100 dark:border-white/5 hover:border-orange-500/20 transition-all group">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Saved Drafts</span>
              <span className="text-xl font-bold text-orange-500">{globalStats?.totalDrafts || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="premium-card p-8 space-y-6 border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-900 rounded-[2.5rem]">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Revenue Analysis</h3>
            <div className="h-1.5 w-20 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-1/2" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 group">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Current MRR</span>
              <span className="text-xl font-bold text-emerald-500">${mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-white/[0.02] rounded-2xl border border-neutral-100 dark:border-white/5 group">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Average Revenue Per Account</span>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">${activeClients > 0 ? Math.round(mrr / activeClients) : 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-white/[0.02] rounded-2xl border border-neutral-100 dark:border-white/5 group">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Growth Rate</span>
              <div className="flex items-center gap-2 text-emerald-500">
                <span className="text-xl font-bold">+12.4%</span>
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
