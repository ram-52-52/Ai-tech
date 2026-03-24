import fs from 'node:fs';
import path from 'node:path';

const storagePath = path.resolve(process.cwd(), 'tmp-storage.json');

function cleanup() {
  if (!fs.existsSync(storagePath)) return;

  const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  const blogs = data.blogs;

  blogs.forEach(([id, blog]: [number, any]) => {
    let c = blog.content || "";
    
    // 1. Remove the entire Creative Preview block, even with nested divs
    // Look for the start pattern and the specific end pattern
    c = c.replace(/<div style="background: #f8fafc;[\s\S]*?for you below![\s\S]*?<\/div>/gi, "");
    
    // 2. Clean up any leftover debris from failed previous cleaning (like trailing </div>)
    c = c.replace(/Your AI text is currently in.*?for you below!/gi, "");
    c = c.replace(/<\/div>\s*<h2>/gi, "<h2>");

    // 3. Strip any instructional text in the H1 or first P
    if (blog.title.includes("Act as a") || blog.title.includes("Generate")) {
       blog.title = "Modern Innovations and Trends"; // Generic safe title if it was instructional
    }
    
    // 4. Strip the 'Act as a...' preamble from content
    c = c.replace(/<p>This comprehensive guide explores the evolving landscape of <strong>.*?<\/strong>\. <\/p>/gi, "");

    blog.content = c.trim();

    // 5. Force tree image for blog 29
    if (blog.id === 29) {
       blog.title = "tree";
       blog.imageUrl = "https://loremflickr.com/1200/630/tree";
    }
  });

  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
  console.log("Ultimate cleanup completed.");
}

cleanup();
