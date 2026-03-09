import { db } from "./db";
import { blogs, trends, externalSites, scheduledPosts, type Blog, type InsertBlog, type Trend, type ExternalSite, type InsertExternalSite, type ScheduledPost, type InsertScheduledPost } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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
  createExternalSite(site: InsertExternalSite): Promise<ExternalSite>;
  updateExternalSite(id: number, site: Partial<InsertExternalSite>): Promise<ExternalSite>;
  deleteExternalSite(id: number): Promise<void>;

  // Scheduled Posts
  getScheduledPosts(): Promise<ScheduledPost[]>;
  getScheduledPost(id: number): Promise<ScheduledPost | undefined>;
  createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost>;
  updateScheduledPost(id: number, post: Partial<InsertScheduledPost>): Promise<ScheduledPost>;
  deleteScheduledPost(id: number): Promise<void>;
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
    const [blog] = await db.insert(blogs).values(insertBlog).returning();
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

  async createExternalSite(site: InsertExternalSite): Promise<ExternalSite> {
    const [newSite] = await db.insert(externalSites).values(site).returning();
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

  async createScheduledPost(post: InsertScheduledPost): Promise<ScheduledPost> {
    const [newPost] = await db.insert(scheduledPosts).values(post).returning();
    return newPost;
  }

  async updateScheduledPost(id: number, updates: Partial<InsertScheduledPost>): Promise<ScheduledPost> {
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

export const storage = new DatabaseStorage();
