import { Request, Response } from "express";
import { storage } from "../storage";
import { sendContactNotification } from "../services/email";

export const submitInquiry = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await sendContactNotification(name, email, message);
    await storage.createInquiry({ name, email, message });
    await storage.createLog({
      action: "CONTACT_INQUIRY",
      details: `New inquiry from ${name} (${email})`,
      clientId: "SYSTEM"
    });

    res.json({ message: "Inquiry sent successfully" });
  } catch (error: any) {
    console.error("Contact API error:", error);
    res.status(500).json({ message: "Failed to send inquiry" });
  }
};

export const getPublicPlans = async (_req: Request, res: Response) => {
  try {
    const plansList = await storage.getPlans();
    res.json(plansList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
