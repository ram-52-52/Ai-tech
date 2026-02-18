import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generateBlogPost } from "./services/openai"; // We will create this
import { fetchTrends } from "./services/trends";     // We will create this
import cron from "node-cron";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Blog Routes ---

  app.get(api.blogs.list.path, async (req, res) => {
    const blogs = await storage.getBlogs();
    res.json(blogs);
  });

  app.get(api.blogs.get.path, async (req, res) => {
    const blog = await storage.getBlog(Number(req.params.id));
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  });

  app.get(api.blogs.getBySlug.path, async (req, res) => {
    const blog = await storage.getBlogBySlug(req.params.slug);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  });

  app.post(api.blogs.create.path, async (req, res) => {
    try {
      const input = api.blogs.create.input.parse(req.body);
      const blog = await storage.createBlog(input);
      res.status(201).json(blog);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.blogs.update.path, async (req, res) => {
    try {
      const input = api.blogs.update.input.parse(req.body);
      const blog = await storage.updateBlog(Number(req.params.id), input);
      res.json(blog);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Blog not found" });
    }
  });

  app.delete(api.blogs.delete.path, async (req, res) => {
    await storage.deleteBlog(Number(req.params.id));
    res.status(204).send();
  });

  // --- AI Generation Route ---

  app.post(api.blogs.generate.path, async (req, res) => {
    try {
      let topic = req.body.topic;
      
      if (!topic) {
         // Fetch trends if no topic provided
         const trends = await fetchTrends();
         if (trends && trends.length > 0) {
            topic = trends[0].topic; // Pick top trend
         } else {
            return res.status(400).json({ message: "No topic provided and could not fetch trends." });
         }
      }

      const generatedBlog = await generateBlogPost(topic);
      const blog = await storage.createBlog(generatedBlog);
      res.status(201).json(blog);

    } catch (error: any) {
      console.error("Blog generation failed:", error);
      res.status(500).json({ message: error.message || "Failed to generate blog" });
    }
  });

  // --- Trends Routes ---

  app.get(api.trends.list.path, async (req, res) => {
    const trends = await storage.getTrends();
    res.json(trends);
  });

  app.post(api.trends.refresh.path, async (req, res) => {
    try {
      const fetchedTrends = await fetchTrends();
      // Clear old trends and save new ones
      await storage.clearTrends();
      for (const t of fetchedTrends) {
        await storage.createTrend({ topic: t.topic, volume: t.volume });
      }
      const newTrends = await storage.getTrends();
      res.json(newTrends);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to refresh trends" });
    }
  });

  // --- Cron Job (Every 1 Hour) ---
  // Schedule a task to run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running Auto-Blog Cron Job...");
    try {
      const trends = await fetchTrends();
      if (trends.length > 0) {
        const topTrend = trends[0];
        console.log(`Creating blog for top trend: ${topTrend.topic}`);
        const generatedBlog = await generateBlogPost(topTrend.topic);
        await storage.createBlog({ ...generatedBlog, isPublished: true, publishedAt: new Date() }); // Auto-publish? Or draft? Let's auto-publish for now per spec.
        console.log("✅ Auto-blog created successfully.");
      }
    } catch (error) {
      console.error("❌ Auto-blog cron failed:", error);
    }
  });

  return httpServer;
}
