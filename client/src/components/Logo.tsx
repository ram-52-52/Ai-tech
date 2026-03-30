import React, { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 48,
  showText = true 
}) => {
  const gradientId = useId().replace(/:/g, "-"); // Ensure ID is safe for CSS selectors

  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer select-none", className)}>
      <motion.div 
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          {/* Background Glow Ring */}
          <motion.circle 
            cx="50" cy="50" r="45" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-neutral-200 dark:text-white/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Main Logo Path (The Sleek "A") */}
          <motion.path 
            d="M50 15L85 85H70L50 45L30 85H15L50 15Z" 
            fill={`url(#${gradientId})`}
            initial={false} // Start with full opacity
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Energy Core / Sparkle at the tip */}
          <motion.circle 
            cx="50" cy="15" r="4" 
            fill="#f97316"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [1, 0.6, 1],
              filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Crossbar Energy Line */}
          <motion.path 
            d="M38 65H62" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ pathLength: 1 }}
          />
        </svg>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full -z-10 group-hover:bg-orange-500/20 transition-colors duration-500" />
      </motion.div>

      {showText && (
        <div className="flex flex-col justify-center">
          <motion.h1 
            className="font-outfit font-black text-2xl md:text-3xl tracking-[-0.05em] text-neutral-900 dark:text-white leading-none uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI<span className="text-orange-500 italic">TECH</span>
          </motion.h1>
        </div>
      )}
    </div>
  );
};
