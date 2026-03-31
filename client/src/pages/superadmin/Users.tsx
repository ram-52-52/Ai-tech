import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserPlus, Mail, ShieldAlert, LogIn, Search, Loader2, CheckCircle2, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { handleGetAllUsers, handleCreateUser, handleSendCredentials, handleImpersonate } from "@/services/api/superAdminAPI";

interface User {
  id: number;
  username: string;
  clientId: string;
  role: string;
  plan: string;
  blogsGeneratedThisMonth: number;
  createdAt: string;
}

export default function SuperAdminUsers() {
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [search, setSearch] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState("Free Trial");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await handleGetAllUsers();
      if (!res.success) throw new Error(res.error || "Failed to fetch users");
      return res.data;
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ username, password, plan }: { username: string; password?: string; plan?: string }) => {
      const res = await handleCreateUser({ username, password, plan });
      if (!res.success) throw new Error(res.error || "Failed to create user");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddUserOpen(false);
      setNewUsername("");
      setNewPassword(""); // Clean up
      toast({ title: "User Created", description: "SaaS client has been provisioned." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: async ({ id, email }: { id: number; email?: string }) => {
      const res = await handleSendCredentials(id, { alternateEmail: email });
      if (!res.success) throw new Error(res.error || "Failed to send credentials");
      return res.data;
    },
    onSuccess: () => {
      setIsMailOpen(false);
      setSelectedUser(null);
      setAlternateEmail("");
      toast({ title: "Success", description: "Credentials sent successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await handleImpersonate(id);
      if (!res.success) throw new Error(res.error || "Failed to impersonate");
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Logged In", description: "You are now in God Mode." });
      window.location.href = "/";
    },
  });

  const filteredUsers = users?.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.clientId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-plus-jakarta">
      <SEO
        title="Accounts | AI TECH"
        description="Global platform oversight, client provisioning, and account management."
      />

      {/* Header Module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-5 md:p-10 bg-white dark:bg-neutral-900 rounded-3xl md:rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-xl relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs md:text-sm font-semibold tracking-wide mb-4">
            <Users className="w-3.5 h-3.5" /> Platform Registry
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Account<span className="text-orange-500 sm:ml-4 block sm:inline">Management</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm md:text-base font-medium tracking-tight">Monitor client accounts, provision new instances, and manage global permissions.</p>
        </div>
        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 rounded-2xl px-10 h-16 font-bold text-sm tracking-tight transition-all duration-500 hover:-translate-y-1 text-white border-none group"
        >
          <UserPlus className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
          Provision Account
        </Button>
      </div>

      <div className="premium-card rounded-[2rem] md:rounded-[3rem]">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.95rem] md:rounded-[2.95rem] overflow-hidden shadow-2xl">
          <div className="p-4 md:p-10 border-b border-neutral-200 dark:border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold tracking-wide text-neutral-900 dark:text-white">Client Directory</h3>
                  <p className="text-[10px] md:text-sm text-neutral-500 dark:text-neutral-400 font-semibold tracking-wide">Active accounts in system registry</p>
                </div>
              </div>
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                <Input
                  placeholder="Filter by identity..."
                  className="pl-12 bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-neutral-800 rounded-2xl h-14 font-medium text-xs tracking-tight focus:border-orange-500/50 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="hidden md:block overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-500 text-xs md:text-sm font-bold tracking-wide border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 lg:px-6 xl:px-10 py-4 lg:py-6">Account Identity</th>
                  <th className="px-4 lg:px-6 xl:px-10 py-4 lg:py-6">Unique ID</th>
                  <th className="px-4 lg:px-6 xl:px-10 py-4 lg:py-6 text-center">Subscription</th>
                  <th className="px-4 lg:px-6 xl:px-10 py-4 lg:py-6 text-center">Role</th>
                  <th className="px-4 lg:px-6 xl:px-10 py-4 lg:py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8"><Skeleton className="h-12 w-48 rounded-xl bg-white/5" /></td>
                      <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8"><Skeleton className="h-4 w-48 bg-white/5" /></td>
                      <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8"><Skeleton className="h-8 w-24 rounded-full mx-auto bg-white/5" /></td>
                      <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8"><Skeleton className="h-8 w-16 rounded-full mx-auto bg-white/5" /></td>
                      <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8 text-right"><Skeleton className="h-10 w-32 rounded-xl ml-auto bg-white/5" /></td>
                    </tr>
                  ))
                ) : filteredUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center p-[1px] group-hover:bg-orange-500/20 transition-all duration-500">
                          <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-orange-500 text-base md:text-lg shadow-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-lg text-foreground tracking-tight group-hover:text-orange-500 transition-colors">{user.username}</p>
                          <p className="text-[10px] md:text-sm text-neutral-500 dark:text-neutral-400 font-medium tracking-wide mt-1">INITIATED: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8">
                      <span className="px-2.5 py-1 bg-white/5 rounded-xl border border-white/5 font-mono text-[10px] md:text-xs text-muted-foreground tracking-tighter opacity-60 whitespace-nowrap">
                        {user.clientId}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8 text-center">
                      <span className="px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide bg-orange-500/10 text-orange-500 border border-orange-500/20 whitespace-nowrap">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-wide border ${user.role === 'superadmin'
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-10 py-4 lg:py-8">
                      <div className="flex justify-end gap-3 text-glow">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsInfoOpen(true);
                          }}
                          className="w-10 h-10 bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-xl transition-all"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsMailOpen(true);
                          }}
                          className="w-10 h-10 bg-white/5 border-white/5 hover:bg-primary hover:text-white rounded-xl transition-all"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        {user.role !== 'superadmin' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => impersonateMutation.mutate(user.id)}
                            className="w-10 h-10 bg-white/5 border-white/5 hover:bg-emerald-500 hover:text-white rounded-xl transition-all group/btn"
                            disabled={impersonateMutation.isPending}
                          >
                            {impersonateMutation.isPending && impersonateMutation.variables === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogIn className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-neutral-200 dark:divide-neutral-800">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))
            ) : filteredUsers?.map((user) => (
              <div key={user.id} className="p-3 xs:p-4 space-y-4 bg-white dark:bg-neutral-900/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 md:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center font-bold text-orange-500 text-sm md:text-lg border border-orange-500/20 flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 dark:text-white truncate text-xs md:text-base">{user.username}</p>
                      <p className="text-[8px] md:text-[9px] text-neutral-500 uppercase tracking-widest font-black mt-0.5">
                        JOINED: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border flex-shrink-0 ${user.role === 'superadmin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {user.role}
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Tier</p>
                    <p className="text-[10px] font-bold text-orange-500">{user.plan}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Client ID</p>
                    <p className="text-[8px] font-mono text-neutral-500 truncate">{user.clientId}</p>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-10 rounded-xl text-[9px] font-bold border-neutral-200 dark:border-neutral-800 px-2"
                      onClick={() => { setSelectedUser(user); setIsInfoOpen(true); }}
                    >
                      <Info className="w-3 h-3 mr-1" /> Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-10 rounded-xl text-[9px] font-bold border-neutral-200 dark:border-neutral-800 px-2"
                      onClick={() => { setSelectedUser(user); setIsMailOpen(true); }}
                    >
                      <Mail className="w-3 h-3 mr-1" /> Mail
                    </Button>
                  </div>
                  {user.role !== 'superadmin' && (
                    <Button 
                      className="w-full xs:w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 shadow-lg shadow-emerald-500/20 px-0"
                      onClick={() => impersonateMutation.mutate(user.id)}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Provision Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
            <div className="space-y-3">
              <label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Email Identity</label>
              <Input
                placeholder="Client Email Address"
                className="rounded-2xl h-14 bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-neutral-800 font-medium text-sm md:text-base px-6 w-full"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Password Assignment</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                className="rounded-2xl h-14 bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-neutral-800 font-medium tracking-tight text-sm md:text-base px-6 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Tier Assignment</label>
              <div className="grid grid-cols-2 gap-3">
                {['Free Trial', 'Starter', 'Growth', 'Pro'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setNewPlan(plan)}
                    className={`h-9 md:h-11 rounded-xl border-2 font-semibold text-[10px] md:text-sm tracking-wide transition-all ${newPlan === plan
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-white/5 text-neutral-400 hover:border-orange-500/20'
                      }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 md:pt-6 border-t border-neutral-100 dark:border-neutral-800 flex gap-4 mt-auto">
            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="h-10 md:h-12 rounded-xl font-semibold text-sm md:text-base px-6 md:px-8 hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200 dark:border-neutral-800 transition-colors text-neutral-900 dark:text-white">Cancel</Button>
            <Button
              onClick={() => createUserMutation.mutate({ username: newUsername, password: newPassword, plan: newPlan })}
              disabled={!newUsername || !newPassword || createUserMutation.isPending}
              className="h-10 md:h-12 flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm md:text-base shadow-xl shadow-orange-500/20 text-white border-none"
            >
              {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <CheckCircle2 className="w-4 h-4 mr-3" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-center text-neutral-900 dark:text-white">Verify Identity & Send Access</DialogTitle>
          </DialogHeader>
          <div className="py-10 flex flex-col items-center gap-8 max-h-[60vh] overflow-y-auto scrollbar-hide px-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
                <Mail className="w-10 h-10 animate-pulse" />
              </div>
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
            </div>
            <div className="space-y-4 text-center">
              <p className="text-sm md:text-base font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed tracking-tight">
                Sending access credentials to <span className="text-orange-500 font-bold underline decoration-orange-500/30 underline-offset-4">{selectedUser?.username}</span> via encrypted relay.
              </p>
            </div>
            <div className="w-full space-y-3 mt-4">
              <label className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Secondary Email Address (Optional)</label>
              <Input
                placeholder="Secondary email identity"
                className="rounded-2xl h-12 md:h-14 bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-neutral-800 font-medium tracking-tight text-sm md:text-base px-6 focus:border-orange-500/50 transition-all w-full"
                value={alternateEmail}
                onChange={(e) => setAlternateEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center flex gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-6 md:pt-8 mt-auto">
            <Button variant="ghost" onClick={() => setIsMailOpen(false)} className="h-10 md:h-13 rounded-2xl font-semibold text-sm md:text-base px-6 md:px-8 hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200 dark:border-neutral-800 transition-colors text-neutral-900 dark:text-white">Cancel</Button>
            <Button
              onClick={() => sendCredentialsMutation.mutate({ id: selectedUser!.id, email: alternateEmail })}
              disabled={sendCredentialsMutation.isPending}
              className="h-10 md:h-13 px-8 md:px-12 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-sm md:text-base shadow-2xl shadow-orange-500/30 flex-1 text-white border-none"
            >
              <Mail className="w-4 h-4 mr-3" />
              Send Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="w-[95vw] max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Account Analytics</DialogTitle>
          </DialogHeader>
          <div className="py-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide px-2">
            <div className="p-4 md:p-10 premium-card rounded-[2rem] space-y-8 bg-white/[0.02]">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-xs md:text-sm tracking-wide text-neutral-500 dark:text-neutral-400">Assigned Tier</span>
                <span className="font-bold text-xs md:text-sm text-orange-500">{selectedUser?.plan}</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold tracking-wide text-neutral-900 dark:text-white">Resource Capacity</h4>
                    <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-medium">Current month utilization</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">{selectedUser?.blogsGeneratedThisMonth || 0}</span>
                    <span className="text-xs md:text-sm font-medium text-neutral-400 dark:text-neutral-500 ml-2">/ {
                      selectedUser?.plan === 'Free Trial' ? 2 :
                        selectedUser?.plan === 'Starter' ? 3 :
                          selectedUser?.plan === 'Growth' ? 10 : 30
                    }</span>
                  </div>
                </div>

                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden p-1 border border-white/5">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, ((selectedUser?.blogsGeneratedThisMonth || 0) / (
                        selectedUser?.plan === 'Free Trial' ? 2 :
                          selectedUser?.plan === 'Starter' ? 3 :
                            selectedUser?.plan === 'Growth' ? 10 : 30
                      )) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 text-center transition-all hover:bg-neutral-100 dark:hover:bg-white/10">
                  <p className="text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-500 mb-2">System Usage</p>
                  <p className="font-bold text-xl text-neutral-900 dark:text-white">{(Math.min(100, ((selectedUser?.blogsGeneratedThisMonth || 0) / (
                    selectedUser?.plan === 'Free Trial' ? 2 :
                      selectedUser?.plan === 'Starter' ? 3 :
                        selectedUser?.plan === 'Growth' ? 10 : 30
                  )) * 100)).toFixed(1)}%</p>
                </div>
                <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 text-center transition-all hover:bg-neutral-100 dark:hover:bg-white/10">
                  <p className="text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-500 mb-2">Health Status</p>
                  <p className="font-bold text-xl text-emerald-500">Optimal</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 md:pt-6 mt-auto">
            <Button onClick={() => setIsInfoOpen(false)} className="h-11 md:h-14 rounded-2xl font-bold text-sm md:text-base w-full bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border-none text-neutral-900 dark:text-white">Close Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
