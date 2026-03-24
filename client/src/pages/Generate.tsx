import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    <div className="max-w-3xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 tracking-tight mb-6 pb-2 text-glow">
          AI Content Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Enter a topic and let our advanced AI create a SEO-optimized, engaging blog post for you in seconds.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-8 md:p-10 rounded-2xl relative overflow-hidden"
      >
        <form onSubmit={handleGenerate} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="topic" className="text-base font-medium">What should we write about?</Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="e.g. The Future of Sustainable Architecture in 2025"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="pl-4 pr-12 py-6 text-lg rounded-xl shadow-inner border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 focus-visible:ring-primary focus-visible:ring-2 transition-all"
                disabled={isPending}
              />
              <div className="absolute right-3 top-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <Wand2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tip: Be specific about your target audience or desired tone for better results.
            </p>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all text-white hover:-translate-y-0.5"
            disabled={isPending || !topic.trim()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Blog Post <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </motion.div>
      
      {/* Visual filler for generating state */}
      {isPending && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center space-y-3"
        >
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Analyzing trends... Drafting content... Optimizing SEO...
          </p>
          <div className="w-64 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full w-1/3 animate-[shimmer_1.5s_infinite_linear]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
