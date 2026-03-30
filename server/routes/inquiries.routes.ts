import { Router } from "express";
import * as inquiryController from "../controllers/inquiry.controller";

const router = Router();

// Public Contact API
router.post("/contact", inquiryController.submitInquiry);

// Public Plans List
router.get("/plans", inquiryController.getPublicPlans);

export default router;
