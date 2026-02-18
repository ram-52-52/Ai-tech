import Parser from "rss-parser";

const parser = new Parser();
const GOOGLE_TRENDS_RSS = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";

export interface TrendItem {
  topic: string;
  volume?: number;
}

export async function fetchTrends(): Promise<TrendItem[]> {
  try {
    console.log("Fetching Google Trends...");
    
    // Fetch with custom headers to avoid 404/403
    const response = await fetch(GOOGLE_TRENDS_RSS, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trends: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);
    
    console.log("Feed title:", feed.title);
    console.log("Feed items count:", feed.items.length);

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
    ];
  }
}
