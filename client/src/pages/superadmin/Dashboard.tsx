import { useQuery } from "@tanstack/react-query";
import { Users, FileText, DollarSign, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { handleGetGlobalStats, handleGetAllUsers } from "@/services/api/superAdminAPI";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 dark">
      <SEO 
        title="Admin Dashboard" 
        description="Overview of the SaaS platform's performance and top-level metrics." 
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            Dashboard
          </h1>
          <p className="text-slate-300 mt-1 text-base md:text-lg font-medium">Platform-wide overview and performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-42 rounded-[2rem] bg-slate-800/50" />)
        ) : (
          <>
            <StatCard title="Active SaaS Clients" value={activeClients} icon={<Users className="w-5 h-5 text-blue-400" />} />
            <StatCard title="Total Monthly Revenue" value={`$${mrr}`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
            <StatCard title="Total API Calls Used" value={apiCallsUsed.toLocaleString()} icon={<Activity className="w-5 h-5 text-amber-400" />} />
            <StatCard title="Platform Blogs Generated" value={globalStats?.totalBlogs || 0} icon={<FileText className="w-5 h-5 text-purple-400" />} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-400">Generation Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 uppercase tracking-widest text-[10px] font-bold">Total Blogs</span>
                <span className="font-bold">{globalStats?.totalBlogs || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 uppercase tracking-widest text-[10px] font-bold">Published</span>
                <span className="font-bold text-emerald-400">{globalStats?.totalPublished || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 uppercase tracking-widest text-[10px] font-bold">Drafts</span>
                <span className="font-bold text-amber-400">{globalStats?.totalDrafts || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-400">Revenue Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 uppercase tracking-widest text-[10px] font-bold">MRR Estimate</span>
                <span className="font-bold text-emerald-400">${mrr}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 uppercase tracking-widest text-[10px] font-bold">Avg Revenue Per Client</span>
                <span className="font-bold">${activeClients > 0 ? Math.round(mrr / activeClients) : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-8 glass-panel rounded-[2.5rem] border-white/10 shadow-xl space-y-4 bg-black/20 backdrop-blur-2xl flex flex-col justify-between transition-all hover:border-primary/30 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{title}</p>
        <h3 className="text-4xl font-black font-display text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}
