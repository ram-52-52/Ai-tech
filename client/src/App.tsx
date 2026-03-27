import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import BlogList from "@/pages/BlogList";
import Generate from "@/pages/Generate";
import Trends from "@/pages/Trends";
import EditBlog from "@/pages/EditBlog";
import BlogView from "@/pages/BlogView";
import Settings from "@/pages/Settings";
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import SuperAdminUsers from "@/pages/superadmin/Users";
import SuperAdminBilling from "@/pages/superadmin/Billing";
import SuperAdminLogs from "@/pages/superadmin/Logs";
import SuperAdminPlan from "@/pages/superadmin/AIQuotaPlan";
import SuperAdminBlogs from "@/pages/superadmin/SuperAdminBlogs";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AuroraBackground } from "@/components/AuroraBackground";

import { MobileHeader } from "@/components/MobileHeader";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/Login";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { SUPERADMIN_ROUTES } from "@/constants/navigationConstant";

import LandingPage from "@/pages/LandingPage";
import PrivacyPage from "@/pages/Privacy";
import TermsPage from "@/pages/Terms";
import SecurityPage from "@/pages/Security";
import ContactPage from "@/pages/Contact";
import ScrollToTop from "@/components/ScrollToTop";

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // Allow unauthenticated users to see public pages
  const publicRoutes = ["/", "/login", "/privacy", "/terms", "/security", "/contact"];
  const isPublicRoute = publicRoutes.includes(location);
  
  if (!user && !isPublicRoute) {
    setLocation("/login");
    return null;
  }

  // Strict Routing & Role Protection
  const isSuperAdminRoute = SUPERADMIN_ROUTES.some(route => location === route || location.startsWith(`${route}/`));
  if (user && user.role !== 'superadmin' && isSuperAdminRoute) {
    setLocation("/dashboard");
    return null;
  }

  // Redirect authenticated users from root to their respective dashboards
  if (user && (location === "/" || location === "")) {
    if (user.role === 'superadmin') {
      setLocation("/superadmin/dashboard");
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

  return (
    <div className="min-h-screen flex bg-stone-50 dark:bg-neutral-950 text-foreground relative selection:bg-primary/30 font-plus-jakarta">
      {user && <Sidebar />}
      {user && <MobileHeader />}
      <main className={`flex-1 w-full pb-12 overflow-x-hidden relative z-0 ${user ? 'pt-28 px-4 md:pt-28 lg:pt-8 lg:pr-8 lg:pl-[340px] xl:pr-12 xl:pl-[360px]' : 'w-full'}`}>
        <div className={user ? "max-w-7xl mx-auto h-full w-full" : "w-full"}>
          <AnimatePresence mode="wait">
            <PageTransition>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/">
                  {user ? null : <LandingPage />}
                </Route>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/blogs" component={BlogList} />
                <Route path="/blogs/:id" component={EditBlog} />
                <Route path="/blogs/:id/view" component={BlogView} />
                <Route path="/generate" component={Generate} />
                <Route path="/trends" component={Trends} />
                <Route path="/settings" component={Settings} />
                {user?.role === 'superadmin' && (
                  <>
                    <Route path="/superadmin" component={SuperAdminUsers} />
                    <Route path="/superadmin/users" component={SuperAdminUsers} />
                    <Route path="/superadmin/dashboard" component={SuperAdminDashboard} />
                    <Route path="/superadmin/billing" component={SuperAdminBilling} />
                    <Route path="/superadmin/logs" component={SuperAdminLogs} />
                    <Route path="/superadmin/plan" component={SuperAdminPlan} />
                    <Route path="/superadmin/blogs" component={SuperAdminBlogs} />
                  </>
                )}
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/terms" component={TermsPage} />
                <Route path="/security" component={SecurityPage} />
                <Route path="/contact" component={ContactPage} />
                <Route component={NotFound} />
              </Switch>
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AuthProvider>
            <ScrollToTop />
            <Router />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
