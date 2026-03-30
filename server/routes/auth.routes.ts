import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

// --- Auth Routes ---

router.get("/me", authController.getMe);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// --- WordPress OAuth Callback ---
router.get("/wordpress/callback", authController.wordpressCallback);

export default router;
