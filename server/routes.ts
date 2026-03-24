import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import { generateBlogPost, generateImageForBlog } from "./services/ai";
import { fetchTrends } from "./services/trends";
import { publishBlog } from "./services/publisher";
import { uploadFeaturedImageToWordPress } from "./services/wpImageUploader";
import cron from "node-cron";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Blog Routes ---

  // Public Syndication Feed (Domain-Locked)
  app.get("/api/v1/feed/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const site = await storage.getExternalSiteByClientId(clientId);

      if (!site || site.siteType !== "embed_widget" || !site.isEnabled) {
        return res.status(404).json({ error: "Widget not found or disabled" });
      }

      // Domain Locking Security
      const origin = req.headers.origin || req.headers.referer;
      if (!origin) {
        return res.status(403).json({ error: "Unauthorized: Missing Origin/Referer header." });
      }

      try {
        const allowedOrigin = new URL(site.siteUrl).origin;
        const incomingOrigin = origin.startsWith('http') ? new URL(origin).origin : origin;

        if (allowedOrigin !== incomingOrigin) {
          console.warn(`[Security] Blocked unauthorized domain: ${incomingOrigin}. Expected: ${allowedOrigin}`);
          return res.status(403).json({ error: "Unauthorized Domain. Script execution blocked." });
        }
      } catch (urlErr) {
        return res.status(403).json({ error: "Invalid Origin/Referer format." });
      }

      // Fetch top 10 published blogs
      const blogs = await storage.getBlogs();
      const feed = blogs
        .filter(b => b.isPublished)
        .slice(0, 10)
        .map(b => ({
          title: b.title,
          content: b.content,
          imageUrl: b.imageUrl,
          createdAt: b.createdAt
        }));

      res.json(feed);
    } catch (error: any) {
      console.error("[Feed API] Error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

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

  app.post("/api/blogs/:id/regenerate-full", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title: bodyTitle } = req.body;
      const blog = await storage.getBlog(id);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const targetTitle = bodyTitle || blog.title;
      console.log(`[Route] Regenerating FULL blog ${id} using title: "${targetTitle}"`);
      
      // 1. Generate Full Blog (Content, Tags, Image) using the unified service
      console.log(`[Route] Triggering unified AI generation for "${targetTitle}"...`);
      const generated = await generateBlogPost(targetTitle);
      
      // 2. Optional WordPress Media Sync
      const sites = await storage.getExternalSites();
      const wpSite = sites.find(s => s.siteType === "wordpress" && s.isEnabled);
      
      if (wpSite && generated.imageUrl) {
        try {
          console.log(`[Route] Found connected WordPress site: ${wpSite.siteName}. Syncing image: ${generated.imageUrl}`);
          await uploadFeaturedImageToWordPress(generated.imageUrl, generated.title, wpSite.siteUrl);
        } catch (wpError: any) {
          console.error(`[WP Sync] Image sync to WordPress failed (non-fatal):`, wpError.message);
        }
      }

      const updatedBlog = await storage.updateBlog(id, { 
        title: generated.title,
        content: generated.content, 
        tags: generated.tags,
        imageUrl: generated.imageUrl,
        metaDescription: generated.metaDescription,
        featuredMediaProvider: generated.featuredMediaProvider,
        topic: targetTitle
      });

      res.json(updatedBlog);
    } catch (error: any) {
      console.error("[Route] Full regeneration process FAILED:", error.message);
      res.status(500).json({ message: error.message || "Failed to regenerate full blog" });
    }
  });

  app.post("/api/blogs/:id/regenerate-image", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title: bodyTitle } = req.body;
      const blog = await storage.getBlog(id);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const targetTitle = bodyTitle || blog.title;
      console.log(`[Route] Regenerating image for blog ${id} using title: "${targetTitle}"`);
      
      const imageResult = await generateImageForBlog(targetTitle, blog.slug);
      
      const updatedBlog = await storage.updateBlog(id, { 
        imageUrl: imageResult.url,
        featuredMediaProvider: imageResult.provider
      });
      res.json(updatedBlog);
    } catch (error: any) {
      console.error("Image regeneration failed:", error);
      res.status(500).json({ message: error.message || "Failed to regenerate image" });
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

  // --- Cron Job: Auto-Blog (Every 1 Hour) ---
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running Auto-Blog Cron Job...");
    try {
      const trends = await fetchTrends();
      if (trends.length > 0) {
        const topTrend = trends[0];
        console.log(`Creating blog for top trend: ${topTrend.topic}`);
        const generatedBlog = await generateBlogPost(topTrend.topic);
        await storage.createBlog({ ...generatedBlog, isPublished: true });
        console.log("✅ Auto-blog created successfully.");
      }
    } catch (error) {
      console.error("❌ Auto-blog cron failed:", error);
    }
  });

  // --- Cron Job: Process Scheduled Posts (Every Minute) ---
  const processScheduledPosts = async () => {
    const duePosts = await storage.getPendingDueScheduledPosts();
    if (duePosts.length === 0) return;

    console.log(`⏰ Processing ${duePosts.length} due scheduled post(s)...`);

    for (const post of duePosts) {
      const [blog, site] = await Promise.all([
        storage.getBlog(post.blogId),
        storage.getExternalSite(post.siteId),
      ]);

      if (!blog || !site) {
        await storage.updateScheduledPost(post.id, {
          status: "failed",
          errorMessage: !blog ? "Blog not found" : "Site not found",
        });
        continue;
      }

      const result = await publishBlog(blog, site);

      if (result.success) {
        console.log(`✅ Published "${blog.title}" to ${site.siteName}${result.postUrl ? " — " + result.postUrl : ""}`);
        await storage.updateScheduledPost(post.id, {
          status: "posted",
          postedAt: new Date(),
        });
      } else {
        console.error(`❌ Failed to publish "${blog.title}" to ${site.siteName}: ${result.error}`);
        await storage.updateScheduledPost(post.id, {
          status: "failed",
          errorMessage: result.error ?? "Unknown error",
        });
      }
    }
  };

  cron.schedule("* * * * *", processScheduledPosts);

  // --- Manual trigger for testing ---
  app.post("/api/scheduled/process", async (_req, res) => {
    try {
      await processScheduledPosts();
      res.json({ message: "Processed scheduled posts" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
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

  // --- WordPress OAuth Callback ---
  app.get("/api/wordpress/callback", async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).send("Authorization code is missing.");
    }
    
    try {
      const params = new URLSearchParams();
      params.append("client_id", "135690");
      params.append("redirect_uri", "http://localhost:5000/api/wordpress/callback");
      params.append("client_secret", process.env.WP_CLIENT_SECRET || "");
      params.append("code", code);
      params.append("grant_type", "authorization_code");

      const response = await fetch("https://public-api.wordpress.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || "Failed to get access token");
      }

      const { access_token, blog_id } = data as { access_token: string; blog_id: string };
      if (!access_token || !blog_id) {
        throw new Error("Missing access_token or blog_id in response.");
      }

      // Fetch the blog details to get site URL and name
      const siteDetailsRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${blog_id}`);
      let siteName = `WordPress Blog ${blog_id}`;
      let siteUrl = `https://wordpress.com`;
      if (siteDetailsRes.ok) {
        const siteDetails = await siteDetailsRes.json() as any;
        siteName = siteDetails.name || siteName;
        siteUrl = siteDetails.URL || siteUrl;
      }

      // Save to externalSites using storage
      await storage.createExternalSite({
        siteName,
        siteType: "wordpress",
        siteUrl,
        username: blog_id.toString(),
        password: access_token,
        isEnabled: true,
      });

      res.redirect("/settings?wp_connect=success");
    } catch (error: any) {
      console.error("WordPress OAuth Error:", error.message);
      res.redirect("/settings?wp_connect=error");
    }
  });

  // --- Test Connection ---
  app.post("/api/external-sites/:id/test", async (req, res) => {
    const site = await storage.getExternalSite(Number(req.params.id));
    if (!site) return res.status(404).json({ message: "Site not found" });

    try {
      if (site.siteType === "medium") {
        const token = site.password?.trim();
        const r = await fetch("https://api.medium.com/v1/me", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!r.ok) {
          const err = await r.text();
          return res.status(400).json({ message: `Medium auth failed — ${err}` });
        }
        const data = await r.json() as { data: { name: string; username: string } };
        return res.json({ message: `Connected as @${data.data.username} (${data.data.name})` });

      } else if (site.siteType === "wordpress") {
        const isOAuth = site.siteUrl.includes("wordpress.com") || /^\d+$/.test(site.username);
        if (isOAuth) {
          const r = await fetch(`https://public-api.wordpress.com/rest/v1.1/me`, {
            headers: { Authorization: `Bearer ${site.password}` },
          });
          if (!r.ok) {
            const err = await r.text();
            return res.status(400).json({ message: `WordPress.com auth failed — ${err}` });
          }
          const data = await r.json() as { display_name: string };
          return res.json({ message: `Connected as ${data.display_name}` });
        } else {
          const base = site.siteUrl.replace(/\/$/, "");
          const credentials = Buffer.from(`${site.username}:${site.password}`).toString("base64");
          const r = await fetch(`${base}/wp-json/wp/v2/users/me`, {
            headers: { Authorization: `Basic ${credentials}` },
          });
          if (!r.ok) {
            const err = await r.text();
            return res.status(400).json({ message: `WordPress auth failed — ${err}` });
          }
          const data = await r.json() as { name: string };
          return res.json({ message: `Connected as ${data.name}` });
        }

      } else if (site.siteType === "ghost") {
        const base = site.siteUrl.replace(/\/$/, "");
        const adminApiKey = site.password;
        const [id, secret] = adminApiKey.split(":");
        if (!id || !secret) return res.status(400).json({ message: "Ghost key must be in id:secret format" });
        const { createHmac } = await import("crypto");
        const now = Math.floor(Date.now() / 1000);
        const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })).toString("base64url");
        const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: "/admin/" })).toString("base64url");
        const signature = createHmac("sha256", Buffer.from(secret, "hex")).update(`${header}.${payload}`).digest("base64url");
        const token = `${header}.${payload}.${signature}`;
        const r = await fetch(`${base}/ghost/api/admin/site/`, {
          headers: { Authorization: `Ghost ${token}` },
        });
        if (!r.ok) {
          const err = await r.text();
          return res.status(400).json({ message: `Ghost auth failed — ${err}` });
        }
        const data = await r.json() as { site: { title: string } };
        return res.json({ message: `Connected to Ghost: "${data.site?.title}"` });

      } else if (site.siteType === "linkedin") {
        const token = site.password?.trim();

        // Mock success for testing
        if (token === "provide_token_in_ui") {
          return res.json({ message: "Connected as Mock User (Test Mode)" });
        }

        if (!token) return res.status(400).json({ message: "No token provided" });

        // 1. Try OpenID UserInfo (for new scopes: openid, profile)
        const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json() as { name: string };
          return res.json({ message: `Connected as ${userInfo.name} (via OpenID)` });
        } else {
          // 2. Try legacy /me endpoint (for legacy scopes: r_liteprofile)
          const r = await fetch("https://api.linkedin.com/v2/me", {
            headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
          });

          if (r.ok) {
            const data = await r.json() as { localizedFirstName?: string; localizedLastName?: string };
            const name = [data.localizedFirstName, data.localizedLastName].filter(Boolean).join(" ") || "Unknown";
            return res.json({ message: `Connected as ${name} (Legacy)` });
          } else {
            const err = await r.text();
            return res.status(400).json({ message: `LinkedIn auth failed — ${err}` });
          }
        }

      } else {
        return res.status(400).json({ message: `Test not supported for ${site.siteType}` });
      }
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  // --- Scheduled Posts Routes ---

  app.get(api.scheduledPosts.list.path, async (req, res) => {
    const posts = await storage.getScheduledPosts();
    res.json(posts);
  });

  app.post(api.scheduledPosts.create.path, async (req, res) => {
    try {
      const body = {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      };
      const input = api.scheduledPosts.create.input.parse(body);
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
