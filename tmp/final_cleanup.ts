import fs from 'node:fs';
import path from 'node:path';

const storagePath = path.resolve(process.cwd(), 'tmp-storage.json');

function cleanup() {
  if (!fs.existsSync(storagePath)) return;

  const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  const blogs = data.blogs;

  blogs.forEach(([id, blog]: [number, any]) => {
    let c = blog.content || "";
    
    // 1. Force Remove anything between H1 and H2 that looks like a banner
    // This is most robust because H1 and H2 are standard in our generation
    const parts = c.split(/<\/h1>|<h2>/gi);
    if (parts.length >= 3) {
      const middle = parts[1];
      if (middle.includes("Creative Preview Mode") || middle.includes("Mode</strong>") || middle.includes("primary text engine")) {
        // Replace middle with nothing or a clean short intro
        parts[1] = "\n      <p>This article explores the technical foundations and core principles of the subject matter, offering deep insights into modern best practices.</p>\n      ";
        c = parts[0] + "</h1>" + parts[1] + "<h2>" + parts.slice(2).join("<h2>");
      }
    }

    // 2. Final sanitization of Title
    if (blog.id === 29) {
      blog.title = "tree";
      blog.imageUrl = "https://loremflickr.com/1200/630/tree";
    }

    blog.content = c.trim();
  });

  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
  console.log("Final Fail-Safe Cleanup Complete.");
}

cleanup();
