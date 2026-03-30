import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Zap, ArrowLeft, Mail, MessageSquare, MapPin, Send, CheckCircle2, Globe, Twitter, Linkedin, Github } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    async function onSubmit(data: ContactFormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to send message");

            setIsSuccess(true);
            toast({
                title: "Message Sent!",
                description: "We've received your inquiry and will get back to you shortly.",
            });
            form.reset();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send your message. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white font-plus-jakarta selection:bg-orange-500/30 flex flex-col">
            <SEO title="Contact Us | AI TECH" />

            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900 py-4 px-4 md:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/">
                        <div className="flex items-center gap-2 group cursor-pointer scale-90 md:scale-100 origin-left">
                            <Logo />
                        </div>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="text-[11px] md:text-xs font-black uppercase tracking-tight md:tracking-widest text-neutral-500 hover:text-orange-500 gap-1 md:gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="flex-1">
                <div className="max-w-7xl mx-auto pt-40 pb-24 px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
                    {/* Background Glows */}
                    <div className="absolute top-40 right-0 w-96 h-96 bg-orange-500/10 blur-[128px] rounded-full -z-10" />
                    <div className="absolute bottom-40 left-0 w-96 h-96 bg-orange-500/5 blur-[128px] rounded-full -z-10" />

                    {/* Left Column: Info */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                <MessageSquare className="w-4 h-4" />
                                Support Center
                            </div>
                            <h1 className="font-outfit text-5xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-[0.85]">
                                Let's <span className="text-orange-500">Connect</span>.
                            </h1>
                            <p className="text-xl text-neutral-500 dark:text-neutral-400 font-bold max-w-lg leading-relaxed">
                                Have questions about our AI workflows? Need a custom enterprise plan? We're here to help you scale your content.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: <Mail />, label: "Email", value: "support@aitech.com", sub: "24/7 Response Time" },
                                { icon: <Globe />, label: "Global Offices", value: "Remote First", sub: "Silicon Valley & Mumbai" },
                                { icon: <MapPin />, label: "Headquarters", value: "AI Valley, Tech Hub", sub: "Building 42, Floor 7" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{item.label}</p>
                                        <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">{item.value}</p>
                                        <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12 space-y-6">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Follow our journey</p>
                            <div className="flex gap-4">
                                {[<Twitter />, <Linkedin />, <Github />].map((icon, i) => (
                                    <Button key={i} variant="outline" size="icon" className="w-12 h-12 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/50 hover:bg-orange-500/5 text-neutral-500 hover:text-orange-500 transition-all">
                                        {icon}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="relative">
                        {isSuccess ? (
                            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl md:rounded-[3.5rem] p-8 md:p-16 border border-neutral-100 dark:border-neutral-800 text-center space-y-8 animate-fade-in mx-auto max-w-[calc(100vw-2rem)] md:max-w-none">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div className="space-y-4 px-2">
                                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Inquiry Received</h2>
                                    <p className="text-xs md:text-base text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">
                                        Thank you for reaching out. A platform specialist will review your request and get back to you within 4 business hours.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsSuccess(false)}
                                    className="h-12 md:h-14 w-full md:w-auto px-6 md:px-10 rounded-xl md:rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tight md:tracking-widest hover:scale-105 transition-all text-xs"
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-neutral-950 rounded-3xl md:rounded-[3.5rem] p-6 md:p-16 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-orange-500/5 relative overflow-hidden ring-1 ring-neutral-200 dark:ring-white/10 mx-auto max-w-[calc(100vw-2rem)] md:max-w-none">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter mb-8 group flex items-center gap-3">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                            Send a Message
                                        </h2>

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-neutral-400">FullName</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Full Name" {...field} className="h-14 bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 rounded-2xl px-6 focus:ring-2 focus:ring-orange-500/50 font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Email Address" {...field} className="h-14 bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 rounded-2xl px-6 focus:ring-2 focus:ring-orange-500/50 font-bold" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your Inquiry</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter your inquiry details here..."
                                                            {...field}
                                                            className="min-h-[160px] bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 focus:ring-2 focus:ring-orange-500/50 font-bold resize-none"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 md:h-16 rounded-xl md:rounded-[1.5rem] bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-tight md:tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-[10px] md:text-xs"
                                        >
                                            {isSubmitting ? "Processing Inquiry..." : "Submit Inquiry"} <Send className="w-4 h-4 ml-2" />
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-20 border-t border-neutral-100 dark:border-neutral-900 text-center">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.5em]">&copy; 2026 AI TECH • DIRECT SUPPORT LINE</p>
            </footer>
        </div>
    );
}
