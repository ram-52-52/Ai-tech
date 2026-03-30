import { storage } from "../storage";

export async function logPlatformAction(userId: number | undefined, username: string | undefined, action: string, details?: string) {
  try {
    await storage.createLog({
      userId,
      username,
      action,
      details: details || null
    });
  } catch (err) {
    console.error("[Logging Error]", err);
  }
}
