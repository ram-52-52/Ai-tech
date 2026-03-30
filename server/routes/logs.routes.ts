import { Router } from "express";
import { checkSuperAdmin } from "../middleware";
import * as logController from "../controllers/log.controller";

const router = Router();

// Platform activity logs (Super Admin only)
router.get("/platform-events", checkSuperAdmin, logController.getPlatformEvents);

export default router;
