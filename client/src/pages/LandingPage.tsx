import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Zap,
  Target,
  Globe,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Layout,
  Sun,
  Moon,
  CheckCircle2,
  Twitter,
  Instagram,
  Linkedin,
  Terminal,
  FileText,
  X,
  Menu
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const { data: plans } = useQuery<any[]>({
    queryKey: ["/api/plans"]
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-500 overflow-x-hidden font-plus-jakarta">
      <SEO title="AI TECH | Automate Your Blog with AI" description="Professional AI-powered auto-blogging platform for high-velocity content production and multi-platform publishing." />

      {/* Navigation Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${scrolled || mobileMenuOpen
        ? 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 py-4 shadow-sm'
        : 'bg-transparent border-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Logo />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-neutral-500 hover:text-orange-500 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-neutral-500 hover:text-orange-500 transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-bold text-neutral-500 hover:text-orange-500 transition-colors">Pricing</a>
            <div className="flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-800 pl-10">
              <ThemeToggle />
              <Link href="/auth">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 h-11 font-black text-xs uppercase shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                  Launch App
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-orange-500 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="p-8 space-y-10">
              <div className="flex flex-col gap-6">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter hover:text-orange-500 transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter hover:text-orange-500 transition-colors">How it Works</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter hover:text-orange-500 transition-colors">Pricing</a>
              </div>

              <div className="pt-10 border-t border-neutral-100 dark:border-neutral-900">
                <Link href="/auth">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-16 font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 text-sm">
                    Get Started Now
                  </Button>
                </Link>
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-6">Secure Access & 24/7 Automation</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-44 pb-32 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black tracking-widest uppercase animate-fade-in">
              <Sparkles className="w-4 h-4" /> The Future of Content
            </div>
            <h1 className="font-outfit text-4xl md:text-6xl lg:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter leading-[1.1]">
              Fully Automate Your <br />
              <span className="text-orange-500">Blog in Any Language.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-neutral-500 dark:text-neutral-400 text-base md:text-xl font-medium leading-relaxed">
              AI writes, schedules, and auto-publishes high-quality, SEO-optimized content directly to your website while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/auth">
                <Button className="h-16 px-10 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-black shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 group">
                  Start with 2 Free Blogs
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-lg font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Terminal className="w-8 h-8 text-orange-500" />,
                  title: "AI SEO Content",
                  desc: "Generate long-form, SEO-optimized articles based on trending topics in your niche."
                },
                {
                  icon: <Globe className="w-8 h-8 text-orange-500" />,
                  title: "Multi-Language",
                  desc: "Publish content in English, Spanish, French, German, and Hindi automatically."
                },
                {
                  icon: <Zap className="w-8 h-8 text-orange-500" />,
                  title: "Auto-Publish",
                  desc: "Connect your WordPress, Medium, or LinkedIn and let AI handle the publishing."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-10 bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">{feature.title}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-outfit text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter mb-20">Simple 3-Step Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-px border-t-2 border-dashed border-neutral-200 dark:border-neutral-800 -z-10" />

              {[
                { step: 1, title: 'Connect Your Site', desc: 'Link your WordPress or Social accounts in seconds via API.' },
                { step: 2, title: 'Set Your Niche', desc: 'Choose your topics and target keywords for the AI.' },
                { step: 3, title: 'Go on Autopilot', desc: 'AI writes, schedules, and publishes content 24/7.' }
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white dark:bg-neutral-950 rounded-full border-4 border-orange-500 flex items-center justify-center text-2xl font-black text-orange-500 mb-8 shadow-xl">
                    {s.step}
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{s.title}</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-[250px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-neutral-50/30 dark:bg-neutral-900/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8 mb-24">
              <h2 className="font-outfit text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
                Choose Your <span className="text-orange-500">Speed</span>.
              </h2>

              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 bg-white dark:bg-neutral-950 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm scale-110">
                  <button
                    onClick={() => setIsYearly(false)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-orange-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsYearly(true)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${isYearly ? 'bg-orange-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  >
                    Yearly
                    {isYearly && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black shadow-lg shadow-orange-500/20 whitespace-nowrap animate-bounce">
                        SAVE 20%
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans?.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative p-12 bg-white dark:bg-neutral-950 rounded-[3.5rem] border transition-all duration-500 hover:-translate-y-2 ${plan.isMostPopular
                    ? 'border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                >
                  {plan.isMostPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-400 text-white px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-xl flex items-center gap-2">
                      Most Popular 🔥
                    </div>
                  )}

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-neutral-400 uppercase tracking-[0.3em]">{plan.name} Plan</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-neutral-900 dark:text-white tracking-tighter">₹{isYearly ? Math.floor(plan.priceYearly / 12) : plan.priceMonthly}</span>
                        <span className="text-xl font-bold text-neutral-400">/mo</span>
                      </div>
                      <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                        {plan.name === 'Starter' ? 'Perfect for beginners.' : plan.name === 'Growth' ? 'Perfect for Digital Marketers.' : 'Perfect for Agencies.'}
                      </p>
                    </div>

                    <Link href="/login">
                      <Button className={`w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${plan.isMostPopular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-orange-500/40'
                        : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-dashed border-neutral-200 dark:border-neutral-800'
                        }`}>
                        Get Started
                      </Button>
                    </Link>

                    <div className="space-y-6 pt-10 border-t border-neutral-100 dark:border-neutral-900/50">
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Everything in {plan.name}:</p>
                      <ul className="space-y-4">
                        {plan.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-4 text-[13px] font-bold text-neutral-600 dark:text-neutral-400 leading-tight group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                            <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-orange-500" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add-ons Banner */}
            <div className="mt-20 p-8 md:p-12 bg-neutral-900 dark:bg-black rounded-[3rem] border border-neutral-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-none">Need more <span className="text-orange-500">power</span>? 🚀</h4>
                  <p className="text-neutral-400 font-bold text-sm">Custom Add-ons available for high-volume content producers.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  <span className="bg-neutral-800/50 px-4 py-2 rounded-xl border border-neutral-700">Extra Blog: ₹50-₹150</span>
                  <span className="bg-neutral-800/50 px-4 py-2 rounded-xl border border-neutral-700">Premium SEO Optimization</span>
                  <span className="bg-neutral-800/50 px-4 py-2 rounded-xl border border-neutral-700">Custom AI Image Gen</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 bg-white dark:bg-neutral-950 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer" onClick={() => (window.location.href = "/")}>
              <Logo />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed max-w-sm">
              Next-generation SEO automation. We help forward-thinking teams scale content without breaking the bank.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors px-2">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors px-2">Terms</Link>
            <Link href="/security" className="hover:text-orange-500 transition-colors px-2">Security</Link>
            <Link href="/contact" className="hover:text-orange-500 transition-colors px-2">Contact</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-12 border-t border-neutral-100 dark:border-neutral-900 text-center text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} AI TECH • All rights reserved.
        </div>
      </footer>
    </div>
  );
}
