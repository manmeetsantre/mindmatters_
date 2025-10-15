import { Router } from "express";
import { z } from "zod";
import { getDb } from "../setup";
import { requireAuth } from "../middleware";

const router = Router();

router.get("/", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, date, mood, content, tags FROM journal_entries
       WHERE user_id = ? ORDER BY date DESC, id DESC`
    )
    .all(userId) as Array<{ id: number; date: string; mood: string; content: string; tags: string | null }>;
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

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

router.post("/", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { date, mood, content, tags } = parse.data;
  const db = getDb();
  const info = db
    .prepare(
      "INSERT INTO journal_entries (user_id, date, mood, content, tags) VALUES (?, ?, ?, ?, ?)"
    )
    .run(userId, date, mood, content, tags ? JSON.stringify(tags) : null);
  const id = String(Number(info.lastInsertRowid));
  db.close();
  res.json({ entry: { id, date, mood, content, tags } });
});

router.delete("/:id", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const id = Number(req.params.id);
  const db = getDb();
  db.prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?").run(id, userId);
  db.close();
  res.json({ success: true });
});

export default router;


