"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get("/me", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const db = (0, setup_1.getDb)();
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
    const profile = db
        .prepare("SELECT age, locality, personal_notes as personalNotes, goals FROM profiles WHERE user_id = ?")
        .get(userId) || { age: null, locality: null, personalNotes: "", goals: "" };
    db.close();
    res.json({ user, profile });
});
const updateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    age: zod_1.z.union([zod_1.z.number().int().min(0), zod_1.z.string().regex(/^\d+$/).transform(Number)]).optional(),
    locality: zod_1.z.string().optional(),
    personalNotes: zod_1.z.string().optional(),
    goals: zod_1.z.string().optional(),
    gad7_score: zod_1.z.number().optional(),
    phq9_score: zod_1.z.number().optional(),
    ghq12_score: zod_1.z.number().optional(),
});
router.put("/me", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const parse = updateSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { name, age, locality, personalNotes, goals, gad7_score, phq9_score, ghq12_score } = parse.data;
    const db = (0, setup_1.getDb)();
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
    const exists = db.prepare("SELECT user_id FROM profiles WHERE user_id = ?").get(userId);
    if (exists) {
        db.prepare("UPDATE profiles SET age = ?, locality = ?, personal_notes = ?, goals = ?, gad7_score = ?, phq9_score = ?, ghq12_score = ?, updated_at = datetime('now') WHERE user_id = ?").run(age ?? null, locality ?? null, personalNotes ?? "", goals ?? "", gad7_score ?? null, phq9_score ?? null, ghq12_score ?? null, userId);
    }
    else {
        db.prepare("INSERT INTO profiles (user_id, age, locality, personal_notes, goals, gad7_score, phq9_score, ghq12_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(userId, age ?? null, locality ?? null, personalNotes ?? "", goals ?? "", gad7_score ?? null, phq9_score ?? null, ghq12_score ?? null);
    }
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
    const profile = db
        .prepare("SELECT age, locality, personal_notes as personalNotes, goals, gad7_score, phq9_score, ghq12_score FROM profiles WHERE user_id = ?")
        .get(userId) || { age: null, locality: null, personalNotes: "", goals: "", gad7_score: null, phq9_score: null, ghq12_score: null };
    db.close();
    res.json({ user, profile });
});
exports.default = router;
