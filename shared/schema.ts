import { pgTable, text, serial, timestamp, boolean, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  clientId: text("client_id"), // Tenant isolation: links blog to its ExternalSite clientId
  title: text("title").notNull(),
  content: text("content").notNull(),
  topic: text("topic").notNull(),
  slug: text("slug").notNull(), // Unique per clientId (enforced at app layer)
  metaDescription: text("meta_description"),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  featuredMediaProvider: text("featured_media_provider"), // 'unsplash', 'huggingface', 'openai', 'static'
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trends = pgTable("trends", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  volume: integer("volume"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const externalSites = pgTable("external_sites", {
  id: serial("id").primaryKey(),
  clientId: text("client_id"), // Tenant isolation: links site to its owner
  siteName: text("site_name").notNull(),
  siteType: text("site_type").notNull(),
  siteUrl: text("site_url").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: serial("id").primaryKey(),
  clientId: text("client_id"), // Tenant isolation: links post to its owner
  blogId: integer("blog_id").notNull(),
  siteId: integer("site_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").default("pending").notNull(),
  postedAt: timestamp("posted_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  clientId: text("client_id").notNull(),
  role: text("role").default("user").notNull(),
  plan: text("plan").default("Free Trial").notNull(),
  blogsGeneratedThisMonth: integer("blogs_generated_this_month").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username"),
  action: text("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertBlogSchema = createInsertSchema(blogs).omit({ 
  id: true, 
  createdAt: true, 
});

export const insertExternalSiteSchema = createInsertSchema(externalSites).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({
  id: true,
  postedAt: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true,
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Trend = typeof trends.$inferSelect;
export type ExternalSite = typeof externalSites.$inferSelect;
export type InsertExternalSite = z.infer<typeof insertExternalSiteSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
