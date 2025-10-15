"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setup_1 = require("../setup");
const router = express_1.default.Router();
router.get("/posts", (_req, res) => {
    const db = (0, setup_1.getDb)();
    const rows = db
        .prepare(`SELECT id, topic, content, author, likes, replies, created_at
       FROM community_posts
       ORDER BY datetime(created_at) DESC`)
        .all();
    db.close();
    res.json(rows);
});
router.post("/posts", (req, res) => {
    const { topic, content } = req.body || {};
    if (!topic || !content) {
        return res.status(400).json({ error: "topic and content are required" });
    }
    const author = "Anonymous"; // community posts are anonymous
    const db = (0, setup_1.getDb)();
    const stmt = db.prepare(`INSERT INTO community_posts (topic, content, author, likes, replies)
     VALUES (?, ?, ?, 0, 0)`);
    const info = stmt.run(topic, content, author);
    const created = db
        .prepare(`SELECT id, topic, content, author, likes, replies, created_at
       FROM community_posts WHERE id = ?`)
        .get(info.lastInsertRowid);
    db.close();
    res.status(201).json(created);
});
exports.default = router;
