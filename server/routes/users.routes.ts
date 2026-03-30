import { Router } from "express";
import { checkSessionAuth } from "../middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

// Apply Auth check to all routes in this file
router.use(checkSessionAuth);

// --- User Profile & Settings ---
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

export default router;
