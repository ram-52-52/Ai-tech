import { Router, type Express } from "express";
import type { Server } from "http";
import { storage } from "../storage";
import { initializeCronJobs } from "../cron";

import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import blogRoutes from "./blogs.routes";
import logRoutes from "./logs.routes";
import usersRoutes from "./users.routes";
import siteRoutes from "./sites.routes";
import trendRoutes from "./trends.routes";
import inquiryRoutes from "./inquiries.routes";
import scheduledRoutes from "./scheduled-posts.routes";
import * as blogController from "../controllers/blog.controller";

const router = Router();

// --- Auth Routes ---
router.use("/auth", authRoutes); // Combined with /api prefix in main app
router.use("/", authRoutes); 

// --- Admin & Logs ---
router.use("/admin", adminRoutes);
router.use("/admin", logRoutes); // Platform events are under /api/admin/platform-events

// --- Blogs ---
router.use("/blogs", blogRoutes);
router.get("/v1/feed/:id", blogController.getFeed); // The feed is under /api/v1/feed/:id

// --- Users ---
router.use("/user", usersRoutes);

// --- Trends ---
router.use("/trends", trendRoutes);

// --- Sites (External) ---
router.use("/sites", siteRoutes);

// --- Scheduled ---
router.use("/scheduled", scheduledRoutes);

// --- Public/Inquiries ---
router.use("/", inquiryRoutes); // Handles /api/contact and /api/plans

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Initialize Storage Data ---
  await storage.seedPlans();

  // --- Background Tasks ---
  const { processScheduledPosts } = initializeCronJobs();

  // --- Central Modular Router ---
  // Apply all modular domain-specific routes
  app.use("/api", router);
  
  // Manual trigger for testing
  app.post("/api/scheduled/manual-process", async (_req, res) => {
    await processScheduledPosts();
    res.json({ message: "Processed scheduled posts manually" });
  });

  return httpServer;
}

export default router;
