import cron from "node-cron";
import { storage } from "./storage";
import { fetchTrends } from "./services/trends";
import { generateBlogPost } from "./services/ai";
import { publishBlog } from "./services/publisher";
import { invalidateCache } from "./utils/cache";

export function initializeCronJobs() {
  // --- Cron Job: Auto-Blog (Every 1 Hour) ---
  cron.schedule("0 * * * *", async () => {
    try {
      const trends = await fetchTrends();
      if (trends.length > 0) {
        const topTrend = trends[0];
        const generatedBlog = await generateBlogPost(topTrend.topic);
        await storage.createBlog({ ...generatedBlog, isPublished: true });
      }
    } catch {
      // Silent — cron blog generation failure does not crash the server
    }
  });

  // --- Cron Job: Process Scheduled Posts (Every Minute) ---
  const processScheduledPosts = async () => {
    const duePosts = await storage.getPendingDueScheduledPosts();
    if (duePosts.length === 0) return;

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

      // Draft Guard: Don't push to external sites if not published
      // User Requirement: "Published" must be ON to be seen anywhere
      if (!blog.isPublished) {
        await storage.updateScheduledPost(post.id, {
          status: "failed",
          errorMessage: "Blog is not marked as published",
        });
        continue;
      }

      const result = await publishBlog(blog, site);

      if (result.success) {
        await storage.updateScheduledPost(post.id, {
          status: "posted",
          postedAt: new Date(),
        });
        
        // Ensure the live site is synchronized immediately after automated publication
        await invalidateCache((site.clientId ?? blog.clientId) ?? undefined);
      } else {
        await storage.updateScheduledPost(post.id, {
          status: "failed",
          errorMessage: result.error ?? "Unknown error",
        });
      }
    }
  };

  cron.schedule("* * * * *", processScheduledPosts);
  
  return { processScheduledPosts };
}
