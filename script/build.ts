import { build, type BuildOptions } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";
import { build as viteBuild } from "vite";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBuild() {
  const rootDir = path.resolve(__dirname, "..");
  const distDir = path.resolve(rootDir, "dist");

  console.log("Starting build process...");

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    console.log("Cleaning old dist directory...");
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build client with Vite
  console.log("Building client with Vite...");
  await viteBuild({
    configFile: path.resolve(rootDir, "vite.config.ts"),
    build: {
      outDir: path.resolve(distDir, "public"),
      emptyOutDir: true,
    },
  });

  // 2. Build server with Esbuild
  console.log("Building server with Esbuild...");
  const serverOptions: BuildOptions = {
    entryPoints: [path.resolve(rootDir, "server/index.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: path.resolve(distDir, "index.cjs"),
    // Common external packages that shouldn't be bundled or cause issues
    external: [
      "express", 
      "pg", 
      "drizzle-orm", 
      "@google/generative-ai", 
      "openai", 
      "node-cron", 
      "axios", 
      "rss-parser",
      "vite",
      "../vite.config",
      "./vite"
    ],
    sourcemap: true,
    minify: false,
    target: "node20",
  };

  await build(serverOptions);
  console.log("Build completed successfully! Assets located in dist/");
}

runBuild().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
