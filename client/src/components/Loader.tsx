import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[50vh] w-full gap-6", className)}>
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-4 border-primary/20 rounded-full"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1, scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-transparent border-b-primary/60 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Center glowing dot */}
        <motion.div
          className="absolute inset-0 m-auto w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p 
        className="text-xs font-bold text-muted-foreground tracking-wide font-semibold"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
