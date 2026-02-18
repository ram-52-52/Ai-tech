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

export const insertBlogSchema = createInsertSchema(blogs).omit({ 
  id: true, 
  createdAt: true, 
  publishedAt: true 
});

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Trend = typeof trends.$inferSelect;

// Enum for status if needed, but boolean isPublished is simple enough for now
