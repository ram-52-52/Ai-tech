import { Router } from "express";
import * as trendController from "../controllers/trend.controller";

const router = Router();

// --- Trends Routes ---
router.get("/", trendController.getTrends);
router.post("/refresh", trendController.refreshTrends);

export default router;
