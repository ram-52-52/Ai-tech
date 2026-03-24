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

  // 2. Step 2: Segmented Section Generation (7 × Gemini calls)
  let content = "";
  try {
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Helper: call Gemini and return clean HTML text
    const genSection = async (prompt: string): Promise<string> => {
      const result = await textModel.generateContent(prompt);
      let raw = "";
      try { raw = result.response.text() || ""; } catch (_) { raw = ""; }
      raw = raw.trim();
      if (raw.startsWith("```")) raw = raw.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();
      return raw;
    };

    console.log(`[Gemini] Starting segmented generation for: "${pureSubject}"`);

    // --- Section 1: Introduction (~250 words) ---
    const introPrompt = `Write ONLY the "Introduction" section for a blog post about "${pureSubject}". This section MUST be between 240 and 260 words. Output ONLY raw HTML using <p> and <strong>. Hook the reader, give deep background, and outline what will be covered. No <h1> or <h2> tags in this section. Do not summarize or cut short.`;

    // --- Section 2: Core Concepts & Fundamentals (~400 words, IMAGE 1) ---
    const corePrompt = `Write ONLY the "Core Concepts & Fundamentals" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Use <h2> and <h3> subheadings. Write detailed, long paragraphs. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_1' alt='A professional visual showing the core fundamentals and key principles of ${pureSubject}' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 3: In-Depth Analysis & Real-World Examples (~400 words, IMAGE 2) ---
    const caseStudiesPrompt = `Write ONLY the "In-Depth Analysis & Real-World Examples" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Use <h2> and <h3>. Include specific statistics, case studies, and practical applications. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_2' alt='A real-world case study or data visualization related to ${pureSubject} in practice' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 4: Advanced Strategies & Technical Details (~400 words, IMAGE 3) ---
    const advancedPrompt = `Write ONLY the "Advanced Strategies & Technical Details" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Provide step-by-step expert insights, technical details, and actionable strategies. Use <h2>, <h3>, <ul>, <li>. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_3' alt='An expert demonstrating advanced technical strategy for ${pureSubject}' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 5: Future Trends & Industry Impact (~350 words, IMAGE 4) ---
    const futurePrompt = `Write ONLY the "Future Trends & Industry Impact" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 340 and 370 words. Forecast where this topic is heading in the next 5 years. Use <h2>, <h3>, <blockquote> for expert quotes. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_4' alt='A futuristic visualization of upcoming trends and the industry impact of ${pureSubject}' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 6: Comprehensive FAQs (~200 words) ---
    const faqsPrompt = `Write ONLY the "Frequently Asked Questions" section for a blog post about "${pureSubject}". Ask and answer exactly 4 complex, thoughtful questions about this topic. This section MUST be between 190 and 220 words. Use <h2> for the section heading, <h3> for each question, and <p> for the answers. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 7: Conclusion (~100 words) ---
    const conclusionPrompt = `Write ONLY the "Conclusion" section for a blog post about "${pureSubject}". This section MUST be exactly 90-110 words. Use <h2> for the heading and <p> for the body. Summarize key insights and end with a compelling, forward-looking call to action. Output ONLY raw HTML.`;

    // Run all 7 sections sequentially (to avoid rate limits)
    const [intro, core, caseStudies, advanced, future, faqs, conclusion] = await Promise.all([
      genSection(introPrompt),
      genSection(corePrompt),
      genSection(caseStudiesPrompt),
      genSection(advancedPrompt),
      genSection(futurePrompt),
      genSection(faqsPrompt),
      genSection(conclusionPrompt),
    ]);

    const sections = [intro, core, caseStudies, advanced, future, faqs, conclusion];
    const assembled = sections.filter(s => s && s.length > 50).join("\n\n");

    if (!assembled || assembled.length < 500) {
      throw new Error("Segmented generation produced insufficient content.");
    }

    content = sanitizeFinalContent(assembled);
    console.log(`[Gemini] Segmented generation complete. Total length: ${content.length} chars.`);

  } catch (error: any) {
    console.warn(`[Gemini] Segmented generation failed: ${error.message}. Attempting OpenAI Fallback...`);
    
    // ATTEMPT 2: OpenAI Fallback
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
              content: "You are an elite SEO expert. Generate an EXTRAORDINARILY LONG (2000+ words) professional blog post in HTML format. NO Markdown. Use <h1>, <h2>, <h3>. Insert 4 image placeholders: <img src='INSERT_CONTEXT_IMAGE_1' alt='...' />, <img src='INSERT_CONTEXT_IMAGE_2' alt='...' />, etc." 
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
            content: await resolveContentImages(content, topic),
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

    // Static template as last resort
    content = `
      <h1>${metaData.title}</h1>
      <p>In today's rapidly evolving digital landscape, <strong>${pureSubject}</strong> has emerged as a transformative force, reshaping how organizations and individuals approach their strategic goals. This comprehensive analysis dives deep into the core mechanics, current trends, and future projections that are defining the industry in 2025.</p>
      
      <img src="https://images.unsplash.com/photo-placeholder?topic=tech-strategy" alt="${pureSubject} trends" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h2>The Strategic Impact of ${pureSubject}</h2>
      <p>Understanding the multi-faceted nature of ${pureSubject} is essential for professionals looking to stay ahead of the curve. Unlike traditional methodologies, the current framework prioritizes agility, data-driven decision making, and seamless user experiences.</p>

      <h2>Core Pillars and Architectural Principles</h2>
      <p>Every successful implementation of ${pureSubject} rests upon several foundational pillars. These range from robust data pipelines to intuitive interface designs that bridge the gap between technical complexity and practical utility.</p>

      <img src="https://images.unsplash.com/photo-placeholder?topic=data-strategy" alt="Strategic Planning" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h2>Looking Ahead: The Future of ${pureSubject}</h2>
      <p>The trajectory of ${pureSubject} is set for exponential growth as we enter the next phase of the digital era. Those who can master the art and science of this field today will be the architects of tomorrow's world.</p>
      
      <img src="https://images.unsplash.com/photo-placeholder?topic=future-tech" alt="Future Outlook" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h3>Conclusion</h3>
      <p>In conclusion, ${pureSubject} is much more than a buzzword; it is a fundamental requirement for success in the modern age.</p>
    `;
  }



  // 4. Step 4: AI Featured Image (Tiered Strategy - Free Tiers Only)
  const imageResult = await generateImageForBlog(metaData.title, slug);
  
  return {
    title: metaData.title,
    content: await resolveContentImages(content, topic),
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
async function resolveContentImages(html: string, blogTopic: string): Promise<string> {
  if (!html) return html;
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
    
    // Priority 1: Extract keyword from 'alt' attribute
    const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
    let keyword = altMatch ? altMatch[1] : "";
    
    // Priority 2: Extract from query params for non-placeholder URLs
    if (!keyword || keyword.length < 3) {
      if (!src.includes("INSERT_CONTEXT_IMAGE_") && src.includes("?")) {
        try {
          const urlParams = new URL(src).searchParams;
          keyword = urlParams.get("topic") || urlParams.get("q") || "";
        } catch (e) {
          const p = src.split("?")[1] || "";
          keyword = p.split("&").find(x => x.startsWith("topic=") || x.startsWith("q="))?.split("=")[1] || "";
        }
      }
    }
    
    // Final fallback — use the blog topic itself so it's never generic
    if (!keyword || keyword.length < 3) {
      keyword = blogTopic || "innovation";
    }
    
    // Combine blog topic with keyword for better context
    const contextualKeyword = blogTopic ? `${blogTopic} ${keyword}` : keyword;
    
    // De-duplicate tasks by target URL
    if (!tasks.find(t => t.target === src)) {
        tasks.push({ target: src, keyword: contextualKeyword });
    }
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
      
      // Use global replacement to catch all occurrences of the same placeholder URL
      const escapedTarget = task.target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const targetRegex = new RegExp(escapedTarget, 'g');
      
      // If it was a Markdown tag, convert to HTML <img>
      if (task.target.startsWith("![")) {
         updatedHtml = updatedHtml.replace(targetRegex, `<img src="${url}" alt="${task.keyword}" class="rounded-2xl shadow-xl my-8 w-full border border-border/50 max-h-[500px] object-cover">`);
      } else {
         updatedHtml = updatedHtml.replace(targetRegex, url);
      }
      
      console.log(`[Service] Successfully replaced all instances of "${task.target}" with "${url}"`);
      await new Promise(r => setTimeout(r, 300));
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
  
  // High-Specificity Query Expansion
  if (sanitizedTitle.length < 15) {
    sanitizedTitle = `${sanitizedTitle} professional business technology`;
  }
  
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
    const hfToken = process.env.HUGGINGFACE_TOKEN || process.env.HF_API_KEY;
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
