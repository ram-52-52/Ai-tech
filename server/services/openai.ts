import OpenAI from "openai";
import { InsertBlog } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateBlogPost(topic: string): Promise<InsertBlog> {
  console.log(`Generating blog post for topic: ${topic}`);

  // Step 1: Generate SEO Metadata (Title, Description, Tags)
  const metaPrompt = `
    You are an SEO expert. 
    Topic: "${topic}"
    Task: 
    1. Create a click-worthy, SEO-optimized title.
    2. Write a compelling meta description (max 160 chars).
    3. Generate 5 relevant tags/keywords.
    4. Create a URL-friendly slug.
    
    Return strictly JSON format:
    {
      "title": "...",
      "metaDescription": "...",
      "tags": ["..."],
      "slug": "..."
    }
  `;

  const metaResponse = await openai.chat.completions.create({
    model: "gpt-5.1", // Using the best model available
    messages: [{ role: "user", content: metaPrompt }],
    response_format: { type: "json_object" },
  });

  const metaData = JSON.parse(metaResponse.choices[0].message.content || "{}");

  // Step 2: Generate Blog Content (HTML)
  const contentPrompt = `
    You are a professional blog writer. Write a comprehensive, engaging blog post about "${topic}".
    Title: "${metaData.title}"
    
    Requirements:
    - Use proper HTML tags (<h1>, <h2>, <p>, <ul>, <li>).
    - No <html>, <head>, or <body> tags, just the article content.
    - Include an introduction, 3-4 main sections with headings, and a conclusion.
    - Tone: Informative, engaging, and professional.
    - Length: ~800-1000 words.
  `;

  const contentResponse = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: contentPrompt }],
  });

  const content = contentResponse.choices[0].message.content || "";

  // Step 3: Generate Image (Optional, for now we use a placeholder or generate one)
  // We can use the image integration we added earlier if we want
  // For now, let's use a placeholder service or leave empty
  const imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(topic)}`;

  return {
    title: metaData.title,
    content: content,
    topic: topic,
    slug: metaData.slug,
    metaDescription: metaData.metaDescription,
    tags: metaData.tags,
    imageUrl: imageUrl,
    isPublished: false, // Default to draft, or true if auto-publishing
    publishedAt: new Date(),
  };
}
