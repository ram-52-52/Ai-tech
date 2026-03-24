import { db } from "./db";
import { blogs, trends, externalSites, scheduledPosts, type Blog, type InsertBlog, type Trend, type ExternalSite, type InsertExternalSite, type ScheduledPost, type InsertScheduledPost } from "../shared/schema";
import { eq, desc, lte, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BlogModel, TrendModel, ExternalSiteModel, ScheduledPostModel } from "./models";

export interface IStorage {
  // Blogs
  getBlogs(): Promise<Blog[]>;
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: number, blog: Partial<InsertBlog>): Promise<Blog>;
  deleteBlog(id: number): Promise<void>;
  
  // Trends
  getTrends(): Promise<Trend[]>;
  createTrend(trend: { topic: string; volume?: number }): Promise<Trend>;
  clearTrends(): Promise<void>;

  // External Sites
  getExternalSites(): Promise<ExternalSite[]>;
  getExternalSite(id: number): Promise<ExternalSite | undefined>;
  getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined>;
  createExternalSite(site: InsertExternalSite): Promise<ExternalSite>;
  updateExternalSite(id: number, site: Partial<InsertExternalSite>): Promise<ExternalSite>;
  deleteExternalSite(id: number): Promise<void>;

  // Scheduled Posts
  getScheduledPosts(): Promise<ScheduledPost[]>;
  getScheduledPost(id: number): Promise<ScheduledPost | undefined>;
  getPendingDueScheduledPosts(): Promise<ScheduledPost[]>;
  createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost>;
  updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost>;
  deleteScheduledPost(id: number): Promise<void>;
}

export class MongoStorage implements IStorage {
  async getBlogs(): Promise<Blog[]> {
    return (await BlogModel.find().sort({ createdAt: -1 })).map(doc => doc.toObject());
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ id });
    return doc ? doc.toObject() : undefined;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ slug });
    return doc ? doc.toObject() : undefined;
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const blog = new BlogModel({ ...insertBlog, publishedAt: new Date() });
    await blog.save();
    return blog.toObject();
  }

  async updateBlog(id: number, updates: Partial<InsertBlog>): Promise<Blog> {
    const doc = await BlogModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!doc) throw new Error("Blog not found");
    return doc.toObject();
  }

  async deleteBlog(id: number): Promise<void> {
    await BlogModel.deleteOne({ id });
  }

  async getTrends(): Promise<Trend[]> {
    return (await TrendModel.find().sort({ createdAt: -1 })).map(doc => doc.toObject());
  }

  async createTrend(trend: { topic: string; volume?: number }): Promise<Trend> {
    const doc = new TrendModel(trend);
    await doc.save();
    return doc.toObject();
  }

  async clearTrends(): Promise<void> {
    await TrendModel.deleteMany({});
  }

  async getExternalSites(): Promise<ExternalSite[]> {
    return (await ExternalSiteModel.find().sort({ createdAt: -1 })).map(doc => doc.toObject());
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ id });
    return doc ? doc.toObject() : undefined;
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ clientId });
    return doc ? doc.toObject() : undefined;
  }

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const clientId = site.siteType === "embed_widget" ? crypto.randomUUID() : null;
    const doc = new ExternalSiteModel({ ...site, clientId });
    await doc.save();
    return doc.toObject();
  }

  async updateExternalSite(id: number, updates: Partial<InsertExternalSite>): Promise<ExternalSite> {
    const doc = await ExternalSiteModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!doc) throw new Error("Site not found");
    return doc.toObject();
  }

  async deleteExternalSite(id: number): Promise<void> {
    await ExternalSiteModel.deleteOne({ id });
  }

  async getScheduledPosts(): Promise<ScheduledPost[]> {
    return (await ScheduledPostModel.find().sort({ createdAt: -1 })).map(doc => doc.toObject());
  }

  async getScheduledPost(id: number): Promise<ScheduledPost | undefined> {
    const doc = await ScheduledPostModel.findOne({ id });
    return doc ? doc.toObject() : undefined;
  }

  async getPendingDueScheduledPosts(): Promise<ScheduledPost[]> {
    const now = new Date();
    return (await ScheduledPostModel.find({
      status: "pending",
      scheduledAt: { $lte: now }
    })).map(doc => doc.toObject());
  }

  async createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
    const doc = new ScheduledPostModel(post);
    await doc.save();
    return doc.toObject();
  }

  async updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost> {
    const doc = await ScheduledPostModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!doc) throw new Error("Post not found");
    return doc.toObject();
  }

  async deleteScheduledPost(id: number): Promise<void> {
    await ScheduledPostModel.deleteOne({ id });
  }
}

export class DatabaseStorage implements IStorage {
  async getBlogs(): Promise<Blog[]> {
    return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
    return blog;
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const [blog] = await db.insert(blogs).values({
        ...insertBlog,
        publishedAt: new Date(),
    }).returning();
    return blog;
  }

  async updateBlog(id: number, updates: Partial<InsertBlog>): Promise<Blog> {
    const [updated] = await db.update(blogs)
      .set(updates)
      .where(eq(blogs.id, id))
      .returning();
    return updated;
  }

  async deleteBlog(id: number): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  async getTrends(): Promise<Trend[]> {
    return await db.select().from(trends).orderBy(desc(trends.createdAt));
  }

  async createTrend(trend: { topic: string; volume?: number }): Promise<Trend> {
    const [newTrend] = await db.insert(trends).values(trend).returning();
    return newTrend;
  }

  async clearTrends(): Promise<void> {
    await db.delete(trends);
  }

  async getExternalSites(): Promise<ExternalSite[]> {
    return await db.select().from(externalSites).orderBy(desc(externalSites.createdAt));
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    const [site] = await db.select().from(externalSites).where(eq(externalSites.id, id));
    return site;
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    const [site] = await db.select().from(externalSites).where(eq(externalSites.clientId, clientId));
    return site;
  }

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const clientId = site.siteType === "embed_widget" ? crypto.randomUUID() : null;
    const [newSite] = await db.insert(externalSites).values({ ...site, clientId }).returning();
    return newSite;
  }

  async updateExternalSite(id: number, updates: Partial<InsertExternalSite>): Promise<ExternalSite> {
    const [updated] = await db.update(externalSites)
      .set(updates)
      .where(eq(externalSites.id, id))
      .returning();
    return updated;
  }

  async deleteExternalSite(id: number): Promise<void> {
    await db.delete(externalSites).where(eq(externalSites.id, id));
  }

  async getScheduledPosts(): Promise<ScheduledPost[]> {
    return await db.select().from(scheduledPosts).orderBy(desc(scheduledPosts.createdAt));
  }

  async getScheduledPost(id: number): Promise<ScheduledPost | undefined> {
    const [post] = await db.select().from(scheduledPosts).where(eq(scheduledPosts.id, id));
    return post;
  }

  async getPendingDueScheduledPosts(): Promise<ScheduledPost[]> {
    return await db.select().from(scheduledPosts).where(
      and(
        eq(scheduledPosts.status, "pending"),
        lte(scheduledPosts.scheduledAt, new Date())
      )
    );
  }

  async createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
    const [newPost] = await db.insert(scheduledPosts).values(post).returning();
    return newPost;
  }

  async updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost> {
    const [updated] = await db.update(scheduledPosts)
      .set(updates)
      .where(eq(scheduledPosts.id, id))
      .returning();
    return updated;
  }

  async deleteScheduledPost(id: number): Promise<void> {
    await db.delete(scheduledPosts).where(eq(scheduledPosts.id, id));
  }
}

export class MemStorage implements IStorage {
  private blogs: Map<number, Blog>;
  private trends: Map<number, Trend>;
  private externalSites: Map<number, ExternalSite>;
  private scheduledPosts: Map<number, ScheduledPost>;
  private blogId: number;
  private trendId: number;
  private siteId: number;
  private postId: number;

  private storagePath: string;

  constructor() {
    this.blogs = new Map();
    this.trends = new Map();
    this.externalSites = new Map();
    this.scheduledPosts = new Map();
    this.blogId = 1;
    this.trendId = 1;
    this.siteId = 1;
    this.postId = 1;
    this.storagePath = path.resolve(process.cwd(), "tmp-storage.json");

    this.loadFromDisk();
    
    // Ensure default sites exist if none loaded
    if (this.externalSites.size === 0) {
      this.initDefaults();
    }
  }

  private initDefaults() {
    // Pre-populate with user's Medium account
    this.createExternalSite({
      siteName: "User's Medium",
      siteType: "medium",
      siteUrl: "https://medium.com/@c4820635",
      username: "c4820635",
      password: process.env.MEDIUM_ACCESS_TOKEN || "provide_token_in_ui",
      isEnabled: true
    });

    // Pre-populate with user's LinkedIn account
    this.createExternalSite({
      siteName: "User's LinkedIn",
      siteType: "linkedin",
      siteUrl: "https://www.linkedin.com/in/c4820635",
      username: "c4820635",
      password: process.env.LINKEDIN_ACCESS_TOKEN || "provide_token_in_ui",
      isEnabled: true
    });
  }

  private saveToDisk() {
    try {
      const data = {
        blogs: Array.from(this.blogs.entries()),
        trends: Array.from(this.trends.entries()),
        externalSites: Array.from(this.externalSites.entries()),
        scheduledPosts: Array.from(this.scheduledPosts.entries()),
        blogId: this.blogId,
        trendId: this.trendId,
        siteId: this.siteId,
        postId: this.postId
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Failed to save storage to disk:", err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = JSON.parse(fs.readFileSync(this.storagePath, "utf-8"));
        this.blogs = new Map(data.blogs);
        this.trends = new Map(data.trends);
        this.externalSites = new Map(data.externalSites);
        this.scheduledPosts = new Map(data.scheduledPosts);
        this.blogId = data.blogId;
        this.trendId = data.trendId;
        this.siteId = data.siteId;
        this.postId = data.postId;
        
        // Convert date strings back to Date objects and check for env overrides
        this.blogs.forEach(b => {
          b.createdAt = new Date(b.createdAt);
          if (b.publishedAt) b.publishedAt = new Date(b.publishedAt);
        });
        
        this.trends.forEach(t => t.createdAt = new Date(t.createdAt));
        
        this.externalSites.forEach(s => {
          s.createdAt = new Date(s.createdAt);
          // Override placeholder with env if available
          if (s.password === "provide_token_in_ui") {
            if (s.siteType === "linkedin" && process.env.LINKEDIN_ACCESS_TOKEN) {
              s.password = process.env.LINKEDIN_ACCESS_TOKEN;
            } else if (s.siteType === "medium" && process.env.MEDIUM_ACCESS_TOKEN) {
              s.password = process.env.MEDIUM_ACCESS_TOKEN;
            }
          }
        });

        this.scheduledPosts.forEach(p => {
          p.createdAt = new Date(p.createdAt);
          p.scheduledAt = new Date(p.scheduledAt);
          if (p.postedAt) p.postedAt = new Date(p.postedAt);
        });
      }
    } catch (err) {
      console.error("Failed to load storage from disk:", err);
    }
  }

  async getBlogs(): Promise<Blog[]> {
    this.loadFromDisk();
    return Array.from(this.blogs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    this.loadFromDisk();
    return this.blogs.get(id);
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    return Array.from(this.blogs.values()).find(b => b.slug === slug);
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = this.blogId++;
    const blog: Blog = { 
      ...insertBlog, 
      id, 
      createdAt: new Date(), 
      metaDescription: insertBlog.metaDescription ?? null, 
      tags: insertBlog.tags ?? null, 
      imageUrl: insertBlog.imageUrl ?? null, 
      featuredMediaProvider: insertBlog.featuredMediaProvider ?? null,
      isPublished: insertBlog.isPublished ?? false, 
      publishedAt: new Date() 
    };
    this.blogs.set(id, blog);
    this.saveToDisk();
    return blog;
  }

  async updateBlog(id: number, updates: Partial<InsertBlog>): Promise<Blog> {
    const blog = this.blogs.get(id);
    if (!blog) throw new Error("Blog not found");
    const updated = { ...blog, ...updates };
    this.blogs.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  async deleteBlog(id: number): Promise<void> {
    this.blogs.delete(id);
    this.saveToDisk();
  }

  async getTrends(): Promise<Trend[]> {
    return Array.from(this.trends.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTrend(trend: { topic: string; volume?: number }): Promise<Trend> {
    const id = this.trendId++;
    const newTrend: Trend = { id, topic: trend.topic, volume: trend.volume ?? null, createdAt: new Date() };
    this.trends.set(id, newTrend);
    return newTrend;
  }

  async clearTrends(): Promise<void> {
    this.trends.clear();
  }

  async getExternalSites(): Promise<ExternalSite[]> {
    return Array.from(this.externalSites.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    return this.externalSites.get(id);
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    return Array.from(this.externalSites.values()).find(s => s.clientId === clientId);
  }

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const id = this.siteId++;
    const clientId = site.siteType === "embed_widget" ? crypto.randomUUID() : null;
    const newSite: ExternalSite = { ...site, id, clientId, createdAt: new Date(), isEnabled: site.isEnabled ?? true };
    this.externalSites.set(id, newSite);
    this.saveToDisk();
    return newSite;
  }

  async updateExternalSite(id: number, updates: Partial<InsertExternalSite>): Promise<ExternalSite> {
    const site = this.externalSites.get(id);
    if (!site) throw new Error("Site not found");
    const updated = { ...site, ...updates };
    this.externalSites.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  async deleteExternalSite(id: number): Promise<void> {
    this.externalSites.delete(id);
    this.saveToDisk();
  }

  async getScheduledPosts(): Promise<ScheduledPost[]> {
    return Array.from(this.scheduledPosts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getScheduledPost(id: number): Promise<ScheduledPost | undefined> {
    return this.scheduledPosts.get(id);
  }

  async getPendingDueScheduledPosts(): Promise<ScheduledPost[]> {
    const now = new Date();
    return Array.from(this.scheduledPosts.values()).filter(p => p.status === "pending" && p.scheduledAt <= now);
  }

  async createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
    const id = this.postId++;
    const newPost: ScheduledPost = { ...post, id, createdAt: new Date(), status: post.status ?? "pending", postedAt: null, errorMessage: null };
    this.scheduledPosts.set(id, newPost);
    this.saveToDisk();
    return newPost;
  }

  async updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost> {
    const post = this.scheduledPosts.get(id);
    if (!post) throw new Error("Post not found");
    const updated = { ...post, ...updates };
    this.scheduledPosts.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  async deleteScheduledPost(id: number): Promise<void> {
    this.scheduledPosts.delete(id);
    this.saveToDisk();
  }
}

export const storage = process.env.MONGODB_URI 
  ? new MongoStorage() 
  : (process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage());
