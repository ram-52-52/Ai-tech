import { Button } from "@/components/ui/button";
import { Home, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden p-6">
      <SEO title="Void Lost | AI TECH" description="Signal lost in the neural manifold." />
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
      
      <div className="relative z-10 text-center space-y-8 max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs md:text-sm font-bold tracking-wide mb-4">
          <ShieldAlert className="w-3.5 h-3.5" /> Signal Interference
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
            Void<span className="text-primary ml-4">Lost</span>
          </h1>
          <p className="text-muted-foreground/40 text-xs md:text-sm font-bold tracking-[0.1em]">The requested manifold does not exist in the current neural buffer.</p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="h-16 px-10 bg-primary hover:bg-orange-600 rounded-2xl font-bold tracking-wide text-xs md:text-sm shadow-2xl shadow-primary/20 group">
              <Home className="w-4 h-4 mr-3 group-hover:-translate-y-0.5 transition-transform" />
              Return to Hub
            </Button>
          </Link>
          <Button variant="ghost" className="h-16 px-10 rounded-2xl font-bold tracking-wide text-xs md:text-sm border border-white/5 hover:bg-white/5 text-muted-foreground/60 transition-all">
            Report Anomaly
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 opacity-30">
          <Logo showText={true} size={32} className="hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
