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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/blogs" component={BlogList} />
            <Route path="/blogs/:id" component={EditBlog} />
            <Route path="/generate" component={Generate} />
            <Route path="/trends" component={Trends} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
