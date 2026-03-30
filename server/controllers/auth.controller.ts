import { Request, Response } from "express";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logPlatformAction } from "../utils/logging";

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const user = await storage.getUserById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ id: user.id, username: user.username, clientId: user.clientId, role: user.role });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing username or password" });
    
    const existing = await storage.getUserByUsername(username);
    if (existing) return res.status(400).json({ message: "User already exists" });
    
    const clientId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({ username, password: hashedPassword, clientId });
    
    (req.session as any).userId = user.id;
    (req.session as any).clientId = user.clientId;

    await logPlatformAction(user.id, user.username, "Registration", `New user registered: ${user.username}`);

    res.status(201).json({ 
      message: "Registered", 
      user: { id: user.id, username: user.username, clientId: user.clientId, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    (req.session as any).userId = user.id;
    (req.session as any).clientId = user.clientId;

    await logPlatformAction(user.id, user.username, "Login", `User logged in: ${user.username}`);

    res.json({ 
      message: "Logged in", 
      user: { id: user.id, username: user.username, clientId: user.clientId, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  req.session.destroy(async () => {
    if (userId) {
      const user = await storage.getUserById(userId);
      await logPlatformAction(userId, user?.username, "Logout", "User logged out");
    }
    res.json({ message: "Logged out" });
  });
};

export const wordpressCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).send("Authorization code is missing.");
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", "135690");
    params.append("redirect_uri", "http://localhost:5000/api/wordpress/callback");
    params.append("client_secret", process.env.WP_CLIENT_SECRET || "");
    params.append("code", code);
    params.append("grant_type", "authorization_code");

    const response = await fetch("https://public-api.wordpress.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error((data as any).error_description || "Failed to get access token");
    }

    const { access_token, blog_id } = data as { access_token: string; blog_id: string };
    if (!access_token || !blog_id) {
      throw new Error("Missing access_token or blog_id in response.");
    }

    const siteDetailsRes = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${blog_id}`);
    let siteName = `WordPress Blog ${blog_id}`;
    let siteUrl = `https://wordpress.com`;
    if (siteDetailsRes.ok) {
      const siteDetails = await siteDetailsRes.json() as any;
      siteName = siteDetails.name || siteName;
      siteUrl = siteDetails.URL || siteUrl;
    }

    await storage.createExternalSite({
      siteName,
      siteType: "wordpress",
      siteUrl,
      username: blog_id.toString(),
      password: access_token,
      isEnabled: true,
      clientId: (req.session as any).clientId, 
    });

    res.redirect("/settings?wp_connect=success");
  } catch (error: any) {
    res.redirect("/settings?wp_connect=error");
  }
};
