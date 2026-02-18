import { db } from "./db";
import { blogs, trends, type Blog, type InsertBlog, type Trend } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
