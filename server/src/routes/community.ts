import express from "express";
import { getDb } from "../setup";

const router = express.Router();

router.get("/posts", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, topic, content, author, likes, replies, created_at
       FROM community_posts
       ORDER BY datetime(created_at) DESC`
    )
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
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO community_posts (topic, content, author, likes, replies)
     VALUES (?, ?, ?, 0, 0)`
  );
  const info = stmt.run(topic, content, author);
  const created = db
    .prepare(
      `SELECT id, topic, content, author, likes, replies, created_at
       FROM community_posts WHERE id = ?`
    )
    .get(info.lastInsertRowid as number);
  db.close();
  res.status(201).json(created);
});

export default router;


