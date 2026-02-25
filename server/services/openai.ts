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

  // Step 3: Generate Image using DALL-E (via Replit AI Integrations)
  let imageUrl = `https://placehold.co/1200x630?text=${encodeURIComponent(metaData.title)}`;
  try {
    console.log(`Generating image for: ${metaData.title}`);
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A professional, high-quality blog cover image for: "${metaData.title}". Style: modern, clean, digital art or high-quality photography. No text in the image. Description: ${metaData.metaDescription}`,
      n: 1,
      size: "1024x1024",
    });
    
    if (imageResponse.data && imageResponse.data[0].url) {
      imageUrl = imageResponse.data[0].url;
    }
  } catch (error) {
    console.error("Image generation failed, using placeholder:", error);
  }

  return {
    title: metaData.title,
    content: content,
    topic: topic,
    slug: metaData.slug,
    metaDescription: metaData.metaDescription,
    tags: metaData.tags,
    imageUrl: imageUrl,
    isPublished: false, 
    publishedAt: new Date(),
  };
}
