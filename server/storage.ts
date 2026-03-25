import { db } from "./db";
import { blogs, trends, externalSites, scheduledPosts, users, type Blog, type InsertBlog, type Trend, type ExternalSite, type InsertExternalSite, type ScheduledPost, type InsertScheduledPost, type User, type InsertUser } from "../shared/schema";
import { eq, desc, lte, and, or, like } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BlogModel, TrendModel, ExternalSiteModel, ScheduledPostModel, UserModel } from "./models";

export interface IStorage {
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blogs
  getBlogs(): Promise<Blog[]>;
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>;
  getBlogBySlugAndClientId(slug: string, clientId: string): Promise<Blog | undefined>;
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
  getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined>;
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
  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username });
    return doc ? (doc.toObject() as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    await user.save();
    return user.toObject() as User;
  }

  async getBlogs(): Promise<Blog[]> {
    try {
      const docs = await BlogModel.find().sort({ createdAt: -1 });
      return docs.map(doc => {
        const obj = doc.toObject();
        return {
          ...obj,
          id: obj.id || (doc as any).id || 0
        } as Blog;
      });
    } catch {
      throw new Error("Failed to load blogs");
    }
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ id });
    return doc ? (doc.toObject() as Blog) : undefined;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ slug });
    return doc ? (doc.toObject() as Blog) : undefined;
  }

  /**
   * Tenant-isolated blog fetch: ONLY returns the blog if it belongs to the
   * specified clientId AND is published. Prevents cross-tenant slug collisions.
   */
  async getBlogBySlugAndClientId(slug: string, clientId: string): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ slug, clientId, isPublished: true });
    return doc ? (doc.toObject() as Blog) : undefined;
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const blog = new BlogModel({ ...insertBlog, publishedAt: new Date() });
    await blog.save();
    return blog.toObject() as Blog;
  }

  async updateBlog(id: number, updates: Partial<InsertBlog>): Promise<Blog> {
    const doc = await BlogModel.findOneAndUpdate({ id }, updates, { returnDocument: 'after' });
    if (!doc) throw new Error("Blog not found");
    return doc.toObject() as Blog;
  }

  async deleteBlog(id: number): Promise<void> {
    await BlogModel.deleteOne({ id });
  }

  async getTrends(): Promise<Trend[]> {
    const docs = await TrendModel.find().sort({ createdAt: -1 });
    return docs.map(doc => doc.toObject() as Trend);
  }

  async createTrend(trend: { topic: string; volume?: number }): Promise<Trend> {
    const doc = new TrendModel(trend);
    await doc.save();
    return doc.toObject() as Trend;
  }

  async clearTrends(): Promise<void> {
    await TrendModel.deleteMany({});
  }

  async getExternalSites(): Promise<ExternalSite[]> {
    const docs = await ExternalSiteModel.find().sort({ createdAt: -1 });
    return docs.map(doc => doc.toObject() as ExternalSite);
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ id });
    return doc ? (doc.toObject() as ExternalSite) : undefined;
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ clientId });
    return doc ? (doc.toObject() as ExternalSite) : undefined;
  }

  async getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined> {
    // Basic normalization: remove trailing slash and protocol for comparison if needed, 
    // but here we match the full siteUrl stored.
    const normalizedOrigin = origin.replace(/\/$/, "");
    const doc = await ExternalSiteModel.findOne({ 
      $or: [
        { siteUrl: normalizedOrigin },
        { siteUrl: normalizedOrigin + "/" }
      ]
    });
    return doc ? (doc.toObject() as ExternalSite) : undefined;
  }

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const clientId = site.siteType === "embed_widget" ? crypto.randomUUID() : null;
    const doc = new ExternalSiteModel({ ...site, clientId });
    await doc.save();
    return doc.toObject() as ExternalSite;
  }

  async updateExternalSite(id: number, updates: Partial<InsertExternalSite>): Promise<ExternalSite> {
    const doc = await ExternalSiteModel.findOneAndUpdate({ id }, updates, { returnDocument: 'after' });
    if (!doc) throw new Error("Site not found");
    return doc.toObject() as ExternalSite;
  }

  async deleteExternalSite(id: number): Promise<void> {
    await ExternalSiteModel.deleteOne({ id });
  }

  async getScheduledPosts(): Promise<ScheduledPost[]> {
    const docs = await ScheduledPostModel.find().sort({ createdAt: -1 });
    return docs.map(doc => doc.toObject() as ScheduledPost);
  }

  async getScheduledPost(id: number): Promise<ScheduledPost | undefined> {
    const doc = await ScheduledPostModel.findOne({ id });
    return doc ? (doc.toObject() as ScheduledPost) : undefined;
  }

  async getPendingDueScheduledPosts(): Promise<ScheduledPost[]> {
    const now = new Date();
    const docs = await ScheduledPostModel.find({
      status: "pending",
      scheduledAt: { $lte: now }
    });
    return docs.map(doc => doc.toObject() as ScheduledPost);
  }

  async createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
    const doc = new ScheduledPostModel(post);
    await doc.save();
    return doc.toObject() as ScheduledPost;
  }

  async updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost> {
    const doc = await ScheduledPostModel.findOneAndUpdate({ id }, updates, { returnDocument: 'after' });
    if (!doc) throw new Error("Post not found");
    return doc.toObject() as ScheduledPost;
  }

  async deleteScheduledPost(id: number): Promise<void> {
    await ScheduledPostModel.deleteOne({ id });
  }
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(insertUser).returning();
    return newUser;
  }

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

  /**
   * Tenant-isolated blog fetch via Drizzle (SQL backend).
   */
  async getBlogBySlugAndClientId(slug: string, clientId: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(
      and(eq(blogs.slug, slug), eq(blogs.clientId, clientId), eq(blogs.isPublished, true))
    );
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

  async getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined> {
    const normalizedOrigin = origin.replace(/\/$/, "");
    const [site] = await db.select().from(externalSites).where(
      or(
        eq(externalSites.siteUrl, normalizedOrigin),
        eq(externalSites.siteUrl, normalizedOrigin + "/")
      )
    );
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
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private trends: Map<number, Trend>;
  private externalSites: Map<number, ExternalSite>;
  private scheduledPosts: Map<number, ScheduledPost>;
  private userId: number;
  private blogId: number;
  private trendId: number;
  private siteId: number;
  private postId: number;

  private storagePath: string;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.trends = new Map();
    this.externalSites = new Map();
    this.scheduledPosts = new Map();
    this.userId = 1;
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
        users: Array.from(this.users.entries()),
        blogs: Array.from(this.blogs.entries()),
        trends: Array.from(this.trends.entries()),
        externalSites: Array.from(this.externalSites.entries()),
        scheduledPosts: Array.from(this.scheduledPosts.entries()),
        blogId: this.blogId,
        trendId: this.trendId,
        siteId: this.siteId,
        postId: this.postId,
        userId: this.userId
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch {
      // Silent — disk write failure doesn't crash the app
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = JSON.parse(fs.readFileSync(this.storagePath, "utf-8"));
        this.users = new Map(data.users || []);
        this.blogs = new Map(data.blogs);
        this.trends = new Map(data.trends);
        this.externalSites = new Map(data.externalSites);
        this.scheduledPosts = new Map(data.scheduledPosts);
        this.blogId = data.blogId;
        this.trendId = data.trendId;
        this.siteId = data.siteId;
        this.postId = data.postId;
        this.userId = data.userId || 1;
        
        // Convert date strings back to Date objects and check for env overrides
        this.users.forEach(u => u.createdAt = new Date(u.createdAt));
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
    } catch {
      // Silent — disk read failure falls back to empty state
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    this.loadFromDisk();
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    this.saveToDisk();
    return user;
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

  /**
   * Tenant-isolated blog fetch for in-memory storage.
   */
  async getBlogBySlugAndClientId(slug: string, clientId: string): Promise<Blog | undefined> {
    return Array.from(this.blogs.values()).find(
      b => b.slug === slug && b.clientId === clientId && b.isPublished === true
    );
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = this.blogId++;
    const blog: Blog = { 
      ...insertBlog, 
      id, 
      clientId: insertBlog.clientId ?? null,
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

  async getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined> {
    const normalizedOrigin = origin.replace(/\/$/, "");
    return Array.from(this.externalSites.values()).find(s => 
      s.siteUrl.replace(/\/$/, "") === normalizedOrigin
    );
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
