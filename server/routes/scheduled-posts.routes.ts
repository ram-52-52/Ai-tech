import { Router } from "express";
import { checkSessionAuth } from "../middleware";
import * as scheduledPostController from "../controllers/scheduled-post.controller";

const router = Router();

// Apply Auth check
router.use(checkSessionAuth);

// --- Scheduled Posts Routes ---
router.get("/", scheduledPostController.getScheduledPosts);
router.post("/", scheduledPostController.createScheduledPost);
router.delete("/:id", scheduledPostController.deleteScheduledPost);

export default router;
