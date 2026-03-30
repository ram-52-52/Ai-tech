import { Mail, Clock, MessageSquare, ExternalLink, RefreshCw, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { type Inquiry } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { XCircle } from "lucide-react";

export default function SuperAdminInquiries() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: inquiriesData, isLoading, isPlaceholderData } = useQuery<{ inquiries: Inquiry[]; total: number }>({
    queryKey: ["/api/admin/inquiries", page, limit, debouncedSearch],
    queryFn: async () => {
      const url = new URL("/api/admin/inquiries", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for new inquiries
  });

  const inquiries = inquiriesData?.inquiries || [];
  const totalInquiries = inquiriesData?.total || 0;
  const totalPages = Math.ceil(totalInquiries / limit);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO title="Inquiries | Super Admin | AI TECH" description="Manage contact us inquiries and client requests." />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-4 md:p-10 bg-white dark:bg-neutral-900 rounded-2xl md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] md:text-sm font-semibold tracking-wide mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Client Communication Link
          </div>
          <h1 className="text-lg md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Contact <span className="text-orange-500">Inquiries</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-xs md:text-base font-medium tracking-tight">Review and respond to client messages from the public contact form.</p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Button 
            variant="default" 
            className="h-10 md:h-14 w-full md:w-auto px-6 md:px-8 rounded-xl md:rounded-2xl bg-orange-500 text-white border-none font-bold text-[10px] md:text-xs tracking-tight hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>

      <div className="premium-card bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-xl">
        <div className="p-4 md:p-10 border-b border-neutral-100 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-8">            <div className="space-y-1">
              <h3 className="text-xs md:text-sm font-semibold tracking-wide text-orange-500 flex items-center gap-2 md:gap-3 uppercase font-outfit">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                Inquiry Management
              </h3>
              <p className="text-[10px] font-bold tracking-tight text-neutral-400">
                Total Submissions: <span className="text-neutral-900 dark:text-white ml-2">{totalInquiries}</span>
              </p>
            </div>

          <div className="relative group/search min-w-0 md:min-w-[300px] w-full lg:w-96 flex-shrink-0 lg:flex-shrink">
            <Search className={cn(
              "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              isLoading ? "text-orange-500 animate-spin" : "text-neutral-400 group-focus-within/search:text-orange-500"
            )} />
            <Input
              placeholder="Search..."
              className="h-10 md:h-14 pl-11 md:pl-12 pr-11 md:pr-12 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800 rounded-xl md:rounded-2xl text-xs md:text-base font-semibold tracking-tight focus-visible:ring-orange-500/20 placeholder:text-neutral-400/40 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-0">
          <div className="hidden lg:block overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-xs md:text-sm font-bold text-neutral-500 dark:text-neutral-400 tracking-wide border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6 min-w-[300px]">Message Details</th>
                  <th className="px-10 py-6">Date Received</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin opacity-20" />
                        <span className="text-xs md:text-sm font-bold tracking-wide text-neutral-400">Fetching inquiries...</span>
                      </div>
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                        <MessageSquare className="w-12 h-12 text-neutral-400" />
                        <span className="text-xs md:text-sm font-bold tracking-wide text-neutral-400">No inquiries found yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-orange-500/[0.02] transition-all duration-300 group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm md:text-base font-bold tracking-tight text-neutral-900 dark:text-white font-outfit uppercase">
                            {inquiry.name}
                          </span>
                          <a 
                            href={`mailto:${inquiry.email}`}
                            className="text-xs md:text-sm font-medium text-neutral-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" /> {inquiry.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="max-w-md">
                          <p className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
                            "{inquiry.message}"
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3 text-neutral-400 text-xs md:text-sm font-bold">
                          <Clock className="w-4 h-4 text-orange-500/40" />
                          {inquiry.createdAt ? format(new Date(inquiry.createdAt), "MMM d, yyyy · HH:mm") : "N/A"}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          asChild
                          className="h-10 px-4 rounded-xl text-neutral-400 hover:text-white hover:bg-orange-500 transition-all border border-transparent hover:border-orange-400/50 group"
                        >
                          <a href={`mailto:${inquiry.email}?subject=RE: Inquiry from AI TECH`}>
                            <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Reply
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden p-4 space-y-4">
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto opacity-20" />
                <p className="text-xs font-bold text-neutral-400 tracking-tight">Fetching inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-20 text-center space-y-4 grayscale opacity-50">
                <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="text-xs font-bold text-neutral-400 tracking-tight">No inquiries found yet.</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white font-outfit uppercase">
                        {inquiry.name}
                      </span>
                      <a href={`mailto:${inquiry.email}`} className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5" /> {inquiry.email}
                      </a>
                    </div>
                    <div className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500/40" />
                      {inquiry.createdAt ? format(new Date(inquiry.createdAt), "MMM d, yy") : "N/A"}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 italic text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed shadow-inner">
                    "{inquiry.message}"
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                    className="w-full h-9 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-orange-500 transition-all border border-neutral-200 dark:border-neutral-800 hover:border-orange-500"
                  >
                    <a href={`mailto:${inquiry.email}?subject=RE: Inquiry from AI TECH`}>
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Send Reply
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>


        <div className="p-8 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 gap-4">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400 dark:text-neutral-500">
              Displaying <span className="text-neutral-900 dark:text-white">{inquiries.length}</span> of <span className="text-neutral-900 dark:text-white">{totalInquiries}</span> entries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="h-10 px-4 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-bold tracking-tight disabled:opacity-20 text-neutral-900 dark:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (totalPages > 5 && Math.abs(pageNum - page) > 2) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "h-10 w-10 p-0 rounded-xl text-xs font-bold transition-all",
                      page === pageNum ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-neutral-500"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-10 px-4 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-xs font-bold tracking-tight disabled:opacity-20 text-neutral-900 dark:text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
