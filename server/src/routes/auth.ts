import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "../setup";
import { signJwt, requireAuth } from "../middleware";
import { sendEmail } from "../email";
import crypto from "crypto";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/signup", (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, email, password } = parse.data;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    db.close();
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')")
    .run(name, email, passwordHash);
  const userId = Number(info.lastInsertRowid);
  const token = signJwt({ userId, role: "user", email });
  db.close();
  return res.json({ token, user: { id: userId, name, email, role: "user" } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
  const db = getDb();
  const user = db.prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ?").get(email) as
    | { id: number; name: string; email: string; password_hash: string; role: string }
    | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    db.close();
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signJwt({ userId: user.id, role: user.role, email: user.email });
  const result = db.prepare("INSERT INTO signins (user_id, ip, user_agent) VALUES (?, ?, ?)")
    .run(user.id, req.ip, req.get("user-agent") || null);
  const newId = result.lastInsertRowid;
  const newEntry = db.prepare(`
    SELECT s.id, s.created_at as signed_in_at, s.ip, s.user_agent,
           u.id as user_id, u.name, u.email, u.role
    FROM signins s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(newId);
  const io = req.app.get('io');
  io.emit('entries-updated', { type: 'new', entry: newEntry });
  db.close();
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/logout", (_req, res) => {
  // Stateless JWTs: client discards token
  return res.json({ success: true });
});

router.post("/forgot-password", async (req, res) => {
  const emailSchema = z.object({ email: z.string().email() });
  const parse = emailSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email } = parse.data;
  const db = getDb();
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number } | undefined;
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
    db.prepare("INSERT OR REPLACE INTO reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)")
      .run(token, user.id, expiresAt);
    const appUrl = process.env.APP_URL || "http://localhost:8080";
    const link = `${appUrl}/reset-password?token=${token}`;
    await sendEmail(email, "Reset your MAITRI password", `<p>Click the link to reset your password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`);
  }
  db.close();
  // Always respond success to avoid email enumeration
  return res.json({ success: true });
});

router.post("/reset-password", (req, res) => {
  const schema = z.object({ token: z.string().min(1), password: z.string().min(8) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { token, password } = parse.data;
  const db = getDb();
  const row = db
    .prepare("SELECT user_id, expires_at FROM reset_tokens WHERE token = ?")
    .get(token) as { user_id: number; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) {
    db.close();
    return res.status(400).json({ error: "Invalid or expired token" });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, row.user_id);
  db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token);
  db.close();
  return res.json({ success: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;


