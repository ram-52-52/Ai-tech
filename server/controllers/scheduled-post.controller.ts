import { Request, Response } from "express";
import { storage } from "../storage";
import { api } from "../../shared/routes";
import { z } from "zod";

export const getScheduledPosts = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  if (!clientId) return res.status(401).json({ message: "No client profile" });
  const postsList = await storage.getScheduledPosts(clientId);
  res.json(postsList);
};

export const createScheduledPost = async (req: Request, res: Response) => {
  try {
    const clientId = (req.session as any).clientId;
    if (!clientId) return res.status(401).json({ message: "No client profile" });

    const body = {
      ...req.body,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      clientId,
    };
    const input = api.scheduledPosts.create.input.parse(body);
    const post = await storage.createScheduledPost(input);
    
    // Sync the scheduled time to the Blog so the global Double-Gate visibility lock works
    await storage.updateBlog(input.blogId, { scheduledAt: new Date(input.scheduledAt) });

    res.status(201).json(post);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
};

export const deleteScheduledPost = async (req: Request, res: Response) => {
  const clientId = (req.session as any).clientId;
  const post = await storage.getScheduledPost(Number(req.params.id));
  if (!post || post.clientId !== clientId) {
    return res.status(404).json({ message: "Post not found" });
  }
  await storage.deleteScheduledPost(Number(req.params.id));
  res.status(204).send();
};
