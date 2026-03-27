import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const { mutate: generate, isPending } = useGenerateBlog();
  const { toast } = useToast();

  useEffect(() => {
    // Parse query params manually since wouter's useSearch returns a string
    const params = new URLSearchParams(searchString);
    const topicParam = params.get("topic");
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchString]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    generate({ topic }, {
      onSuccess: (newBlog) => {
        toast({
          title: "Content Generated!",
          description: "Your new blog post is ready for review.",
        });
        setLocation(`/blogs/${newBlog.id}`);
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 md:py-24 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-1000 relative font-plus-jakarta">
      <SEO 
        title="Content Generator | AI TECH" 
        description="Generate high-quality blog content using the AI TECH core engine." 
      />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8 md:mb-16 space-y-6"
      >
        <div className="relative inline-block group">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-[1.25rem] md:rounded-[2rem] bg-orange-500/10 border border-orange-500/20 p-[1px] shadow-2xl shadow-orange-500/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-[1.2rem] md:rounded-[1.95rem] flex items-center justify-center">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="absolute -inset-4 bg-orange-500/10 rounded-full -z-10" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
            Content <span className="text-orange-500">Generator</span>
          </h1>
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="text-[10px] md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              AI Core v4.0 Active
            </span>
          </div>
        </div>
        
        <p className="text-xs md:text-base text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto font-medium tracking-tight">
          Professional AI-powered content generation. Enter your blog topic or keyword below to get started.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full max-w-3xl premium-card p-2 p-[2px] rounded-[3rem] shadow-2xl"
      >
        <div className="bg-white dark:bg-neutral-900 p-6 md:p-14 rounded-[2rem] md:rounded-[2.95rem] border border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleGenerate} className="space-y-10">
            <div className="space-y-6">
              <Label htmlFor="topic" className="text-xs md:text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 px-2">Blog Topic or Keywords</Label>
              <div className="relative group/input">
                <div className="absolute -inset-0.5 rounded-[2rem] opacity-0 group-focus-within/input:opacity-100 transition-all duration-300" />
                <Input
                  id="topic"
                  placeholder="The future of artificial intelligence..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-16 md:h-20 text-sm md:text-lg lg:text-xl font-bold py-6 md:py-8 bg-neutral-50 dark:bg-white/[0.03] border-neutral-200 dark:border-neutral-800 focus-visible:ring-orange-500/20 transition-all rounded-[1.5rem] md:rounded-[2rem] px-6 md:px-8 tracking-tight w-full"
                  disabled={isPending}
                />
                <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2">
                  <div className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-500 ${topic ? 'bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/10' : 'bg-neutral-100 dark:bg-white/5 text-neutral-400'}`}>
                    <Wand2 className={`w-4 h-4 md:w-5 md:h-5 ${isPending ? 'animate-spin' : ''}`} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <p className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400 dark:text-neutral-500">
                  Model: Advanced GPT-4 Omni
                </p>
                <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="default"
              className="w-full h-16 md:h-20 font-bold text-sm md:text-base tracking-tight rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/40 group relative overflow-hidden border-none"
              disabled={isPending || !topic.trim()}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.span 
                    key="pending"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-4"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    AI is writing your blog...
                  </motion.span>
                ) : (
                  <motion.span 
                    key="ready"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    Generate Blog <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </form>
        </div>
      </motion.div>
      
      {/* Full Screen Generation Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[100px] flex flex-col items-center justify-center p-10"
          >
            <div className="relative mb-16">
              <div className="w-40 h-40 rounded-full border border-primary/20 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-primary animate-pulse shadow-glow" />
              </div>
              <div className="absolute -inset-20 bg-primary/10 blur-[100px] rounded-full animate-pulse-slow" />
            </div>

            <div className="text-center space-y-8 max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Content <span className="text-orange-500">Generation</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs md:text-sm font-semibold tracking-wide text-muted-foreground/60 px-1">
                  <span>Manifest Synthesis</span>
                  <span className="text-orange-500">64%</span>
                </div>
                <div className="w-80 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "64%" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <p className="text-xs md:text-sm font-semibold tracking-wide text-orange-500 animate-pulse">
                  Writing and Refining...
                </p>
                <p className="text-xs md:text-sm font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
                  Optimizing for SEO and Readability
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
