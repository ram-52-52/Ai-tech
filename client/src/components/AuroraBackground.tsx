import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background transition-colors duration-500">
      {/* Dark mode specific intense glowing orbs */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
        <motion.div
          animate={{
            x: ["0%", "20%", "-20%", "0%"],
            y: ["0%", "-20%", "20%", "0%"],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: ["0%", "-30%", "10%", "0%"],
            y: ["0%", "20%", "-30%", "0%"],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: ["0%", "30%", "-10%", "0%"],
            y: ["0%", "-30%", "20%", "0%"],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Light mode more vibrant gradients */}
      <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-1000">
        <motion.div
          animate={{
            x: ["0%", "10%", "-5%", "0%"],
            y: ["0%", "-10%", "5%", "0%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[140px]"
        />
        <motion.div
          animate={{
            x: ["0%", "-10%", "10%", "0%"],
            y: ["0%", "10%", "-10%", "0%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full bg-indigo-400/20 blur-[140px]"
        />
        <motion.div
          animate={{
            x: ["0%", "5%", "-15%", "0%"],
            y: ["0%", "15%", "-5%", "0%"],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] rounded-full bg-fuchsia-400/15 blur-[120px]"
        />
      </div>

      {/* Subtle overlay noise to give texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
  );
}
