import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsertBlog } from "../../shared/schema";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

// Initialize Gemini client
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
if (!apiKey) {
  console.error("[Gemini] ERROR: GEMINI_API_KEY is empty or missing in .env!");
} else {
  console.log(`[Gemini] API Key found (starts with: ${apiKey.substring(0, 8)}... length: ${apiKey.length})`);
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main function to generate a full blog post using Google Gemini
 */
export async function generateBlogPost(topic: string): Promise<InsertBlog> {
  console.log(`[Service] Generating professional English blog post via Gemini for: ${topic}`);

  const cleanInstructionalPrompt = (text: string) => {
    let cleaned = text.trim();
    const preamblePatterns = [
      /^[\s\S]*?(act as a|write a|create a|generate a|please write|i want a|provide a|as a|you are a|you are given)\s+/gi,
      /^(professional|expert|senior|high-quality|long-form|seo-optimized|visual|designer|writer|editor|strategist|strategist and)\s+/gi,
      /^(designer|writer|editor|strategist|analyst|specialist|expert)\b\s*(and|&)?\s*/gi,
      /^(generate|write|create|provide|produce)\s+(a|an)\s+(unique|elegant|professional|long-form|high-quality)\s+/gi,
      /^(blog post|article|content|post|story)\s+(for|about|on|focused on)\s+/gi
    ];
    preamblePatterns.forEach(p => cleaned = cleaned.replace(p, '').trim());
    return cleaned || "Digital Transformation";
  };

  const sanitizeTitle = (title: string) => {
    let t = title.split('\n')[0].trim();
    t = t.replace(/^["']|["']$/g, ''); 
    return t.trim() || "Insights & Trends";
  };

  const sanitizeFinalContent = (html: string) => {
    let cleaned = html
      .replace(/^(this comprehensive guide|write a professional|act as a|follow this|instructions:|guidelines:|here is|ok|sure|certainly|i will).*?<\/(p|h1)>/gi, '') 
      .replace(/<p>\s*(here is|ok|sure|certainly|i will).*?<\/p>/gi, '')
      .replace(/^(here is|ok|sure|certainly|i will|below is).*?:\s*$/gim, '')
      .trim();

    // Convert potential Markdown images ![alt](url) to HTML <img> tags
    cleaned = cleaned.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-2xl shadow-lg my-8 w-full">');
    
    return cleaned;
  };

  const pureSubject = cleanInstructionalPrompt(topic);
  const fallbackTitle = sanitizeTitle(pureSubject);
  const mockSlug = pureSubject.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50) + '-' + Date.now();
  
  let metaData = {
    title: fallbackTitle,
    metaDescription: `Comprehensive guide and insights on ${topic}.`,
    tags: [topic.split(' ')[0] || "tech", "ai", "trends"],
    slug: mockSlug
  };

  // 1. Step 1: SEO Metadata (Gemini)
  try {
    const metaModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    const metaPrompt = `You are an SEO expert. Topic: "${topic}". Return strictly JSON: { "title": "...", "metaDescription": "...", "tags": ["..."], "slug": "..." }`;
    const result = await metaModel.generateContent(metaPrompt);
    let metaContent = result.response.text();
    if (metaContent) {
      metaContent = metaContent.trim();
      if (metaContent.startsWith("```")) {
         metaContent = metaContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      try {
        const parsed = JSON.parse(metaContent);
        if (parsed.title) metaData = { ...metaData, title: sanitizeTitle(parsed.title), metaDescription: parsed.metaDescription, tags: parsed.tags, slug: parsed.slug };
      } catch (e) {
        console.warn("[Gemini] Failed to parse meta JSON, raw output was:", metaContent);
      }
    }
    console.log("[Gemini] Meta generation process completed.");
  } catch (error: any) {
    console.warn("[Gemini] Meta generation failed, using fallbacks.", error.message);
  }

  const slug = metaData.slug || mockSlug;

  // 2. Step 2: Blog Content (Gemini)
  let content = "";
  try {
    const textModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });
    
    // Using gemini to natively output the HTML structure.
    const contentPrompt = `You are an elite SEO Content Strategist and Industry Analyst. Write an EXTRAORDINARILY LONG, exhaustive, and deeply researched blog post about "${pureSubject}". 
   
   GOAL: Minimum 2000-2500 words of extremely high-value content.
   
   CRITICAL CONSTRAINTS:
   1. Output ONLY high-quality HTML. NO Markdown, NO triple backticks, NO code blocks.
   2. NO conversational preamble. Start with the first <h1> immediately.
   3. STRUCTURE:
      - At least 25-30 massive paragraphs with deep technical and industry insights.
      - Use a rich hierarchical structure (<h2>, <h3>, <h4>).
      - Include "Deep Dive" sections for sub-topics.
      - Include 3-4 professional image tags inside the content: 
        (e.g. <img src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1200" alt="Relevant Keyword">).
   4. CONTENT DEPTH:
      - Cover historical context, current state, and future predictions in separate, long sections.
      - Provide "Actionable Strategies" and "Case Study" style analysis.
   
   Tone: Authoritative, inviting, and professional.
   Language: English.`;
    
    const contentResult = await textModel.generateContent(contentPrompt);
    let rawText = "";
    try {
      rawText = contentResult.response.text() || "";
    } catch (textErr: any) {
      fs.appendFileSync("debug_ai.log", `[Gemini] Error calling .text(): ${textErr.message}\n`, "utf8");
      throw textErr;
    }
    
    fs.appendFileSync("debug_ai.log", `[Gemini] Raw response received. Length: ${rawText.length} characters.\n`, "utf8");
    
    // Clean up potential markdown formatting that Gemini might still output
    rawText = rawText.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }
    
    content = sanitizeFinalContent(rawText);
    if (!content || content.length < 100) {
      throw new Error(`Content generated was too short or empty.`);
    }
  } catch (error: any) {
    console.warn(`[Gemini] Content generation failed: ${error.message}. Attempting OpenAI Fallback...`);
    
    // ATTEMPT 2: OpenAI Fallback (Superior to static template)
    try {
      const openAIKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      if (openAIKey) {
        console.log("[Service] Falling back to OpenAI for content generation...");
        const openai = new OpenAI({ apiKey: openAIKey.trim() });
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are an elite SEO expert. Generate an EXTRAORDINARILY LONG (2000+ words) professional blog post in HTML format. NO Markdown. Use <h1>, <h2>, <h3>, 4-5 images tags: <img src='https://images.unsplash.com/photo-RELEVANT?w=1200' alt='keyword'> to place images." 
            },
            { role: "user", content: `Write an exhaustive, data-rich article about "${pureSubject}".` }
          ],
          temperature: 0.7,
        });

        const rawText = response.choices[0]?.message?.content || "";
        content = sanitizeFinalContent(rawText);
        if (content && content.length > 500) {
          console.log("[OpenAI] Fallback generation successful.");
          return {
            title: metaData.title,
            content: await resolveContentImages(content),
            topic: topic,
            slug: slug,
            metaDescription: metaData.metaDescription || `Full analysis on ${topic}`,
            tags: metaData.tags || ["tech", "ai"],
            imageUrl: (await generateImageForBlog(metaData.title, slug)).url,
            featuredMediaProvider: 'openai',
            isPublished: false,
          };
        }
      }
    } catch (oaErr: any) {
      console.warn("[OpenAI] Fallback also failed:", oaErr.message);
    }

    // ATTEMPT 3: Static Template (Last Resort)
    console.warn("[Service] Using static template as last resort.");
    content = `
      <h1>${metaData.title}</h1>
      <p>In today's rapidly evolving digital landscape, <strong>${pureSubject}</strong> has emerged as a transformative force, reshaping how organizations and individuals approach their strategic goals. This comprehensive analysis dives deep into the core mechanics, current trends, and future projections that are defining the industry in 2025.</p>
      
      <img src="https://loremflickr.com/1200/600/${encodeURIComponent(pureSubject).replace(/%20/g, ',')}?lock=1" alt="${pureSubject} trends" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h2>The Strategic Impact of ${pureSubject}</h2>
      <p>Understanding the multi-faceted nature of ${pureSubject} is essential for professionals looking to stay ahead of the curve. Unlike traditional methodologies, the current framework prioritizes agility, data-driven decision making, and seamless user experiences. This transition didn't happen overnight; it is the result of years of iterative development and a fundamental shift in how we perceive technological integration.</p>
      
      <p>As we look at the leading organizations in this space, a common pattern emerges: a relentless focus on core fundamentals combined with the courage to experiment with emerging technologies. This "Dual-Speed" strategy allows for both stability and rapid innovation, ensuring that ${pureSubject} remains a sustainable part of the ecosystem.</p>

      <h2>Core Pillars and Architectural Principles</h2>
      <p>Every successful implementation of ${pureSubject} rests upon several foundational pillars. These range from robust data pipelines to intuitive interface designs that bridge the gap between technical complexity and practical utility. By examining these pillars in detail, we can begin to see the true potential of a fully optimized approach.</p>
      
      <h3>1. Data Fidelity and Integrity</h3>
      <p>Without a clean and reliable source of truth, any initiative involving ${pureSubject} is likely to underperform. Modern leaders are investing heavily in technologies that ensure data remains accurate, accessible, and actionable across all levels of the enterprise.</p>

      <img src="https://loremflickr.com/1200/600/${encodeURIComponent(pureSubject).replace(/%20/g, ',')},strategy?lock=2" alt="Strategic Planning" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h3>2. User-Centric Design Thinking</h3>
      <p>Technological power is useless if it cannot be wielded effectively by humans. The most successful ${pureSubject} platforms are those that prioritize the end-user experience, simplifying complex workflows and providing clear, actionable insights at every step of the journey.</p>

      <h2>Looking Ahead: The Future of ${pureSubject}</h2>
      <p>The trajectory of ${pureSubject} is set for exponential growth as we enter the next phase of the digital era. With the rise of advanced analytics, autonomous systems, and edge computing, the possibilities are virtually limitless. Those who can master the art and science of this field today will be the architects of tomorrow's world.</p>
      
      <img src="https://loremflickr.com/1200/600/${encodeURIComponent(pureSubject).replace(/%20/g, ',')},future?lock=3" alt="Future Outlook" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h3>Conclusion</h3>
      <p>In conclusion, ${pureSubject} is much more than a buzzword; it is a fundamental requirement for success in the modern age. By focusing on quality, relevance, and consistency, we can unlock the true value of this transformative force and build a more efficient, intelligent, and connected future for all.</p>
    `;
  }


  // 4. Step 4: AI Featured Image (Tiered Strategy - Free Tiers Only)
  const imageResult = await generateImageForBlog(metaData.title, slug);
  
  return {
    title: metaData.title,
    content: content,
    topic: topic,
    slug: slug,
    metaDescription: metaData.metaDescription || `Full analysis on ${topic}`,
    tags: metaData.tags || ["tech", "ai"],
    imageUrl: imageResult.url,
    featuredMediaProvider: imageResult.provider,
    isPublished: false,
  };
}

/**
 * Finds all <img> tags in the HTML and replaces placeholder Unsplash URLs with real ones
 */
async function resolveContentImages(html: string): Promise<string> {
  let updatedHtml = html;
  // Regex to find <img> tags, Markdown ![alt](url), and even standalone ![keyword]
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const mdImgRegex = /!\[(.*?)\](?:\((.*?)\))?/gi;
  let match;
  
  const tasks: { target: string, keyword: string }[] = [];

  // Find HTML images
  while ((match = imgRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const src = match[1];
    let keyword = "technology";
    if (src.includes("?")) {
      keyword = src.split("?")[1].replace(/[{}]/g, "").split("&")[0].split("=").pop() || "ai";
    }
    tasks.push({ target: src, keyword });
  }
  
  // Find Markdown images (even broken ones)
  while ((match = mdImgRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const alt = match[1] || "innovation";
    const url = match[2];
    
    // If it has a URL and it's already a real image, skip unless it's a known broken source
    if (url && !url.includes("source.unsplash.com") && url.startsWith("http")) continue;
    
    tasks.push({ target: fullTag, keyword: alt });
  }

  if (tasks.length === 0) return html;
  
  console.log(`[Service] Resolving ${tasks.length} content images with focus on relevance...`);
  
  for (const task of tasks.slice(0, 5)) {
    try {
      const sanitizedKey = task.keyword.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, ',');
      console.log(`[Service] Fetching relevant image for: "${sanitizedKey}"`);
      
      const { url } = await generateImageForBlog(sanitizedKey, "content-" + Math.random().toString(36).substring(7));
      
      // If it was a Markdown tag, convert to HTML <img>
      if (task.target.startsWith("![")) {
         updatedHtml = updatedHtml.replace(task.target, `<img src="${url}" alt="${task.keyword}" class="rounded-2xl shadow-xl my-8 w-full border border-border/50 max-h-[500px] object-cover">`);
      } else {
         updatedHtml = updatedHtml.replace(task.target, url);
      }
      
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`[Service] Failed to resolve image for "${task.keyword}":`, err);
    }
  }
  
  return updatedHtml;
}

/**
 * Generates a featured image using a tiered fallback strategy (Free Tiers Only):
 * 1. Unsplash (High-quality, free search)
 * 2. HuggingFace SDXL (AI generated via Stable Diffusion)
 * 3. Static Tech Placeholder (Reliable fallback)
 */
export async function generateImageForBlog(title: string, slug: string): Promise<{ url: string; provider: string }> {
  console.log(`[Service] Generating Featured Image for: "${title}"`);
  
  let sanitizedTitle = title.replace(/[^\w\s-]/gi, '').substring(0, 50).trim() || "technology";
  
  // Brand-Aware Auto-Correction & Relevance Mapper
  const corrections: Record<string, string> = {
    "linkdin": "linkedin",
    "instragram": "instagram",
    "facbook": "facebook",
    "social media": "business networking,people,social app"
  };
  
  Object.entries(corrections).forEach(([wrong, right]) => {
    if (sanitizedTitle.toLowerCase().includes(wrong)) {
      sanitizedTitle = sanitizedTitle.toLowerCase().replace(wrong, right);
    }
  });

  // High-Precision Relevance Injector
  const indiaHints = ["republic", "army", "independence", "diwali", "holi", "india", "bharat", "soldier"];
  if (indiaHints.some(hint => sanitizedTitle.toLowerCase().includes(hint)) && !sanitizedTitle.toLowerCase().includes("india")) {
    sanitizedTitle = `India ${sanitizedTitle}`;
  }

  const seed = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  const fallbackUrl = `https://loremflickr.com/1200/600/${encodeURIComponent(sanitizedTitle).replace(/%20/g, ',')}?lock=${seed}`;

  // 1. Unsplash Tier (High Quality)
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: { query: sanitizedTitle, per_page: 1, orientation: 'landscape' },
        headers: { Authorization: `Client-ID ${accessKey.trim()}` }
      });

      if (response.data.results?.[0]?.urls?.regular) {
        return { url: response.data.results[0].urls.regular, provider: 'unsplash' };
      }
    }
  } catch (err: any) {
    console.warn(`[Unsplash] Tier Failed: ${err.message}. Moving to Hugging Face...`);
  }

  // 2. Hugging Face Tier (Generated)
  try {
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (hfToken) {
      console.log(`[HuggingFace] Generating image for: "${sanitizedTitle}"`);
      const hfResponse = await axios.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        { inputs: `Professional high-quality cinematic photography for ${sanitizedTitle}, wide angle, 8k resolution` },
        {
          headers: { Authorization: `Bearer ${hfToken.trim()}` },
          responseType: "arraybuffer",
        }
      );

      const base64Image = Buffer.from(hfResponse.data, "binary").toString("base64");
      return { url: `data:image/png;base64,${base64Image}`, provider: 'huggingface' };
    }
  } catch (hfErr: any) {
    console.warn(`[HuggingFace] Tier Failed: ${hfErr.message}. Falling back to LoremFlickr...`);
  }

  // 3. LoremFlickr Tier (Relevant & Reliable)
  return { url: fallbackUrl, provider: 'loremflickr' };
}
