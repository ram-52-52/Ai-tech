import { storage } from "../storage";
import axios from "axios";

/**
 * Helper to invalidate external caches (e.g. Next.js On-Demand Revalidation)
 * whenever a blog's status or content changes.
 */
export const invalidateCache = async (clientId?: string) => {
  if (!clientId || clientId === "") return;
  
  try {
    const site = await storage.getExternalSiteByClientId(clientId);
    if (site && site.siteType === "embed_widget" && site.siteUrl) {
      const baseUrl = site.siteUrl.replace(/\/$/, "");
      
      // Real-Time Synchronization: Trigger the revalidation hook on the live site.
      // This implementation supports standard Next.js revalidatePath/revalidateTag systems.
      // The secondary client-side check of isPublished strictly happens at the API level.
      await axios.get(`${baseUrl}/api/revalidate?tag=blogs&clientId=${clientId}`, { 
        timeout: 3000,
        headers: {
          'x-revalidate-secret': process.env.REVALIDATION_SECRET || 'sync-token-2024'
        }
      }).catch(() => {
        // Silently catch if the site doesn't have the endpoint implemented yet
      });
    }
  } catch (err) {
    // Fail silently to avoid blocking main execution flow
  }
};
