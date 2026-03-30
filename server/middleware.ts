import { storage } from "./storage";

export function checkSessionAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized: Please log in." });
  }
  next();
}

export async function checkSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    console.log("[Auth] checkSuperAdmin: No userId in session");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUserById(Number(req.session.userId));
  if (!user || user.role !== 'superadmin') {
    console.log(`[Auth] checkSuperAdmin: User ${user?.username} is not superadmin (Role: ${user?.role})`);
    return res.status(403).json({ message: "Forbidden: Super Admin access required." });
  }
  console.log(`[Auth] checkSuperAdmin: Success for ${user.username}`);
  next();
}
