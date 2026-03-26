import { Search, Filter, Info, AlertTriangle, XCircle, Clock, Wifi } from "lucide-react";
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
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: logsData, isLoading } = useQuery<{ logs: Log[]; total: number }>({
    queryKey: ["/api/admin/platform-events", page, limit, selectedUserId],
    queryFn: async () => {
      const url = new URL("/api/admin/platform-events", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (selectedUserId !== "all") {
        url.searchParams.append("userId", selectedUserId);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10s for 'live' feel
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.details || "").toLowerCase().includes(search.toLowerCase())
  );

  const getLogIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("error") || lower.includes("failed")) return <XCircle className="w-4 h-4 text-rose-500" />;
    if (lower.includes("warning") || lower.includes("limit")) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SEO title="Platform Logs" description="Monitor system-wide activity, blog generations, and error traces." />

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Wifi className="w-3 h-3 animate-pulse" /> Live Connection: Active
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            Platform Logs
          </h1>
          <p className="text-slate-300 mt-1 text-sm md:text-lg font-medium">Trace background tasks, monitor AI usage, and debug API interactions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5" onClick={() => setSearch("")}>
            Reset Filters
          </Button>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500">
            Export JSON
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Live Event Stream
          </CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 ring-indigo-500/50"
            >
              <option value="all">All Users</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search details..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 rounded-xl" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-foreground min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                      Loading stream...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                      No logs found for current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 uppercase text-[10px] font-bold">
                          {getLogIcon(log.action)}
                          <span className={cn(
                            log.action.toLowerCase().includes("error") ? "text-rose-500" :
                            log.action.toLowerCase().includes("warning") ? "text-amber-500" :
                            "text-blue-500"
                          )}>
                            {log.action.toLowerCase().includes("error") ? "Error" : 
                             log.action.toLowerCase().includes("warning") ? "Warning" : "Info"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-white">{log.action}</td>
                      <td className="px-6 py-5">
                         <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-mono border border-white/10">
                           {log.username || "System"}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-sm max-w-md truncate">{log.details || "—"}</td>
                      <td className="px-6 py-5 text-right text-xs opacity-50 font-mono">
                        {log.timestamp ? format(new Date(log.timestamp), "MMM d, HH:mm:ss") : "Just now"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 flex items-center justify-between border-t border-white/5 bg-white/5">
            <p className="text-xs text-muted-foreground">
              Showing page {page} of {totalPages || 1} ({totalLogs} total events)
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg h-8 border-white/10"
              >
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg h-8 border-white/10"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
