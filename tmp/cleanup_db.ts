import fs from 'node:fs';
import path from 'node:path';

const storagePath = path.resolve(process.cwd(), 'tmp-storage.json');

function cleanup() {
  if (!fs.existsSync(storagePath)) {
    console.error("Storage file not found");
    return;
  }

  const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  const blogs = data.blogs;

  let count = 0;
  blogs.forEach(([id, blog]: [number, any]) => {
    const originalContent = blog.content || "";
    
    // 1. Strip the entire banner DIV
    let cleanedContent = originalContent.replace(/<div style="background: #f8fafc;[\s\S]*?Creative Preview Mode[\s\S]*?<\/div>/gi, "");
    
    // 2. Strip "Your AI text is currently..." if it exists outside the div
    cleanedContent = cleanedContent.replace(/Your AI text is currently in.*?for you below!/gi, "");

    // 3. Strip instructional preamble in first P tag
    cleanedContent = cleanedContent.replace(/<p>This comprehensive guide explores the evolving landscape of <strong>.*?<\/strong>\..*?<\/p>/gi, (match: string) => {
        // Only keep the pure subject if possible
        const innerMatch = match.match(/<strong>(.*?)<\/strong>/);
        const subject = innerMatch ? innerMatch[1] : "";
        // Clean the subject
        const cleanSubject = subject.replace(/^(act as a|write a|create a|generate a|please write|i want a|provide a|as a|you are a|you are given).*?:\s+/gi, "").trim();
        return `<p>This article explores the core principles and future trends of <strong>${cleanSubject}</strong>.</p>`;
    });

    if (cleanedContent !== originalContent) {
      blog.content = cleanedContent.trim();
      count++;
    }
  });

  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
  console.log(`Successfully cleaned up ${count} blogs.`);
}

cleanup();
