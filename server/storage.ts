import { db } from "./db";
import { blogs, trends, externalSites, scheduledPosts, users, logs, inquiries, type Blog, type InsertBlog, type Trend, type ExternalSite, type InsertExternalSite, type ScheduledPost, type InsertScheduledPost, type User, type InsertUser, type Log, type InsertLog, type Inquiry, type InsertInquiry } from "../shared/schema";
import { eq, desc, lte, and, or, like, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BlogModel, TrendModel, ExternalSiteModel, ScheduledPostModel, UserModel, LogModel, InquiryModel } from "./models";

export interface IStorage {
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser & { role?: string; plan?: string }): Promise<User>;
  deleteUser(id: number): Promise<void>;
  deleteUserData(clientId: string): Promise<void>;
  incrementUserBlogCount(userId: number): Promise<void>;
  getGlobalStats(): Promise<{
    totalUsers: number;
    totalBlogs: number;
    totalPublished: number;
    totalDrafts: number;
  }>;

  // Blogs
  getBlogs(clientId?: string, isPublished?: boolean): Promise<Blog[]>;
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
  getExternalSites(clientId?: string): Promise<ExternalSite[]>;
  getExternalSite(id: number): Promise<ExternalSite | undefined>;
  getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined>;
  getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined>;
  createExternalSite(site: InsertExternalSite): Promise<ExternalSite>;
  updateExternalSite(id: number, site: Partial<InsertExternalSite>): Promise<ExternalSite>;
  deleteExternalSite(id: number): Promise<void>;

  // Scheduled Posts
  getScheduledPosts(clientId?: string): Promise<ScheduledPost[]>;
  getScheduledPost(id: number): Promise<ScheduledPost | undefined>;
  getPendingDueScheduledPosts(): Promise<ScheduledPost[]>;
  createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost>;
  updateScheduledPost(id: number, updates: Partial<Pick<ScheduledPost, "status" | "postedAt" | "errorMessage">>): Promise<ScheduledPost>;
  deleteScheduledPost(id: number): Promise<void>;

  // Logs
  getLogs(options?: { userId?: number; page?: number; limit?: number }): Promise<{ logs: Log[]; total: number }>;
  createLog(log: InsertLog & { userId?: number; username?: string }): Promise<Log>;

  // Inquiries
  getInquiries(options?: { page?: number; limit?: number; search?: string }): Promise<{ inquiries: Inquiry[]; total: number }>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;

  // Plans
  getPlans(): Promise<any[]>;
  getPlanByName(name: string): Promise<any | undefined>;
  createPlan(plan: any): Promise<any>;
  updatePlan(name: string, updates: any): Promise<any>;
  seedPlans(): Promise<void>;
}

export class MongoStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username });
    if (!doc) return undefined;
    const obj = doc.toObject();
    return { ...obj, role: obj.role || 'user' } as User;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const doc = await UserModel.findOne({ id });
    if (!doc) return undefined;
    const obj = doc.toObject();
    return { ...obj, role: obj.role || 'user' } as User;
  }

  async getUsers(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map(doc => {
      const obj = doc.toObject();
      return { ...obj, role: obj.role || 'user' } as User;
    });
  }

  async createUser(insertUser: InsertUser & { role?: string; plan?: string }): Promise<User> {
    const user = new UserModel({ 
      ...insertUser, 
      role: insertUser.role || 'user',
      plan: insertUser.plan || 'Free Trial'
    });
    await user.save();
    return user.toObject() as User;
  }

  async deleteUser(id: number): Promise<void> {
    await UserModel.deleteOne({ id });
  }

  async deleteUserData(clientId: string): Promise<void> {
    await Promise.all([
      BlogModel.deleteMany({ clientId }),
      ScheduledPostModel.deleteMany({ clientId }),
      ExternalSiteModel.deleteMany({ clientId })
    ]);
  }

  async incrementUserBlogCount(userId: number): Promise<void> {
    await UserModel.findOneAndUpdate({ id: userId }, { $inc: { blogsGeneratedThisMonth: 1 } });
  }

  async getGlobalStats(): Promise<{ totalUsers: number; totalBlogs: number; totalPublished: number; totalDrafts: number; }> {
    const totalBlogs = await BlogModel.countDocuments();
    const totalPublished = await BlogModel.countDocuments({ isPublished: true });
    const totalDrafts = await BlogModel.countDocuments({ isPublished: false });
    
    // Count only users who are NOT superadmins
    const users = await UserModel.find({ role: { $ne: 'superadmin' } });
    const totalUsers = users.length;
    const logMsg = `[Storage] getGlobalStats: Found ${totalUsers} clients. Users: ${users.map(u => u.username).join(', ')}\n`;
    fs.appendFileSync("debug.log", logMsg);

    return { totalUsers, totalBlogs, totalPublished, totalDrafts };
  }

  async getBlogs(clientId?: string, isPublished?: boolean): Promise<Blog[]> {
    try {
      // If clientId is provided, find blogs for that client.
      // If clientId is undefined (Super Admin case), find all blogs.
      // If clientId is null or empty string, it's an invalid/new profile, so return empty array.
      if (clientId === "" || clientId === null) {
        return [];
      }
      
      const query: any = clientId ? { clientId } : {};
      if (isPublished !== undefined) {
          query.isPublished = isPublished;
      }
      const docs = await BlogModel.find(query).sort({ createdAt: -1 });
      return docs.map(doc => {
        const obj = doc.toObject();
        return {
          ...obj,
          id: obj.id || (doc as any).id || 0,
          metaDescription: obj.metaDescription || null,
          tags: obj.tags || null,
          imageUrl: obj.imageUrl || null,
          featuredMediaProvider: obj.featuredMediaProvider || null,
          isPublished: obj.isPublished ?? false,
          publishedAt: obj.publishedAt || null,
          scheduledAt: obj.scheduledAt || null,
          createdAt: obj.createdAt || new Date()
        } as Blog;
      });
    } catch (err: any) {
      console.error("[Storage] getBlogs error:", err);
      return [];
    }
  }

  async getBlog(id: number): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ id });
    const obj = doc?.toObject();
    return obj ? {
      ...obj,
      metaDescription: obj.metaDescription || null,
      tags: obj.tags || null,
      imageUrl: obj.imageUrl || null,
      featuredMediaProvider: obj.featuredMediaProvider || null,
      isPublished: obj.isPublished ?? false,
      publishedAt: obj.publishedAt || null,
      scheduledAt: obj.scheduledAt || null,
      createdAt: obj.createdAt || new Date()
    } as Blog : undefined;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    const doc = await BlogModel.findOne({ slug });
    const obj = doc?.toObject();
    return obj ? {
      ...obj,
      metaDescription: obj.metaDescription || null,
      tags: obj.tags || null,
      imageUrl: obj.imageUrl || null,
      featuredMediaProvider: obj.featuredMediaProvider || null,
      isPublished: obj.isPublished ?? false,
      publishedAt: obj.publishedAt || null,
      scheduledAt: obj.scheduledAt || null,
      createdAt: obj.createdAt || new Date()
    } as Blog : undefined;
  }

  /**
   * Tenant-isolated blog fetch: ONLY returns the blog if it belongs to the
   * specified clientId AND is published. Prevents cross-tenant slug collisions.
   */
  async getBlogBySlugAndClientId(slug: string, clientId: string): Promise<Blog | undefined> {
    const now = new Date();
    // Double-Gate Gate: ONLY Published AND (No Schedule OR Schedule Passed)
    const doc = await BlogModel.findOne({ 
      slug, 
      clientId, 
      isPublished: true,
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $lte: now } }
      ]
    });
    const obj = doc?.toObject();
    return obj ? {
      ...obj,
      metaDescription: obj.metaDescription || null,
      tags: obj.tags || null,
      imageUrl: obj.imageUrl || null,
      featuredMediaProvider: obj.featuredMediaProvider || null,
      isPublished: obj.isPublished ?? false,
      publishedAt: obj.publishedAt || null,
      scheduledAt: obj.scheduledAt || null,
      createdAt: obj.createdAt || new Date()
    } as Blog : undefined;
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

  async getExternalSites(clientId?: string): Promise<ExternalSite[]> {
    try {
      const query = clientId ? { clientId } : {};
      const docs = await ExternalSiteModel.find(query).sort({ createdAt: -1 });
      return docs.map(doc => doc.toObject() as ExternalSite);
    } catch {
      return [];
    }
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ id });
    return doc ? (doc.toObject() as ExternalSite) : undefined;
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    const doc = await ExternalSiteModel.findOne({ clientId, siteType: 'embed_widget', isEnabled: true });
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
    // Preserve the user's clientId for tenant isolation on ALL site types
    const doc = new ExternalSiteModel({ ...site });
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

  async getScheduledPosts(clientId?: string): Promise<ScheduledPost[]> {
    try {
      const query = clientId ? { clientId } : {};
      const docs = await ScheduledPostModel.find(query).sort({ scheduledAt: -1 });
      return docs.map(doc => {
        const obj = doc.toObject();
        return {
          ...obj,
          clientId: obj.clientId || null,
          postedAt: obj.postedAt || null,
          errorMessage: obj.errorMessage || null,
        } as ScheduledPost;
      });
    } catch {
      throw new Error("Failed to load scheduled posts");
    }
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

  async getLogs(options: { userId?: number; page?: number; limit?: number; search?: string } = {}): Promise<{ logs: Log[]; total: number }> {
    const { userId, page = 1, limit = 20, search } = options;
    const query: any = {};
    if (userId) query.userId = userId;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await LogModel.countDocuments(query);
    const docs = await LogModel.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      logs: docs.map(doc => doc.toObject() as Log),
      total
    };
  }

  async createLog(insertLog: InsertLog & { userId?: any; username?: string; clientId?: string }): Promise<Log> {
    const log = new LogModel({
      ...insertLog,
      timestamp: new Date()
    });
    await log.save();
    return log.toObject() as Log;
  }

  // Inquiry Implementation
  async getInquiries(options: { page?: number; limit?: number; search?: string } = {}): Promise<{ inquiries: Inquiry[]; total: number }> {
    const { page = 1, limit = 10, search } = options;
    const query: any = {};
    if (search) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
        { message: { $regex: escapedSearch, $options: 'i' } }
      ];
    }
    const total = await InquiryModel.countDocuments(query);
    const docs = await InquiryModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      inquiries: docs.map(doc => doc.toObject() as Inquiry),
      total
    };
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const doc = new InquiryModel(insertInquiry);
    await doc.save();
    return doc.toObject() as Inquiry;
  }

  // Plan Implementation
  async getPlans(): Promise<any[]> {
    const { PlanModel } = await import("./models");
    return await PlanModel.find().sort({ priceMonthly: 1 });
  }

  async getPlanByName(name: string): Promise<any | undefined> {
    const { PlanModel } = await import("./models");
    return await PlanModel.findOne({ name });
  }

  async createPlan(plan: any): Promise<any> {
    const { PlanModel } = await import("./models");
    const doc = new PlanModel(plan);
    await doc.save();
    return doc.toObject();
  }

  async updatePlan(name: string, updates: any): Promise<any> {
    const { PlanModel } = await import("./models");
    const doc = await PlanModel.findOneAndUpdate({ name }, updates, { new: true, upsert: true });
    return doc.toObject();
  }

  async seedPlans(): Promise<void> {
    const { PlanModel } = await import("./models");
    const starterExists = await PlanModel.findOne({ name: "Starter" });
    if (starterExists) return;
    
    // Clear legacy plans if we are switching to the new 3-tier model
    await PlanModel.deleteMany({});

    const defaultPlans = [
      { 
        name: "Starter", 
        priceMonthly: 499, 
        priceYearly: 4990, // ~20% discount (10 months)
        blogLimit: 3, 
        features: ["3 AI Blogs / month", "Auto-Scheduling", "Multi-language support", "Community Support"],
        isMostPopular: false
      },
      { 
        name: "Growth", 
        priceMonthly: 1499, 
        priceYearly: 14990, 
        blogLimit: 10, 
        features: ["10 AI Blogs / month", "Advanced SEO formatting", "Auto AI Images", "Priority Support"],
        isMostPopular: true
      },
      { 
        name: "Pro", 
        priceMonthly: 3999, 
        priceYearly: 39990, 
        blogLimit: 30, 
        features: ["30 AI Blogs / month", "Bulk Content Generation", "Custom Workflows", "Dedicated Manager"],
        isMostPopular: false
      }
    ];

    // Use create instead of insertMany to ensure pre-save hooks (for numeric id) are triggered
    await PlanModel.create(defaultPlans);
    console.log("[Storage] Default plans seeded");
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

  async getUserById(_id: number): Promise<User | undefined> {
    throw new Error("Not implemented");
  }

  async getUsers(): Promise<User[]> {
    throw new Error("Not implemented");
  }

  async deleteUser(_id: number): Promise<void> {
    throw new Error("Not implemented");
  }

  async deleteUserData(_clientId: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async incrementUserBlogCount(userId: number): Promise<void> {
    await db.update(users)
      .set({ blogsGeneratedThisMonth: sql`${users.blogsGeneratedThisMonth} + 1` })
      .where(eq(users.id, userId));
  }

  async getGlobalStats(): Promise<{ totalUsers: number; totalBlogs: number; totalPublished: number; totalDrafts: number; }> {
    // Basic implementation for SQL (Drizzle)
    // In a real app we'd use select count()
    const allUsers = await db.select().from(users).where(eq(users.role, 'user'));
    const allBlogs = await db.select().from(blogs);
    return {
      totalUsers: allUsers.length,
      totalBlogs: allBlogs.length,
      totalPublished: allBlogs.filter((b: Blog) => b.isPublished).length,
      totalDrafts: allBlogs.filter((b: Blog) => !b.isPublished).length
    };
  }

  async getBlogs(clientId?: string, isPublished?: boolean): Promise<Blog[]> {
    const filters = [];
    if (clientId) filters.push(eq(blogs.clientId, clientId));
    if (isPublished !== undefined) filters.push(eq(blogs.isPublished, isPublished));
    
    if (filters.length > 0) {
      return await db.select().from(blogs).where(and(...filters)).orderBy(desc(blogs.createdAt));
    }
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
    const now = new Date();
    const [blog] = await db.select().from(blogs).where(
      and(
        eq(blogs.slug, slug), 
        eq(blogs.clientId, clientId), 
        eq(blogs.isPublished, true),
        or(
          sql`${blogs.scheduledAt} IS NULL`,
          lte(blogs.scheduledAt, now)
        )
      )
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

  async getExternalSites(clientId?: string): Promise<ExternalSite[]> {
    if (clientId) {
      return await db.select().from(externalSites).where(eq(externalSites.clientId, clientId)).orderBy(desc(externalSites.createdAt));
    }
    return await db.select().from(externalSites).orderBy(desc(externalSites.createdAt));
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    const [site] = await db.select().from(externalSites).where(eq(externalSites.id, id));
    return site;
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    const [site] = await db.select().from(externalSites).where(
      and(eq(externalSites.clientId, clientId), eq(externalSites.siteType, 'embed_widget'), eq(externalSites.isEnabled, true))
    );
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
    // Preserve the user's clientId for tenant isolation on ALL site types
    const [newSite] = await db.insert(externalSites).values({ ...site }).returning();
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

  async getScheduledPosts(clientId?: string): Promise<ScheduledPost[]> {
    if (clientId) {
      return await db.select().from(scheduledPosts).where(eq(scheduledPosts.clientId, clientId)).orderBy(desc(scheduledPosts.scheduledAt));
    }
    return await db.select().from(scheduledPosts).orderBy(desc(scheduledPosts.scheduledAt));
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

  async getLogs(options: { userId?: number; page?: number; limit?: number } = {}): Promise<{ logs: Log[]; total: number }> {
    // Basic placeholder for SQL backend
    const { userId, page = 1, limit = 20 } = options;
    const all = await db.select().from(logs).where(userId ? eq(logs.userId, userId) : undefined).orderBy(desc(logs.timestamp));
    return {
      logs: all.slice((page - 1) * limit, page * limit),
      total: all.length
    };
  }

  async createLog(insertLog: InsertLog & { userId?: number; username?: string }): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  async getInquiries(options: { page?: number; limit?: number; search?: string } = {}): Promise<{ inquiries: Inquiry[]; total: number }> {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let query = db.select().from(inquiries);
    
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      query = query.where(
        or(
          like(sql`lower(${inquiries.name})`, searchPattern),
          like(sql`lower(${inquiries.email})`, searchPattern),
          like(sql`lower(${inquiries.message})`, searchPattern)
        )
      ) as any;
    }

    const allInquiries = await query.orderBy(desc(inquiries.createdAt));
    const total = allInquiries.length;
    
    return {
      inquiries: allInquiries.slice(offset, offset + limit),
      total
    };
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async getPlans(): Promise<any[]> { return []; }
  async getPlanByName(_name: string): Promise<any | undefined> { return undefined; }
  async createPlan(_plan: any): Promise<any> { return {}; }
  async updatePlan(_name: string, _updates: any): Promise<any> { return {}; }
  async seedPlans(): Promise<void> { }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private trends: Map<number, Trend>;
  private externalSites: Map<number, ExternalSite>;
  private scheduledPosts: Map<number, ScheduledPost>;
  private inquiries: Map<number, Inquiry>;
  private userId: number;
  private blogId: number;
  private trendId: number;
  private siteId: number;
  private postId: number;
  private inquiryId: number;

  private storagePath: string;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.trends = new Map();
    this.externalSites = new Map();
    this.scheduledPosts = new Map();
    this.inquiries = new Map();
    this.userId = 1;
    this.blogId = 1;
    this.trendId = 1;
    this.siteId = 1;
    this.postId = 1;
    this.inquiryId = 1;
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
        inquiries: Array.from(this.inquiries.entries()),
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
        this.inquiries = new Map(data.inquiries || []);
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
          if (b.scheduledAt) b.scheduledAt = new Date(b.scheduledAt); // Added
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

  async createUser(insertUser: InsertUser & { role?: string; plan?: string }): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(), 
      role: insertUser.role || 'user',
      plan: insertUser.plan || 'Free Trial',
      blogsGeneratedThisMonth: 0
    };
    this.users.set(id, user);
    this.saveToDisk();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    this.loadFromDisk();
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    this.loadFromDisk();
    return Array.from(this.users.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    this.saveToDisk();
  }

  async deleteUserData(clientId: string): Promise<void> {
    const blogsToDelete = Array.from(this.blogs.values()).filter(b => b.clientId === clientId);
    blogsToDelete.forEach(b => this.blogs.delete(b.id));

    const sitesToDelete = Array.from(this.externalSites.values()).filter(s => s.clientId === clientId);
    sitesToDelete.forEach(s => this.externalSites.delete(s.id));

    const postsToDelete = Array.from(this.scheduledPosts.values()).filter(p => p.clientId === clientId);
    postsToDelete.forEach(p => this.scheduledPosts.delete(p.id));

    this.saveToDisk();
  }

  async getBlogs(clientId?: string, isPublished?: boolean): Promise<Blog[]> {
    this.loadFromDisk();
    let allBlogs = Array.from(this.blogs.values());
    if (clientId) {
      allBlogs = allBlogs.filter(b => b.clientId === clientId);
    }
    if (isPublished !== undefined) {
      allBlogs = allBlogs.filter(b => b.isPublished === isPublished);
    }
    return allBlogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      publishedAt: insertBlog.publishedAt ?? null,
      scheduledAt: insertBlog.scheduledAt ?? null
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

  async getExternalSites(clientId?: string): Promise<ExternalSite[]> {
    this.loadFromDisk();
    let allSites = Array.from(this.externalSites.values());
    if (clientId) {
      allSites = allSites.filter(s => s.clientId === clientId);
    }
    return allSites.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getExternalSite(id: number): Promise<ExternalSite | undefined> {
    this.loadFromDisk();
    return this.externalSites.get(id);
  }

  async getExternalSiteByClientId(clientId: string): Promise<ExternalSite | undefined> {
    this.loadFromDisk();
    return Array.from(this.externalSites.values()).find(s => s.clientId === clientId && s.siteType === 'embed_widget' && s.isEnabled);
  }

  async getExternalSiteByOrigin(origin: string): Promise<ExternalSite | undefined> {
    const normalizedOrigin = origin.replace(/\/$/, "");
    return Array.from(this.externalSites.values()).find(s =>
      s.siteUrl.replace(/\/$/, "") === normalizedOrigin
    );
  }

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const id = this.siteId++;
    // Preserve the user's clientId for tenant isolation on ALL site types
    const newSite: ExternalSite = { ...site, id, clientId: site.clientId ?? null, createdAt: new Date(), isEnabled: site.isEnabled ?? true };
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

  async getScheduledPosts(clientId?: string): Promise<ScheduledPost[]> {
    this.loadFromDisk();
    let allPosts = Array.from(this.scheduledPosts.values());
    if (clientId) {
      allPosts = allPosts.filter(p => p.clientId === clientId);
    }
    return allPosts.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }

  async getScheduledPost(id: number): Promise<ScheduledPost | undefined> {
    return this.scheduledPosts.get(id);
  }

  async getPendingDueScheduledPosts(): Promise<ScheduledPost[]> {
    const now = new Date();
    return Array.from(this.scheduledPosts.values()).filter(p => p.status === "pending" && p.scheduledAt <= now);
  }

  async createScheduledPost(insertScheduledPost: InsertScheduledPost): Promise<ScheduledPost> {
    const id = this.postId++;
    const post: ScheduledPost = {
      ...insertScheduledPost,
      id,
      clientId: insertScheduledPost.clientId ?? null,
      status: "pending",
      postedAt: null,
      errorMessage: null,
      createdAt: new Date(),
    };
    this.scheduledPosts.set(id, post);
    this.saveToDisk();
    return post;
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

  async getLogs(options: { userId?: number; page?: number; limit?: number } = {}): Promise<{ logs: Log[]; total: number }> {
    const { userId, page = 1, limit = 20 } = options;
    const all = Array.from((this as any).logs?.values() || []) as Log[];
    const filtered = userId ? all.filter(l => l.userId === userId) : all;
    const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return {
      logs: sorted.slice((page - 1) * limit, page * limit),
      total: filtered.length
    };
  }

  async createLog(insertLog: InsertLog & { userId?: number; username?: string }): Promise<Log> {
    const id = Date.now(); // Simple hack for MemStorage log IDs
    const log: Log = {
      ...insertLog,
      id,
      userId: insertLog.userId ?? null,
      username: insertLog.username ?? null,
      details: insertLog.details ?? null,
      timestamp: new Date()
    };
    if (!(this as any).logs) (this as any).logs = new Map();
    (this as any).logs.set(id, log);
    this.saveToDisk();
    return log;
  }

  async getInquiries(options: { page?: number; limit?: number; search?: string } = {}): Promise<{ inquiries: Inquiry[]; total: number }> {
    const { page = 1, limit = 10, search } = options;
    let all = Array.from(this.inquiries.values());
    if (search) {
      const lower = search.toLowerCase();
      all = all.filter(i => 
        i.name.toLowerCase().includes(lower) || 
        i.email.toLowerCase().includes(lower) || 
        i.message.toLowerCase().includes(lower)
      );
    }
    const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      inquiries: sorted.slice((page - 1) * limit, page * limit),
      total: all.length
    };
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryId++;
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      status: insertInquiry.status || 'new',
      createdAt: new Date()
    };
    this.inquiries.set(id, inquiry);
    this.saveToDisk();
    return inquiry;
  }

  async incrementUserBlogCount(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const currentCount = user.blogsGeneratedThisMonth || 0;
      this.users.set(userId, { ...user, blogsGeneratedThisMonth: currentCount + 1 });
      this.saveToDisk();
    }
  }

  async getGlobalStats(): Promise<{ totalUsers: number; totalBlogs: number; totalPublished: number; totalDrafts: number; }> {
    const allUsers = Array.from(this.users.values()).filter(u => u.role !== 'superadmin');
    const allBlogs = Array.from(this.blogs.values());
    return {
      totalUsers: allUsers.length,
      totalBlogs: allBlogs.length,
      totalPublished: allBlogs.filter(b => b.isPublished).length,
      totalDrafts: allBlogs.filter(b => !b.isPublished).length
    };
  }

  async getPlans(): Promise<any[]> { return []; }
  async getPlanByName(_name: string): Promise<any | undefined> { return undefined; }
  async createPlan(_plan: any): Promise<any> { return {}; }
  async updatePlan(_name: string, _updates: any): Promise<any> { return {}; }
  async seedPlans(): Promise<void> { }
}

export const storage = process.env.MONGODB_URI
  ? new MongoStorage()
  : (process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage());
