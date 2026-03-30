import { Request, Response } from "express";
import { storage } from "../storage";
import { api } from "../../shared/routes";
import { z } from "zod";
import crypto from "crypto";

export const getSites = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  if (!clientId) return res.status(401).json({ message: "No client profile" });
  const sites = await storage.getExternalSites(clientId);
  res.json(sites);
};

export const createSite = async (req: Request, res: Response) => {
  try {
    const clientId = (req.session as any).clientId;
    if (!clientId) return res.status(401).json({ message: "No client profile" });
    
    const input = api.externalSites.create.input.parse({ ...req.body, clientId });
    const site = await storage.createExternalSite(input);
    
    res.status(201).json(site);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: "Failed to create site" });
  }
};

export const updateSite = async (req: Request, res: Response) => {
  try {
    const clientId = (req.session as any).clientId;
    const site = await storage.getExternalSite(Number(req.params.id));
    if (!site || site.clientId !== clientId) {
      return res.status(404).json({ message: "Site not found" });
    }

    const input = api.externalSites.update.input.parse(req.body);
    const updated = await storage.updateExternalSite(Number(req.params.id), input);
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteSite = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  const site = await storage.getExternalSite(Number(req.params.id));
  if (!site || site.clientId !== clientId) {
    return res.status(404).json({ message: "Site not found" });
  }
  await storage.deleteExternalSite(Number(req.params.id));
  res.status(204).send();
};

export const testConnection = async (req: Request, res: Response) => {
  const site = await storage.getExternalSite(Number(req.params.id));
  if (!site) return res.status(404).json({ message: "Site not found" });

  try {
    if (site.siteType === "medium") {
        const token = site.password?.trim();
        const r = await fetch("https://api.medium.com/v1/me", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!r.ok) {
          const err = await r.text();
          return res.status(400).json({ message: `Medium auth failed — ${err}` });
        }
        const data = await r.json() as { data: { name: string; username: string } };
        return res.json({ message: `Connected as @${data.data.username} (${data.data.name})` });

    } else if (site.siteType === "wordpress") {
        const isOAuth = site.siteUrl.includes("wordpress.com") || /^\d+$/.test(site.username);
        if (isOAuth) {
          const r = await fetch(`https://public-api.wordpress.com/rest/v1.1/me`, {
            headers: { Authorization: `Bearer ${site.password}` },
          });
          if (!r.ok) {
            const err = await r.text();
            return res.status(400).json({ message: `WordPress.com auth failed — ${err}` });
          }
          const data = await r.json() as { display_name: string };
          return res.json({ message: `Connected as ${data.display_name}` });
        } else {
          const base = site.siteUrl.replace(/\/$/, "");
          const credentials = Buffer.from(`${site.username}:${site.password}`).toString("base64");
          const r = await fetch(`${base}/wp-json/wp/v2/users/me`, {
            headers: { Authorization: `Basic ${credentials}` },
          });
          if (!r.ok) {
            const err = await r.text();
            return res.status(400).json({ message: `WordPress auth failed — ${err}` });
          }
          const data = await r.json() as { name: string };
          return res.json({ message: `Connected as ${data.name}` });
        }

    } else if (site.siteType === "ghost") {
        const base = site.siteUrl.replace(/\/$/, "");
        const adminApiKey = site.password;
        const [id, secret] = adminApiKey.split(":");
        if (!id || !secret) return res.status(400).json({ message: "Ghost key must be in id:secret format" });
        const now = Math.floor(Date.now() / 1000);
        const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })).toString("base64url");
        const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: "/admin/" })).toString("base64url");
        const signature = crypto.createHmac("sha256", Buffer.from(secret, "hex")).update(`${header}.${payload}`).digest("base64url");
        const token = `${header}.${payload}.${signature}`;
        const r = await fetch(`${base}/ghost/api/admin/site/`, {
          headers: { Authorization: `Ghost ${token}` },
        });
        if (!r.ok) {
          const err = await r.text();
          return res.status(400).json({ message: `Ghost auth failed — ${err}` });
        }
        const data = await r.json() as { site: { title: string } };
        return res.json({ message: `Connected to Ghost: "${data.site?.title}"` });

    } else if (site.siteType === "linkedin") {
        const token = site.password?.trim();
        if (!token) return res.status(400).json({ message: "No token provided" });

        const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json() as { name: string };
          return res.json({ message: `Connected as ${userInfo.name} (via OpenID)` });
        } else {
          const r = await fetch("https://api.linkedin.com/v2/me", {
            headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
          });

          if (r.ok) {
            const data = await r.json() as { localizedFirstName?: string; localizedLastName?: string };
            const name = [data.localizedFirstName, data.localizedLastName].filter(Boolean).join(" ") || "Unknown";
            return res.json({ message: `Connected as ${name} (Legacy)` });
          } else {
            const err = await r.text();
            return res.status(400).json({ message: `LinkedIn auth failed — ${err}` });
          }
        }

    } else {
        return res.status(400).json({ message: `Test not supported for ${site.siteType}` });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
