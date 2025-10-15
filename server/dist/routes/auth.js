"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const email_1 = require("../email");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
router.post("/signup", (req, res) => {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { name, email, password } = parse.data;
    const db = (0, setup_1.getDb)();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
        db.close();
        return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    const info = db
        .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')")
        .run(name, email, passwordHash);
    const userId = Number(info.lastInsertRowid);
    const token = (0, middleware_1.signJwt)({ userId, role: "user", email });
    db.close();
    return res.json({ token, user: { id: userId, name, email, role: "user" } });
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post("/login", (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { email, password } = parse.data;
    const db = (0, setup_1.getDb)();
    const user = db.prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ?").get(email);
    if (!user || !bcryptjs_1.default.compareSync(password, user.password_hash)) {
        db.close();
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = (0, middleware_1.signJwt)({ userId: user.id, role: user.role, email: user.email });
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
    const emailSchema = zod_1.z.object({ email: zod_1.z.string().email() });
    const parse = emailSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { email } = parse.data;
    const db = (0, setup_1.getDb)();
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (user) {
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 1000 * 60 * 30; // 30 minutes
        db.prepare("INSERT OR REPLACE INTO reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)")
            .run(token, user.id, expiresAt);
        const appUrl = process.env.APP_URL || "http://localhost:8080";
        const link = `${appUrl}/reset-password?token=${token}`;
        await (0, email_1.sendEmail)(email, "Reset your MAITRI password", `<p>Click the link to reset your password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`);
    }
    db.close();
    // Always respond success to avoid email enumeration
    return res.json({ success: true });
});
router.post("/reset-password", (req, res) => {
    const schema = zod_1.z.object({ token: zod_1.z.string().min(1), password: zod_1.z.string().min(8) });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { token, password } = parse.data;
    const db = (0, setup_1.getDb)();
    const row = db
        .prepare("SELECT user_id, expires_at FROM reset_tokens WHERE token = ?")
        .get(token);
    if (!row || row.expires_at < Date.now()) {
        db.close();
        return res.status(400).json({ error: "Invalid or expired token" });
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, row.user_id);
    db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token);
    db.close();
    return res.json({ success: true });
});
router.get("/me", middleware_1.requireAuth, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
