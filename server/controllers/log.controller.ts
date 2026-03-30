import { Request, Response } from "express";
import { storage } from "../storage";

export const getPlatformEvents = async (req: Request, res: Response) => {
  try {
    const { page, limit, userId, search } = req.query;
    console.log(`[API] Fetching logs: page=${page}, limit=${limit}, userId=${userId}, search=${search}`);
    const result = await storage.getLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId: userId && userId !== "all" ? Number(userId) : undefined,
      search: search ? String(search) : undefined
    });
    console.log(`[API] Returning ${result.logs.length} logs (Total: ${result.total})`);
    res.json(result);
  } catch (err: any) {
    console.error("[API Error] /api/admin/platform-events:", err);
    res.status(500).json({ message: err.message });
  }
};
