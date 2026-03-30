import { Router } from "express";
import { checkSessionAuth } from "../middleware";
import * as blogController from "../controllers/blog.controller";

const router = Router();

// --- Blog Routes ---

// Public Syndication Feed (Domain-Locked)
router.get("/v1/feed/:id", blogController.getFeed);

// Private Blog Management
router.get("/", checkSessionAuth, blogController.listBlogs);
router.get("/:id", checkSessionAuth, blogController.getBlog);
router.get("/slug/:slug", checkSessionAuth, blogController.getBlogBySlug);
router.post("/", checkSessionAuth, blogController.createBlog);
router.put("/:id", checkSessionAuth, blogController.updateBlog);
router.delete("/:id", checkSessionAuth, blogController.deleteBlog);

// AI Generation Routes
router.post("/generate", checkSessionAuth, blogController.generateBlog);
router.post("/:id/regenerate-full", checkSessionAuth, blogController.regenerateFull);
router.post("/:id/regenerate-image", checkSessionAuth, blogController.regenerateImage);

// Previews
router.get("/preview/:id", checkSessionAuth, blogController.previewBlog);

export default router;
