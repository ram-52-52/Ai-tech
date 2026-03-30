import { Request, Response } from "express";
import { storage } from "../storage";
import { fetchTrends } from "../services/trends";

export const getTrends = async (_req: Request, res: Response) => {
  try {
    const fetchedTrendsData = await fetchTrends();
    await storage.clearTrends();
    const top10 = fetchedTrendsData.slice(0, 10);
    for (const t of top10) {
      await storage.createTrend({ topic: t.topic, volume: t.volume });
    }
  } catch {}
  
  const trendsList = await storage.getTrends();
  res.json(trendsList);
};

export const refreshTrends = async (_req: Request, res: Response) => {
  try {
    const fetchedTrendsData = await fetchTrends();
    await storage.clearTrends();
    for (const t of fetchedTrendsData) {
      await storage.createTrend({ topic: t.topic, volume: t.volume });
    }
    const newTrendsList = await storage.getTrends();
    res.json(newTrendsList);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to refresh trends" });
  }
};
