import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db, users } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserLanguageBody,
  RegisterUserResponse,
  LoginUserResponse,
  LogoutUserResponse,
  GetCurrentUserResponse,
  UpdateUserLanguageResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const scryptAsync = promisify(scrypt);
const router: IRouter = Router();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hash, salt] = stored.split(".");
  const hashBuf = Buffer.from(hash, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, suppliedBuf);
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, language } = parsed.data;
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const sessionToken = generateToken();
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, language: language ?? "en", sessionToken })
    .returning();
  res.cookie("session_token", sessionToken, { httpOnly: true, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.status(201).json(RegisterUserResponse.parse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      createdAt: user.createdAt.toISOString(),
    },
    message: "Registration successful",
  }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const sessionToken = generateToken();
  await db.update(users).set({ sessionToken }).where(eq(users.id, user.id));
  res.cookie("session_token", sessionToken, { httpOnly: true, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json(LoginUserResponse.parse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      createdAt: user.createdAt.toISOString(),
    },
    message: "Login successful",
  }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.session_token as string | undefined;
  if (token) {
    await db.update(users).set({ sessionToken: null }).where(eq(users.sessionToken, token));
  }
  res.clearCookie("session_token");
  res.json(LogoutUserResponse.parse({ success: true, message: "Logged out" }));
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  res.json(GetCurrentUserResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    language: user.language,
    createdAt: user.createdAt.toISOString(),
  }));
});

router.patch("/auth/me/language", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateUserLanguageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = req.user!;
  const [updated] = await db
    .update(users)
    .set({ language: parsed.data.language })
    .where(eq(users.id, user.id))
    .returning();
  res.json(UpdateUserLanguageResponse.parse({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    language: updated.language,
    createdAt: updated.createdAt.toISOString(),
  }));
});

export default router;
