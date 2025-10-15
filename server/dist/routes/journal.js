"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get("/", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const db = (0, setup_1.getDb)();
    const rows = db
        .prepare(`SELECT id, date, mood, content, tags FROM journal_entries
       WHERE user_id = ? ORDER BY date DESC, id DESC`)
        .all(userId);
    db.close();
    const entries = rows.map(r => ({
        id: String(r.id),
        date: r.date,
        mood: r.mood,
        content: r.content,
        tags: r.tags ? JSON.parse(r.tags) : undefined,
    }));
    res.json({ entries });
});
const createSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mood: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
router.post("/", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const parse = createSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { date, mood, content, tags } = parse.data;
    const db = (0, setup_1.getDb)();
    const info = db
        .prepare("INSERT INTO journal_entries (user_id, date, mood, content, tags) VALUES (?, ?, ?, ?, ?)")
        .run(userId, date, mood, content, tags ? JSON.stringify(tags) : null);
    const id = String(Number(info.lastInsertRowid));
    db.close();
    res.json({ entry: { id, date, mood, content, tags } });
});
router.delete("/:id", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const id = Number(req.params.id);
    const db = (0, setup_1.getDb)();
    db.prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?").run(id, userId);
    db.close();
    res.json({ success: true });
});
exports.default = router;
