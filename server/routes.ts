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
    try {
      // Always refresh trends when the list is requested to ensure dynamic data
      const fetchedTrends = await fetchTrends();
      
      // Ensure we only keep the latest 10
      await storage.clearTrends();
      const top10 = fetchedTrends.slice(0, 10);
      for (const t of top10) {
        await storage.createTrend({ topic: t.topic, volume: t.volume });
      }
      
      console.log(`Updated trends with ${top10.length} items`);
    } catch (error) {
      console.error("Auto-refresh of trends failed:", error);
    }
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

  // --- External Sites Routes ---

  app.get(api.externalSites.list.path, async (req, res) => {
    const sites = await storage.getExternalSites();
    res.json(sites);
  });

  app.post(api.externalSites.create.path, async (req, res) => {
    try {
      const input = api.externalSites.create.input.parse(req.body);
      const site = await storage.createExternalSite(input);
      res.status(201).json(site);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.externalSites.update.path, async (req, res) => {
    try {
      const input = api.externalSites.update.input.parse(req.body);
      const site = await storage.updateExternalSite(Number(req.params.id), input);
      res.json(site);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.externalSites.delete.path, async (req, res) => {
    await storage.deleteExternalSite(Number(req.params.id));
    res.status(204).send();
  });

  // --- Scheduled Posts Routes ---

  app.get(api.scheduledPosts.list.path, async (req, res) => {
    const posts = await storage.getScheduledPosts();
    res.json(posts);
  });

  app.post(api.scheduledPosts.create.path, async (req, res) => {
    try {
      const input = api.scheduledPosts.create.input.parse(req.body);
      const post = await storage.createScheduledPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.scheduledPosts.delete.path, async (req, res) => {
    await storage.deleteScheduledPost(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/blogs/preview/:id", async (req, res) => {
    const blog = await storage.getBlog(Number(req.params.id));
    if (!blog) return res.status(404).send("Blog not found");
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview: ${blog.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 2rem; }
            img { max-width: 100%; height: auto; border-radius: 1rem; margin-bottom: 2rem; }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1.2; }
            .meta { color: #666; margin-bottom: 2rem; display: flex; gap: 1rem; font-size: 0.9rem; }
            .content { font-size: 1.1rem; }
            .tag { background: #f0f0f0; padding: 0.2rem 0.6rem; border-radius: 0.4rem; }
          </style>
        </head>
        <body>
          <div class="meta">
            <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span style="text-transform: uppercase; font-weight: bold; color: #3b82f6;">${blog.topic}</span>
          </div>
          <h1>${blog.title}</h1>
          ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="${blog.title}">` : ''}
          <div class="content">
            ${blog.content}
          </div>
          <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee;">
            <h3>Tags</h3>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${blog.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
            </div>
          </div>
        </body>
      </html>
    `);
  });

  return httpServer;
}
