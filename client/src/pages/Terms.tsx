import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Zap, ArrowLeft, Gavel, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-plus-jakarta selection:bg-orange-500/30">
      <SEO title="Terms of Service | AI TECH" />

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 group cursor-pointer scale-90 md:scale-100 origin-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-outfit font-black text-xl tracking-tighter text-neutral-900 dark:text-white uppercase">AI TECH</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-orange-500 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-20 left-0 w-96 h-96 bg-orange-500/5 blur-[128px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 blur-[128px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            <Gavel className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="font-outfit text-5xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            Terms of <span className="text-orange-500">Service</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 font-bold max-w-2xl mx-auto leading-relaxed">
            By using AI TECH, you agree to these legal terms. We've made them simple to read because your time is valuable.
          </p>
          <div className="pt-8 flex items-center justify-center gap-8 border-t border-neutral-100 dark:border-neutral-900 max-w-xs mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Last Update</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Mar 27, 2026</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Status</p>
              <div className="flex items-center gap-1.5 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Active</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Core Rules Section */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <CheckCircle2 />, title: "Content Ownership", desc: "You own 100% of the content our AI generates for you." },
            { icon: <AlertCircle />, title: "Fair Use", desc: "No automated scraping or platform abuse allowed." },
            { icon: <FileText />, title: "Account Safety", desc: "Protect your credentials; you are responsible for account activity." },
            { icon: <Zap />, title: "Service Level", desc: "We strive for 99.9% uptime for all premium content pipelines." }
          ].map((rule, i) => (
            <div key={i} className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 bg-white dark:bg-black rounded-xl flex items-center justify-center text-orange-500 mb-6 shadow-sm">
                {rule.icon}
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">{rule.title}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Legal Content */}
      <main className="max-w-4xl mx-auto py-20 px-6">
        <div className="space-y-20">
          <section className="space-y-8">
            <div className="flex items-center gap-4 group">
              <span className="text-4xl font-outfit font-black text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity">01</span>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Agreement to Terms</h2>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed">
              <p>Welcome to AI TECH. These Terms of Service ("Terms") govern your access to and use of our platform. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to any part of these terms, you may not use our platform.</p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 group">
              <span className="text-4xl font-outfit font-black text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity">02</span>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Subscription & Billing</h2>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed space-y-4">
              <p>Subscriptions are billed in advance on a recurring monthly or yearly basis. You may cancel your subscription at any time through your dashboard. No refunds are provided for partial subscription periods.</p>
              <p>AI TECH reserves the right to adjust pricing for future billing cycles with a minimum of 30 days notice to all active clients.</p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 group">
              <span className="text-4xl font-outfit font-black text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity">03</span>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">AI-Generated Content</h2>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed">
              <p>While our AI is sophisticated, you are responsible for reviewing and verifying the accuracy of any content published via AI TECH. We provide the tools, but final editorial control and liability remain with you.</p>
            </div>
          </section>

          <section className="pt-10 text-center">
            <div className="p-12 rounded-[3.5rem] bg-orange-500 dark:bg-orange-500/10 border border-orange-500 text-white dark:text-orange-500 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Ready to automate safely?</h3>
              <p className="font-bold max-w-md mx-auto opacity-80 dark:text-neutral-400">By continuing to use our dashboard, you agree to all terms outlined above.</p>
              <div className="pt-4">
                <Link href="/login">
                  <Button className="h-14 px-12 rounded-2xl bg-white dark:bg-orange-500 text-orange-500 dark:text-white font-black uppercase tracking-widest hover:scale-105 transition-all border-none hover:bg-orange-0 hover:text-black dark:hover:bg-white dark:hover:text-white shadow-xl shadow-orange-500/10">
                    I Understand & Proceed
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-100 dark:border-neutral-900 text-center">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.5em]">&copy; 2026 AI TECH • LEGAL COMPLIANCE TEAM</p>
      </footer>
    </div>
  );
}
