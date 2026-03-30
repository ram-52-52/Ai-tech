import { GoogleGenerativeAI } from "@google/generative-ai";
import { InsertBlog } from "../../shared/schema";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

// Initialize Gemini client
const apiKey = (process.env.GEMINI_API_KEY || "").trim();

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main function to generate a full blog post using Google Gemini
 */
export async function generateBlogPost(topic: string): Promise<InsertBlog> {

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
      } catch (_e) {
        // Meta parse failed — use fallback values already set
      }
    }
  } catch {
    // Meta generation failed — use fallback title/slug
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


    // --- Section 1: Introduction (~250 words) ---
    const introPrompt = `Write ONLY the "Introduction" section for a blog post about "${pureSubject}". This section MUST be between 240 and 260 words. Output ONLY raw HTML using <p> and <strong>. Hook the reader, give deep background, and outline what will be covered. No <h1> or <h2> tags in this section. Do not summarize or cut short.`;

    // --- Section 2: Core Concepts & Fundamentals (~400 words, IMAGE 1) ---
    const corePrompt = `Write ONLY the "Core Concepts & Fundamentals" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Use <h2> and <h3> subheadings. Write detailed, long paragraphs. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_1' alt='${pureSubject} architecture and heritage' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 3: In-Depth Analysis & Real-World Examples (~400 words, IMAGE 2) ---
    const caseStudiesPrompt = `Write ONLY the "In-Depth Analysis & Real-World Examples" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Use <h2> and <h3>. Include specific statistics, case studies, and practical applications. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_2' alt='${pureSubject} industry and development' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 4: Advanced Strategies & Technical Details (~400 words, IMAGE 3) ---
    const advancedPrompt = `Write ONLY the "Advanced Strategies & Technical Details" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 400 and 450 words. Provide step-by-step expert insights, technical details, and actionable strategies. Use <h2>, <h3>, <ul>, <li>. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_3' alt='${pureSubject} cultural landscape' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

    // --- Section 5: Future Trends & Industry Impact (~350 words, IMAGE 4) ---
    const futurePrompt = `Write ONLY the "Future Trends & Industry Impact" section for a 2000-word blog post about "${pureSubject}". This section MUST be between 340 and 370 words. Forecast where this topic is heading in the next 5 years. Use <h2>, <h3>, <blockquote> for expert quotes. CRITICAL: In the exact middle of this section, insert this placeholder EXACTLY as written: <img src='INSERT_CONTEXT_IMAGE_4' alt='${pureSubject} modern skyline' class='inline-ai-image' style='width:100%; border-radius:10px; margin: 2rem 0;' />. Output ONLY raw HTML. Do not add any introduction or closing remarks.`;

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

  } catch (error: any) {
    // Gemini generation failed — attempting OpenAI fallback silently
    
    // ATTEMPT 2: OpenAI Fallback
    try {
      const openAIKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      if (openAIKey) {
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
    } catch {
      // OpenAI fallback also failed — using static template
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

      <img src="https://loremflickr.com/1200/600/${encodeURIComponent(pureSubject)},architecture?lock=1" alt="${pureSubject} Principles" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

      <h2>Looking Ahead: The Future of ${pureSubject}</h2>
      <p>The trajectory of ${pureSubject} is set for exponential growth as we enter the next phase of the digital era. Those who can master the art and science of this field today will be the architects of tomorrow's world.</p>
      
      <img src="https://loremflickr.com/1200/600/${encodeURIComponent(pureSubject)},future?lock=2" alt="${pureSubject} Future" class="rounded-2xl shadow-xl border border-border/50 my-8 w-full max-h-[400px] object-cover">

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
    
    // Priority 1: Extract keyword from 'alt' attribute and clean it
    const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
    let keyword = altMatch ? altMatch[1] : "";
    
    // Clean filler words to get to the core topic
    if (keyword) {
      keyword = keyword
        .replace(/^(a professional visual showing|professional photography of|real-world case study and data visualization of|detailed expert technical strategy and workflow for|futuristic visualization and upcoming trends for)\s+/gi, "")
        .replace(/\s+(of|related to|for|in action|in practice)$/gi, "")
        .trim();
        
      // Forbidden generic keywords list — if detected, override with blog topic
      const genericKeywords = ["strategic planning", "innovation", "business", "technology", "success", "growth", "strategy", "planning", "core principles", "fundamentals", "data strategy", "future tech"];
      if (genericKeywords.includes(keyword.toLowerCase())) {
        keyword = ""; // Force fallback to blog topic below
      }
    }
    
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
      keyword = blogTopic || "technology";
    }
    
    // Combine blog topic with keyword for better context (max 3 keywords)
    // We add the search index to the keyword eventually in the loop below
    const contextualKeyword = `${blogTopic} ${keyword}`.trim();
    
    // Check for placeholders or generic sources
    const genericSources = ["photo-placeholder", "images.unsplash.com/photo-", "loremflickr.com"];
    const isGenericSource = genericSources.some(s => src.includes(s));
    
    if (!tasks.find(t => t.target === fullTag) && (src.includes("INSERT_CONTEXT_IMAGE_") || isGenericSource)) {
        tasks.push({ target: fullTag, keyword: contextualKeyword });
    }
  }
  
  // Find Markdown images (even broken ones)
  while ((match = mdImgRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const alt = match[1] || "innovation";
    const url = match[2];
    
    // Check if the Markdown image itself is generic
    const genericTerms = ["strategy", "growth", "business", "innovation", "technology", "office", "placeholder", "unsplash"];
    const isGeneric = genericTerms.some(t => alt.toLowerCase().includes(t) || (url && url.toLowerCase().includes(t)));

    if (url && !isGeneric && !url.includes("source.unsplash.com") && url.startsWith("http")) continue;
    
    tasks.push({ target: fullTag, keyword: `${blogTopic} ${alt}`.trim() });
  }

  if (tasks.length === 0) return html;
  
  let photoIndex = 1;
  
  for (const task of tasks.slice(0, 5)) {
    try {
      const searchKeyword = task.keyword;
      
      // Pass the incrementing photoIndex to ensure variety from Unsplash
      const { url } = await generateImageForBlog(searchKeyword, "content-" + photoIndex + "-" + Math.random().toString(36).substring(7));
      photoIndex++;
      
      const escapedTarget = task.target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const targetRegex = new RegExp(escapedTarget, 'g');
      
      if (task.target.startsWith("![")) {
         // Markdown tag replacement
         updatedHtml = updatedHtml.replace(targetRegex, `<img src="${url}" alt="${task.keyword}" class="rounded-2xl shadow-xl my-8 w-full border border-border/50 max-h-[500px] object-cover">`);
      } else {
        // HTML <img> tag precision src replacement
        const srcMatch = task.target.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
            const oldUrl = srcMatch[1];
            // Globally replace the actual src URL within the content
            updatedHtml = updatedHtml.split(oldUrl).join(url);
        }
      }
      
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.warn(`[Service] Failed to resolve image for "${task.keyword}":`, err);
    }
  }
  
  return updatedHtml;
}

/**
 * Generates a highly detailed visual description for AI image generators (DALL-E, SDXL)
 */
async function generateVisualDescription(topic: string): Promise<string> {
  const imageSystemPrompt = `You are an expert prompt engineer for photorealistic AI image generation (Midjourney, DALL-E). Your task is to generate one highly detailed, descriptive, and unique prompt based strictly on the provided blog topic.
  
Strict Instructions:
- Do NOT produce generic images (e.g., do not just show a laptop, a generic office, or a person working unless it is the core topic).
- Focus on unique metaphors and key elements of the topic.
- For technology topics, focus on the impact or visual representation of the technology (e.g., for Blockchain in Agriculture, show a farmer using a rugged tablet showing decentralized data in a field, not just a server room).
- Include details about lighting (e.g., volumetric lighting, golden hour), style (photorealistic, cinematic), camera angle (close-up, wide-shot), and atmosphere.
- Output ONLY the refined image prompt. No explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${imageSystemPrompt}\n\nTopic: "${topic}"`);
    const prompt = result.response.text();
    return prompt?.trim() || `${topic}, photorealistic, cinematic, highly detailed`;
  } catch (err) {
    console.warn(`[AI] Visual Description Generation Failed:`, err);
    // Fallback to OpenAI if Gemini fails
    try {
      const openAIKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
      if (openAIKey) {
        const openai = new OpenAI({ apiKey: openAIKey.trim() });
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: imageSystemPrompt },
            { role: "user", content: `Topic: "${topic}"` }
          ],
          temperature: 0.7,
        });
        return response.choices[0]?.message?.content?.trim() || `${topic}, photorealistic, detailed`;
      }
    } catch {
        // Fail through to manual fallback
    }
    return `${topic}, photorealistic, cinematic, highly detailed`;
  }
}

/**
 * Generates a featured image using a tiered fallback strategy (Free Tiers Only)
 */
export async function generateImageForBlog(title: string, slug: string): Promise<{ url: string; provider: string }> {
  
  // 1. Generate a Professional High-Quality AI Image Prompt
  const detailedPrompt = await generateVisualDescription(title);
  
  const sanitizedTitle = title.replace(/[^\w\s-]/gi, '').substring(0, 50).trim() || "technology";
  const seed = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  
  const fallbackUrl = `https://loremflickr.com/1200/600/business,technology,${encodeURIComponent(sanitizedTitle).replace(/%20/g, ',')}?lock=${seed}`;
  const ultimateFallback = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200`;

  // 1. Unsplash Tier (Primary Driver - Pure Unsplash Strategy)
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      // Aggressive Variety Logic: Use a random page between 1 and 20 for search results
      const pageIndex = Math.floor(Math.random() * 20) + 1;

      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: { 
            query: detailedPrompt.substring(0, 80), 
            per_page: 1, 
            page: pageIndex, // Random page forces unique images
            orientation: 'landscape' 
        },
        headers: { Authorization: `Client-ID ${accessKey.trim()}` }
      });

      if (response.data.results?.[0]?.urls?.regular) {
        return { url: response.data.results[0].urls.regular, provider: 'unsplash' };
      }
    }
  } catch (err: any) {
    console.warn(`[Unsplash] Tier Failed: ${err.message}. Moving to fallbacks...`);
  }

  // 2. Hugging Face Tier (Using the full production-grade prompt)
  try {
    const hfToken = process.env.HUGGINGFACE_TOKEN || process.env.HF_API_KEY;
    if (hfToken) {
      const hfResponse = await axios.post(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        { inputs: detailedPrompt },
        {
          headers: { Authorization: `Bearer ${hfToken.trim()}` },
          responseType: "arraybuffer",
        }
      );

      const base64Image = Buffer.from(hfResponse.data, "binary");
      const fileName = `ai-img-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const dirPath = path.join(process.cwd(), "client", "public", "generated-images");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, base64Image);
      return { url: `/generated-images/${fileName}`, provider: 'huggingface' };
    }
  } catch (hfErr: any) {
    console.warn(`[HuggingFace] Tier Failed: ${hfErr.message}. Falling back to LoremFlickr...`);
  }

  // 3. LoremFlickr Tier (Relevant & Reliable)
  try {
    const res = await axios.get(fallbackUrl, { timeout: 5000 });
    if (res.status === 200) return { url: fallbackUrl, provider: 'loremflickr' };
  } catch {
    // Fail through to ultimate fallback
  }

  // 4. Hard Ultimate Fallback Tier
  return { url: ultimateFallback, provider: 'static-professional' };
}
