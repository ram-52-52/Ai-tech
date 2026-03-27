import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Zap, ArrowLeft, Shield, Eye, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-plus-jakarta selection:bg-orange-500/30">
      <SEO title="Privacy Policy | AI TECH" />
      
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
            <div className="absolute top-20 right-0 w-96 h-96 bg-orange-500/10 blur-[128px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[128px] rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            <Shield className="w-3.5 h-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="font-outfit text-5xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            Privacy <span className="text-orange-500">Policy</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 font-bold max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your data and your identity. This policy explains how we handle your information with absolute transparency.
          </p>
          <div className="pt-8 flex items-center justify-center gap-8 border-t border-neutral-100 dark:border-neutral-900 max-w-xs mx-auto">
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Last Updated</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">March 27, 2026</p>
            </div>
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Version</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">v2.4.0</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Summary Grid */}
      <section className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
                <Eye className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">Full Transparency</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">We never sell your data. We only use it to power your AI content production and experience.</p>
        </div>
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
                <Lock className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">Bank-Grade Security</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">Every client is isolated with unique identifiers, ensuring your SEO strategy remains yours alone.</p>
        </div>
        <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
                <Globe className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">GDPR Ready</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">We comply with global privacy standards to ensure your data stays safe no matter where you are.</p>
        </div>
      </section>

      {/* Detailed Content */}
      <main className="max-w-4xl mx-auto py-20 px-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-16">
          <section className="space-y-6">
            <h2 className="font-outfit text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none flex items-center gap-4">
                <span className="text-orange-500 text-sm font-black">01</span> Information Collection
            </h2>
            <div className="p-8 rounded-[2rem] bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed space-y-4">
                <p>We collect information you provide directly to us when you create an account, including your name, email, and billing details. Additionally, we store the metadata required to generate and publish your content.</p>
                <p>Technical data like IP addresses and browser types are collected automatically for security logging and platform optimization.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-outfit text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none flex items-center gap-4">
                <span className="text-orange-500 text-sm font-black">02</span> Usage & Strategy
            </h2>
            <div className="p-8 rounded-[2rem] bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-bold leading-relaxed">
                <p>Your content niche, keywords, and publication schedules are used exclusively for your account. AI TECH does not use one client's strategy to train models for another, ensuring absolute competitive isolation.</p>
            </div>
          </section>

          <section className="space-y-6 text-center pt-20">
            <h3 className="text-2xl font-black uppercase text-neutral-900 dark:text-white leading-none">Questions about your data?</h3>
            <p className="text-neutral-500 font-bold">Our compliance team is ready to help you.</p>
            <div className="pt-6">
               <Link href="/contact">
                    <Button className="h-14 px-10 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
                        Contact Privacy Team
                    </Button>
               </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Space Fix */}
      <footer className="py-20 border-t border-neutral-100 dark:border-neutral-900 text-center">
         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.5em]">&copy; 2026 AI TECH • SECURITY & PRIVACY FIRST</p>
      </footer>
    </div>
  );
}
