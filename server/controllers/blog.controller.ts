import { Request, Response } from "express";
import { storage } from "../storage";
import { api } from "../../shared/routes";
import { z } from "zod";
import path from "path";
import fs from "fs";
import axios from "axios";
import { generateBlogPost, generateImageForBlog } from "../services/ai";
import { logPlatformAction } from "../utils/logging";
import { invalidateCache } from "../utils/cache";

export const getFeed = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { blogId, slug } = req.query;
    
    let site;
    if (/^\d+$/.test(id)) {
      site = await storage.getExternalSite(Number(id));
    } else {
      site = await storage.getExternalSiteByClientId(id);
    }

    if (!site || site.siteType !== "embed_widget" || !site.isEnabled) {
      return res.status(404).json({ error: "Widget not found or disabled" });
    }

    const clientId = site.clientId!;
    const now = new Date();

    if (slug || blogId) {
      let blog;
      if (slug) {
        blog = await storage.getBlogBySlugAndClientId(slug as string, clientId);
      } else {
        blog = await storage.getBlog(Number(blogId));
        // Double-Gate Check for direct ID access
        const isPastSchedule = !blog?.scheduledAt || new Date(blog.scheduledAt) <= now;
        if (blog && (blog.clientId !== clientId || !blog.isPublished || !isPastSchedule)) {
            blog = undefined;
        }
      }

      if (!blog) return res.status(404).json({ error: "Blog not found" });

      return res.json({
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        tags: blog.tags,
        topic: blog.topic,
        slug: blog.slug
      });
    }

    // DOUBLE-LAYER SECURITY: Fetch ONLY published blogs from DB (Layer 1)
    const rawBlogs = await storage.getBlogs(clientId, true);
    
    // Controller-Level Strict Filtering (Layer 2 - User Requirement 3)
    const feed = rawBlogs
      .filter(b => {
        // Redundant Published Check for absolute security
        const isStrictPublished = b.isPublished === true;
        
        // Strict Schedule Gate: Only show if schedule has passed
        const now = new Date();
        const isScheduleMet = !b.scheduledAt || new Date(b.scheduledAt) <= now;
        
        // Final guard for tenant isolation
        const isCorrectClient = b.clientId === clientId;
        
        return isStrictPublished && isScheduleMet && isCorrectClient;
      })
      .slice(0, 10)
      .map(b => {
        const fallbackSlug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50);
        return {
          id: b.id,
          slug: b.slug || fallbackSlug,
          title: b.title,
          metaDescription: b.metaDescription || (b.content ? b.content.replace(/<[^>]*>/g, '').substring(0, 160) + "..." : ""),
          imageUrl: b.imageUrl,
          createdAt: b.createdAt,
          topic: b.topic,
          isPublished: true // Explicitly set for frontend failsafe (User Requirement 3)
        };
      });

    // Cache-Control: s-maxage=1 (1s edge cache) + stale-while-revalidate (background refresh)
    // Cache-Busting/Invalidation: Handled via REVALIDATION_SECRET in invalidateCache util
    res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json(feed);
  } catch (err) {
    console.error(`[Feed API Error]:`, err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const listBlogs = async (req: Request, res: Response) => {
  try {
    const user = await storage.getUserById(Number((req.session as any).userId));
    const isSuperAdmin = user?.role === 'superadmin';
    
    let blogsList = await storage.getBlogs(isSuperAdmin ? undefined : (req.session as any).clientId);
    
    if (isSuperAdmin) {
      const allUsers = await storage.getUsers();
      const userMap = new Map(allUsers.map(u => [u.clientId, u.username]));
      blogsList = blogsList.map(b => ({
        ...b,
        author: b.clientId ? (userMap.get(b.clientId) || "Unknown") : "System"
      }));
    }
    
    res.json(blogsList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getBlog = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  const user = await storage.getUserById(Number((req.session as any).userId));
  const isSuperAdmin = user?.role === 'superadmin';
  const blog = await storage.getBlog(Number(req.params.id));
  
  if (!blog || (!isSuperAdmin && blog.clientId !== clientId)) {
    return res.status(404).json({ message: "Blog not found or unauthorized" });
  }
  res.json(blog);
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  const user = await storage.getUserById(Number((req.session as any).userId));
  const isSuperAdmin = user?.role === 'superadmin';
  const blog = await storage.getBlogBySlug(req.params.slug as string);
  
  if (!blog || (!isSuperAdmin && blog.clientId !== clientId)) {
    return res.status(404).json({ message: "Blog not found" });
  }
  res.json(blog);
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const clientId = (req.session as any).clientId;
    if (!clientId) return res.status(401).json({ message: "No client profile" });

    const isScheduling = !!req.body.scheduledAt;
    // SECURITY DEFAULT: All manually created blogs start as Draft unless frontend
    // explicitly sends isPublished: true (e.g. via 'Publish Immediately' button).
    const explicitlyPublishing = req.body.isPublished === true && !isScheduling;
    const body = { 
      ...req.body, 
      clientId,
      isPublished: explicitlyPublishing ? true : false,
      publishedAt: explicitlyPublishing ? new Date() : null
    };

    const input = api.blogs.create.input.parse(body);
    const blog = await storage.createBlog(input);
    res.status(201).json(blog);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const user = await storage.getUserById(Number((req.session as any).userId));
    const isSuperAdmin = user?.role === 'superadmin';
    const blogId = Number(req.params.id);

    const existingBlog = await storage.getBlog(blogId);
    if (!existingBlog || (!isSuperAdmin && existingBlog.clientId !== (req.session as any).clientId)) {
      return res.status(403).json({ message: "Unauthorized to edit this blog" });
    }

    const updates = { ...req.body };
    
    // Explicit Status Handling: Draft <-> Published
    if (updates.isPublished === true) {
      if (!existingBlog.isPublished || !existingBlog.publishedAt) {
        updates.publishedAt = new Date();
      }
    } else if (updates.isPublished === false) {
      // Reverting to Draft: Clear publishedAt to ensure absolute drafting state
      updates.publishedAt = null;
    }

    const blog = await storage.updateBlog(blogId, updates);
    
    // Real-Time Sync: Trigger cache invalidation after DB update
    await invalidateCache(blog.clientId ?? (req.session as any).clientId);
    
    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Blog update failed" });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  const user = await storage.getUserById(Number((req.session as any).userId));
  const isSuperAdmin = user?.role === 'superadmin';
  const blogId = Number(req.params.id);

  const blog = await storage.getBlog(blogId);
  if (!blog || (!isSuperAdmin && blog.clientId !== (req.session as any).clientId)) {
    return res.status(404).json({ message: "Blog not found or unauthorized" });
  }

  const imageFields = [blog.imageUrl].filter(Boolean) as string[];
  for (const imageUrl of imageFields) {
    if (!imageUrl.startsWith("/")) continue;
    
    const localPath = path.join(process.cwd(), "client", "public", imageUrl);
    try {
      await fs.promises.unlink(localPath);
    } catch {}
  }

  await storage.deleteBlog(blogId);
  res.status(204).send();
};

export const generateBlog = async (req: Request, res: Response) => {
  try {
    let topic = req.body.topic;
    const clientId = (req.session as any).clientId;
    if (!clientId) return res.status(401).json({ message: "No client profile" });

    const user = await storage.getUserById((req.session as any).userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    const currentPlan = await storage.getPlanByName(user.plan);
    const userLimit = currentPlan ? currentPlan.blogLimit : 2;

    if (user.blogsGeneratedThisMonth >= userLimit) {
      return res.status(403).json({ 
        message: `Plan limit reached (${userLimit} blogs/month). Please contact the administrator to upgrade your plan.` 
      });
    }

    const generatedBlogData = await generateBlogPost(topic || "AI Technology");
    // DRAFT DEFAULT: AI-generated blogs are NEVER auto-published.
    // The user must explicitly schedule or click 'Publish Immediately'.
    const blog = await storage.createBlog({ 
      ...generatedBlogData, 
      clientId,
      isPublished: false,
      publishedAt: null
    });

    await storage.incrementUserBlogCount(user.id);
    await logPlatformAction(user.id, user.username, "Blog Generated", `Topic: ${topic || 'Auto-trend'}`);

    res.status(201).json(blog);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to generate blog" });
  }
};

export const regenerateFull = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title: bodyTitle } = req.body;
    const blog = await storage.getBlog(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const targetTitle = bodyTitle || blog.title;
    const generated = await generateBlogPost(targetTitle);
    
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
    res.status(500).json({ message: error.message || "Failed to regenerate full blog" });
  }
};

export const regenerateImage = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title: bodyTitle } = req.body;
    const blog = await storage.getBlog(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const targetTitle = bodyTitle || blog.title;
    const imageResult = await generateImageForBlog(targetTitle, blog.slug);

    const updatedBlog = await storage.updateBlog(id, {
      imageUrl: imageResult.url,
      featuredMediaProvider: imageResult.provider
    });
    res.json(updatedBlog);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to regenerate image" });
  }
};

export const previewBlog = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  const blog = await storage.getBlog(Number(req.params.id));
  if (!blog || blog.clientId !== clientId) {
    return res.status(404).send("Blog not found");
  }

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
          <span style="text-transform: uppercase; font-weight: bold; color: #f97316;">${blog.topic}</span>
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
};
