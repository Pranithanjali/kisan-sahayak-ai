import { type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, users } from "@workspace/db";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.session_token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(users).where(eq(users.sessionToken, token));
  if (!user) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }
  req.user = user;
  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.session_token as string | undefined;
  if (token) {
    const [user] = await db.select().from(users).where(eq(users.sessionToken, token));
    if (user) req.user = user;
  }
  next();
}
