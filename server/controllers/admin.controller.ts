import { Request, Response } from "express";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logPlatformAction } from "../utils/logging";
import { UserModel, PlanModel } from "../models";
import { sendWelcomeEmail } from "../services/email";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await storage.getUsers();
  res.json(users);
};

export const getGlobalStats = async (_req: Request, res: Response) => {
  try {
    const stats = await storage.getGlobalStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await storage.getInquiries({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search ? String(search) : undefined
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await storage.getPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const name = req.params.name as string;
  try {
    const updated = await storage.updatePlan(name, req.body);
    if (userId) {
      await logPlatformAction(Number(userId), 'Super Admin', "Plan Updated", `Updated plan: ${name}`);
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const { name } = req.body;
  try {
    const plan = new PlanModel(req.body);
    await plan.save();
    if (userId) {
      await logPlatformAction(Number(userId), 'Super Admin', "Plan Created", `Created new plan: ${name || 'Unknown'}`);
    }
    res.status(201).json(plan.toObject());
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const provisionUser = async (req: Request, res: Response) => {
  try {
    const { username, password, plan } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(400).json({ message: "User already exists" });

    const clientId = crypto.randomUUID();
    const generatedPassword = password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    
    const user = await storage.createUser({ 
      username, 
      password: hashedPassword, 
      clientId, 
      role: 'user',
      plan: plan || 'Free Trial'
    } as any);

    await logPlatformAction(Number((req.session as any).userId), 'Super Admin', "User Provisioned", `Created new client: ${username}`);

    res.status(201).json({ 
      message: "User created", 
      user: { id: user.id, username: user.username, clientId: user.clientId },
      generatedPassword: password ? undefined : generatedPassword
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const sendCredentials = async (req: Request, res: Response) => {
  try {
    const { alternateEmail } = req.body;
    const id = req.params.id as string;
    const user = await storage.getUserById(Number(id));
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await UserModel.updateOne({ id: user.id }, { $set: { password: hashedPassword } });

    const emailTo = alternateEmail || (user.username && user.username.includes("@") ? user.username : null);
    if (!emailTo) return res.status(400).json({ message: "No valid email found" });

    await sendWelcomeEmail(emailTo, user.username, newPassword);

    res.json({ message: `Credentials sent to ${emailTo}` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const impersonateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await storage.getUserById(Number(id));
    if (!user) return res.status(404).json({ message: "User not found" });

    (req.session as any).userId = user.id;
    (req.session as any).clientId = user.clientId;
    res.json({ message: `Now impersonating ${user.username}` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const restoreDb = async (_req: Request, res: Response) => {
  try {
    const accounts = [
      { username: "aitech", plan: "Pro", clientId: "aitech-client-id" },
      { username: "ashwin", plan: "Growth", clientId: "ashwin-client-id" }
    ];

    for (const acc of accounts) {
      let user = await storage.getUserByUsername(acc.username);
      if (!user) {
        const hashedPassword = await bcrypt.hash("user123", 10);
        user = await storage.createUser({
          username: acc.username,
          password: hashedPassword,
          clientId: acc.clientId,
          role: "user",
          plan: acc.plan
        } as any);
      }
    }
    res.json({ message: "Restoration successful" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const manualProcessScheduled = async (_req: Request, res: Response) => {
  try {
    res.json({ message: "Manual trigger received" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
