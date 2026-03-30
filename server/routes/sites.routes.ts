import { Router } from "express";
import { checkSessionAuth } from "../middleware";
import * as siteController from "../controllers/site.controller";

const router = Router();

// Apply Auth check to all routes in this file
router.use(checkSessionAuth);

// --- External Sites Routes ---
router.get("/", siteController.getSites);
router.post("/", siteController.createSite);
router.put("/:id", siteController.updateSite);
router.delete("/:id", siteController.deleteSite);

// --- Test Connection ---
router.post("/:id/test", siteController.testConnection);

export default router;
