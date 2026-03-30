import { Router } from "express";
import { checkSuperAdmin } from "../middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// Apply Super Admin check to all routes in this file
router.use(checkSuperAdmin);

// --- Admin Dashboard & Stats ---
router.get("/users", adminController.getUsers);
router.get("/global-stats", adminController.getGlobalStats);
router.get("/inquiries", adminController.getInquiries);

// --- Plan Management ---
router.get("/plans", adminController.getPlans);
router.put("/plans/:name", adminController.updatePlan);
router.post("/plans", adminController.createPlan);

// --- User Management & Impersonation ---
router.post("/users", adminController.provisionUser);
router.post("/users/:id/send-credentials", adminController.sendCredentials);
router.post("/impersonate/:id", adminController.impersonateUser);

// --- System Maintenance ---
router.post("/restore-db", adminController.restoreDb);
router.post("/process-scheduled", adminController.manualProcessScheduled);

export default router;
