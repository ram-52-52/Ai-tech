import { Search, Filter, Info, AlertTriangle, XCircle, Clock, Wifi, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { type Log, type User } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SuperAdminLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    }
  });

  const { data: logsData, isLoading } = useQuery<{ logs: Log[]; total: number }>({
    queryKey: ["/api/admin/platform-events", page, limit, selectedUserId, search],
    queryFn: async () => {
      const url = new URL("/api/admin/platform-events", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (selectedUserId !== "all") {
        url.searchParams.append("userId", selectedUserId);
      }
      if (search) {
        url.searchParams.append("search", search);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    // We can just omit or set back to older standard, earlier it was 10000 originally maybe? Wait, no, the user originally had SWR/React Query but no polling or some other polling. I'll just remove refetchInterval or set to 10000 because that's what it was before my 3000 edit in Step 65. I'll set it to what it was in Step 65.
    refetchInterval: 3000,
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  const getLogIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("error") || lower.includes("failed")) return <XCircle className="w-4 h-4 text-rose-500" />;
    if (lower.includes("warning") || lower.includes("limit")) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO title="Platform Activity | AI TECH" description="Comprehensive platform event monitoring and activity logs." />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] md:text-sm font-semibold tracking-wide mb-4">
            <Wifi className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry Linked
          </div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Platform <span className="text-orange-500">Activity</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-xs md:text-base font-medium tracking-tight">Background process monitoring / Action logs / API verification.</p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Button variant="outline" className="h-12 md:h-14 flex-1 md:flex-none px-6 md:px-8 rounded-xl md:rounded-2xl bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-neutral-800 text-[10px] md:text-xs font-bold tracking-tight hover:bg-neutral-100 transition-all" onClick={() => { setSearch(""); setSelectedUserId("all"); setPage(1); }}>
            Reset Filter
          </Button>
          <Button variant="default" className="h-12 md:h-14 flex-1 md:flex-none px-6 md:px-8 rounded-xl md:rounded-2xl bg-orange-500 text-white border-none font-bold text-[10px] md:text-xs tracking-tight hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
            Export Logs
          </Button>
        </div>
      </div>

      <div className="premium-card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] overflow-hidden shadow-xl">
        <div className="p-8 md:p-10 border-b border-neutral-100 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <h3 className="text-xs md:text-sm font-semibold tracking-wide text-orange-500 flex items-center gap-4">
            <Clock className="w-5 h-5" />
            LIVE EVENT LOG
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPage(1);
              }}
              className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl h-12 md:h-14 px-6 text-sm md:text-base font-semibold tracking-wide text-neutral-900 dark:text-white outline-none focus:ring-2 ring-orange-500/20 transition-all appearance-none cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 min-w-[200px] w-full"
            >
              <option value="all">Global Accounts</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <div className="relative group/search min-w-[300px] w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within/search:text-orange-500 transition-colors" />
              <Input
                placeholder="Search event logs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-12 md:h-14 pl-12 pr-6 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm md:text-base font-semibold tracking-wide focus-visible:ring-orange-500/20 placeholder:text-neutral-400/40 w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="p-0">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-xs md:text-sm font-bold text-neutral-500 dark:text-neutral-400 tracking-wide border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Action Type</th>
                  <th className="px-10 py-6">Member Identity</th>
                  <th className="px-10 py-6">Activity Details</th>
                  <th className="px-10 py-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin opacity-20" />
                        <span className="text-xs md:text-sm font-bold tracking-wide text-neutral-400">Syncing Content...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center text-xs md:text-sm font-bold tracking-wide text-neutral-400">
                      No logs found for the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-orange-500/[0.02] transition-all duration-300 group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 text-xs md:text-sm font-bold tracking-wide">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.action.toLowerCase().includes("error") ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" :
                              log.action.toLowerCase().includes("warning") ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" :
                                "bg-orange-500 shadow-[0_0_10px_rgba(255,90,0,0.4)]"
                          )} />
                          <span className={cn(
                             "opacity-60 font-bold",
                            log.action.toLowerCase().includes("error") ? "text-red-500" :
                              log.action.toLowerCase().includes("warning") ? "text-orange-500" :
                                "text-orange-500"
                          )}>
                            {log.action.toLowerCase().includes("error") ? "ERR" :
                              log.action.toLowerCase().includes("warning") ? "WRN" : "ACT"}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-sm md:text-base font-bold tracking-tight text-neutral-900 dark:text-white">{log.action}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs md:text-sm font-bold tracking-wide border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
                          {log.username || "System Core"}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-400 max-w-sm truncate">
                          {log.details || "System automated acknowledgment"}
                        </p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-xs md:text-sm font-bold text-neutral-400 dark:text-neutral-500">
                          {log.timestamp ? format(new Date(log.timestamp), "HH:mm:ss") : "00:00:00"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 gap-4">
            <h3 className="text-xs md:text-sm font-bold tracking-wider text-neutral-400 dark:text-neutral-500 ml-1">Upcoming Queue</h3>
            <p className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400 dark:text-neutral-500 text-center">
              Activity log page {page} of {totalPages || 1} — {totalLogs} total events
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-10 px-6 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-bold tracking-tight disabled:opacity-20 text-neutral-900 dark:text-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-10 px-6 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-bold tracking-tight disabled:opacity-20 text-neutral-900 dark:text-white"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
