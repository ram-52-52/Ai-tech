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
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AuroraBackground } from "@/components/AuroraBackground";

function Router() {
  return (
    <div className="min-h-screen flex text-foreground relative selection:bg-primary/30">
      <AuroraBackground />
      <Sidebar />
      <main className="flex-1 w-full pt-20 px-4 md:pt-8 md:pr-8 md:pl-[300px] lg:pr-12 lg:pl-[320px] pb-12 overflow-x-hidden relative z-0">
        <div className="max-w-7xl mx-auto h-full w-full">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/blogs" component={BlogList} />
                <Route path="/blogs/:id" component={EditBlog} />
                <Route path="/blogs/:id/view" component={BlogView} />
                <Route path="/generate" component={Generate} />
                <Route path="/trends" component={Trends} />
                <Route path="/settings" component={Settings} />
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
