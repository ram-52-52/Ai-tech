import { pgTable, text, serial, timestamp, boolean, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topic: text("topic").notNull(),
  slug: text("slug").unique().notNull(),
  metaDescription: text("meta_description"),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
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
  blogId: integer("blog_id").notNull(),
  siteId: integer("site_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").default("pending").notNull(),
  postedAt: timestamp("posted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogSchema = createInsertSchema(blogs).omit({ 
  id: true, 
  createdAt: true, 
  publishedAt: true 
});

export const insertExternalSiteSchema = createInsertSchema(externalSites).omit({
  id: true,
  createdAt: true,
});

export const insertScheduledPostSchema = createInsertSchema(scheduledPosts).omit({
  id: true,
  postedAt: true,
  createdAt: true,
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Trend = typeof trends.$inferSelect;
export type ExternalSite = typeof externalSites.$inferSelect;
export type InsertExternalSite = z.infer<typeof insertExternalSiteSchema>;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = z.infer<typeof insertScheduledPostSchema>;
