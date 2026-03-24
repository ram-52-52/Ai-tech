
import { storage } from "./server/storage";

async function checkBlog() {
  const blogs = await storage.getBlogs();
  const armyBlog = blogs.find(b => b.title.toLowerCase().includes("indian army"));
  if (armyBlog) {
    console.log("--- ARMY BLOG CONTENT ---");
    console.log(armyBlog.content);
    console.log("--- END CONTENT ---");
  } else {
    console.log("Indian Army blog not found.");
  }
}

checkBlog().catch(console.error);
