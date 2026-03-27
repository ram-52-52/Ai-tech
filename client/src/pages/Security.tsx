import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Zap, ArrowLeft, ShieldCheck, Lock, Activity, Server, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-plus-jakarta selection:bg-orange-500/30">
      <SEO title="Security | AI TECH" />
      
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
            <div className="absolute top-10 right-0 w-[40rem] h-[40rem] bg-orange-500/5 blur-[128px] rounded-full" />
            <div className="absolute top-40 left-0 w-[30rem] h-[30rem] bg-orange-600/10 blur-[128px] rounded-full animate-pulse" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] animate-fade-in shadow-2xl">
            <ShieldCheck className="w-4 h-4" />
            Enterprise Infrastructure
          </div>
          <h1 className="font-outfit text-5xl md:text-8xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-[0.85]">
            Secure by <span className="text-orange-500 text-shadow-glow">Design</span>
          </h1>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 font-bold max-w-2xl mx-auto leading-relaxed">
            Your content strategy is your competitive advantage. We protect it with banking-grade encryption and strict multi-tenant isolation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 pt-10 border-t border-neutral-100 dark:border-neutral-900">
            {[
                { label: "SOC2", value: "Compliant" },
                { label: "Uptime", value: "99.99%" },
                { label: "SSL", value: "256-bit" }
            ].map((stat, i) => (
                <div key={i} className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-neutral-900 dark:text-white uppercase">{stat.value}</p>
                </div>
            ))}
          </div>
        </div>
      </header>

      {/* Security Pillars */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
            { 
              icon: <Lock className="w-8 h-8" />, 
              title: "Tenant Isolation", 
              desc: "Every account is sandboxed. Your blog data, API keys, and internal strategy never cross paths with other users."
            },
            { 
              icon: <Database className="w-8 h-8" />, 
              title: "Encrypted Backups", 
              desc: "Nightly AES-256 encrypted backups ensure your automated content pipeline is restorable within minutes in any scenario."
            },
            { 
              icon: <Key className="w-8 h-8" />, 
              title: "MFA Authentication", 
              desc: "Secure your workspace with industry-standard multi-factor authentication and role-based access controls."
            },
            { 
              icon: <Server className="w-8 h-8" />, 
              title: "Edge Delivery", 
              desc: "Content is delivered through globally distributed edge nodes with built-in DDoS protection and rate limiting."
            },
            { 
              icon: <Activity className="w-8 h-8" />, 
              title: "Audit Logs", 
              desc: "Monitor every platform action. Every AI generation and publication step is logged for absolute accountability."
            },
            { 
              icon: <ShieldCheck className="w-8 h-8" />, 
              title: "Security Audits", 
              desc: "We perform weekly vulnerability scans and semi-annual penetration tests to stay ahead of evolving threats."
            }
        ].map((pill, i) => (
            <div key={i} className="group p-10 bg-white dark:bg-neutral-950 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-orange-500 mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
                    {pill.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-4">{pill.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{pill.desc}</p>
            </div>
        ))}
      </section>

      {/* Security Architecture CTA */}
      <section className="max-w-7xl mx-auto py-20 px-6 pb-40">
        <div className="bg-neutral-900 dark:bg-neutral-950 p-12 md:p-20 rounded-[4rem] text-center space-y-8 relative overflow-hidden ring-1 ring-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[100px] rounded-full" />
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Your content is a <span className="text-orange-500">strategic asset</span>.</h2>
                <p className="text-neutral-400 font-bold text-lg leading-relaxed">We provide a full security whitepaper for enterprise clients. Learn more about our technical stack and compliance measures.</p>
                <div className="pt-8">
                     <Link href="/contact">
                        <Button className="h-16 px-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 transition-all hover:scale-105">
                            Download Security Whitepaper
                        </Button>
                     </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-100 dark:border-neutral-900 text-center">
         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.5em]">&copy; 2026 AI TECH • MISSION CRITICAL RELIABILITY</p>
      </footer>
    </div>
  );
}
