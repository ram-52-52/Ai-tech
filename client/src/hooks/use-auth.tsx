import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleGetCurrentUser, handleLogin, handleLogout } from "@/services/api/authAPI";

type User = {
  id: number;
  clientId: string;
  username?: string;
  role: 'user' | 'superadmin';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    handleGetCurrentUser()
      .then((res) => {
        if (res.success) setUser(res.data);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await handleLogin({ username, password });
    
    if (res.success) {
      setUser(res.data.user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: res.error || "Invalid username or password",
        variant: "destructive",
      });
      throw new Error(res.error || "Login failed");
    }
  };

  const logout = async () => {
    const res = await handleLogout();
    if (res.success) {
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } else {
      console.error("Logout failed", res.error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
