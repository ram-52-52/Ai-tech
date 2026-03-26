import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserPlus, Mail, ShieldAlert, LogIn, Search, Loader2, CheckCircle2, Edit2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 dark">
      <SEO 
        title="Super Admin Control" 
        description="Platform-wide administrative controls for user management, provisioning, and impersonation." 
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="w-full md:w-auto text-left">
          <h1 className="text-2xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight pb-2">
            User Management
          </h1>
          <p className="text-slate-300 mt-1 text-sm md:text-lg font-medium">Manage SaaS users and monitor platform usage.</p>
        </div>
        <Button 
          onClick={() => setIsAddUserOpen(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] rounded-2xl px-8 h-14 font-bold text-base transition-all duration-300 hover:-translate-y-1 text-white border border-indigo-500/50"
        >
          <UserPlus className="w-5 h-5 mr-3" />
          Provision Client
        </Button>
      </div>

      <Card className="border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-border/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              SaaS Users
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-secondary/30 border-white/10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-secondary/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 font-bold">User / Email</th>
                  <th className="px-6 py-4 font-bold">Client ID</th>
                  <th className="px-6 py-4 font-bold text-center">Plan</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5"><Skeleton className="h-10 w-48 rounded-lg" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-3 w-48" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-6 py-5"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : filteredUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-primary border border-primary/20">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs opacity-60">
                      {user.clientId}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'superadmin' 
                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                        : 'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsInfoOpen(true);
                          }}
                          className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg group/btn relative"
                          title="View Usage"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsMailOpen(true);
                          }}
                          className="hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg group/btn relative"
                          title="Email User"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        {user.role !== 'superadmin' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => impersonateMutation.mutate(user.id)}
                            className="hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-400 rounded-lg group/btn relative"
                            disabled={impersonateMutation.isPending}
                            title="Login As"
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
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-white/20 dark:border-white/5 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add SaaS Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70">Client Username / Email</label>
              <Input 
                placeholder="e.g. client@example.com" 
                className="rounded-xl bg-secondary/50"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70">Manual Password</label>
              <Input 
                type="password"
                placeholder="Set secure password" 
                className="rounded-xl bg-secondary/50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70">Subscription Plan</label>
              <select 
                className="w-full h-10 px-3 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 ring-primary/20"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                <option value="Free Trial">Free Trial</option>
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Pro">Pro</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={() => createUserMutation.mutate({ username: newUsername, password: newPassword, plan: newPlan })}
              disabled={!newUsername || !newPassword || createUserMutation.isPending}
              className="rounded-xl shadow-lg shadow-primary/20"
            >
              {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Create and Provision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Credentials Modal */}
      <Dialog open={isMailOpen} onOpenChange={setIsMailOpen}>
        <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-white/20 dark:border-white/5 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Send Credentials</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Mail className="w-8 h-8" />
            </div>
            <p className="text-center text-muted-foreground px-4">
              Send login details to <span className="text-foreground font-semibold">{selectedUser?.username}</span>. 
              You can provide an alternate email below.
            </p>
            <div className="w-full space-y-2 mt-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-50">Alternate Email (Optional)</label>
              <Input 
                placeholder="Send to different email..." 
                className="rounded-xl bg-secondary/50 py-6"
                value={alternateEmail}
                onChange={(e) => setAlternateEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center flex gap-2">
            <Button variant="ghost" onClick={() => setIsMailOpen(false)} className="rounded-xl px-8">Cancel</Button>
            <Button 
              onClick={() => sendCredentialsMutation.mutate({ id: selectedUser!.id, email: alternateEmail })}
              disabled={sendCredentialsMutation.isPending}
              className="rounded-xl px-12 bg-primary shadow-xl shadow-primary/30"
            >
              {sendCredentialsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2 text-white" />}
              Send Welcome Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-white/20 dark:border-white/5 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Plan Usage Details</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-6 glass-panel rounded-3xl space-y-4 bg-gradient-to-br from-primary/5 to-blue-500/5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold opacity-70 uppercase tracking-widest text-[10px]">Current Plan</span>
                <span className="font-bold text-primary">{selectedUser?.plan}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold opacity-70 uppercase tracking-widest text-[10px]">Monthly Limit</span>
                <span className="font-bold">
                  {selectedUser?.plan === 'Free Trial' ? 2 : 
                   selectedUser?.plan === 'Starter' ? 3 :
                   selectedUser?.plan === 'Growth' ? 10 : 30} blogs
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold opacity-70 uppercase tracking-widest text-[10px]">Blogs Used</span>
                <span className="font-bold">{selectedUser?.blogsGeneratedThisMonth || 0}</span>
              </div>
              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-primary h-full transition-all duration-1000" 
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
          </div>
          <DialogFooter>
            <Button onClick={() => setIsInfoOpen(false)} className="rounded-xl w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
