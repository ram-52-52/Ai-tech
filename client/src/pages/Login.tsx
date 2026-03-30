import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SEO } from "@/components/SEO";

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isPending, setIsPending] = useState(false);

  if (user) {
    return <Redirect to={user.role === 'superadmin' ? '/superadmin/dashboard' : '/dashboard'} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation check before submitting
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsPending(true);
    try {
      await login(username, password);
    } catch (error) {
      setErrors({ password: "Invalid username or password" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6 transition-colors duration-500 font-plus-jakarta">
      <SEO title="Login | AI Core" description="Access your AI Core dashboard to manage and generate high-quality blog content." />
      
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <Logo showText={false} className="justify-center mb-6" size={60} />
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl tracking-tight text-neutral-900 dark:text-white leading-none">
            Welcome Back
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-base tracking-tight">
            Sign in to your AI Core dashboard
          </p>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="pt-10 pb-4 px-10">
            <CardTitle className="text-xl font-bold text-neutral-800 dark:text-white">Account Login</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-neutral-500 dark:text-neutral-400 ml-1">Username or Email</label>
                <Input
                  className={`bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 h-14 rounded-xl px-5 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all ${errors.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="name@company.com"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                />
                {errors.username && <p className="text-red-500 text-xs md:text-sm font-bold ml-1">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs md:text-sm font-semibold text-neutral-500 dark:text-neutral-400">Password</label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className={`bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 h-14 rounded-xl px-5 pr-12 text-sm font-medium focus:ring-2 focus:ring-orange-500 transition-all ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs md:text-sm font-bold ml-1">{errors.password}</p>}
              </div>

                <Button 
                type="submit" 
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm md:text-base shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] font-outfit border-none" 
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>Continue <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs md:text-sm font-semibold text-neutral-400 dark:text-neutral-600 tracking-wide">
            Secure Enterprise Encryption • Private AI Data
          </p>
        </div>
      </div>
    </div>
  );
}
