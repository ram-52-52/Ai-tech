import Parser from "rss-parser";

const parser = new Parser();
const GOOGLE_TRENDS_RSS = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";

export interface TrendItem {
  topic: string;
  volume?: number;
}

export async function fetchTrends(): Promise<TrendItem[]> {
  try {
    
    // Fetch with custom headers to avoid 404/403
    const response = await fetch(`${GOOGLE_TRENDS_RSS}&t=${Date.now()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trends: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);
    

    const trends: TrendItem[] = feed.items.map(item => ({
      topic: item.title || "Unknown Trend",
      volume: parseInt(item.contentSnippet?.match(/(\d+)\+/)?.[1]?.replace(/,/g, '') || "0") || 0 
    }));

    return trends.slice(0, 10); // Return top 10
  } catch (error) {
    console.error("Error fetching trends:", error);
    // Fallback data so the app is usable
    console.log("⚠️ Using fallback trends data.");
    return [
      { topic: "Artificial Intelligence", volume: 50000 },
      { topic: "SpaceX Starship", volume: 20000 },
      { topic: "Sustainable Energy", volume: 15000 },
      { topic: "Quantum Computing", volume: 10000 },
      { topic: "Remote Work Trends", volume: 5000 },
      { topic: "Web Development", volume: 4500 },
      { topic: "Cybersecurity", volume: 4000 },
      { topic: "Climate Change", volume: 3500 },
      { topic: "E-commerce", volume: 3000 },
      { topic: "Blockchain", volume: 2500 },
    ];
  }
}
