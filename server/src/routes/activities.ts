import { Router } from "express";
import { getDb } from "../setup";
import { requireAuth } from "../middleware";
import { activitiesSeed } from "../data/activitiesSeed";

const router = Router();

// Utility to seed if empty
const ensureSeeded = () => {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(1) as c FROM activities").get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare(`
      INSERT INTO activities (id, title, description, category, duration, difficulty, benefits, icon, color, recommended_for, video_url)
      VALUES (@id, @title, @description, @category, @duration, @difficulty, @benefits, @icon, @color, @recommended_for, @video_url)
    `);
    const insertMany = db.transaction((rows: typeof activitiesSeed) => {
      for (const r of rows) {
        insert.run({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          duration: r.duration,
          difficulty: r.difficulty,
          benefits: JSON.stringify(r.benefits),
          icon: r.icon || null,
          color: r.color || null,
          recommended_for: r.recommendedFor ? JSON.stringify(r.recommendedFor) : null,
          video_url: r.videoUrl || null
        });
      }
    });
    insertMany(activitiesSeed);
  } else {
    // Backfill video URLs for known activities if they were seeded before video_url existed
    db.prepare(
      `UPDATE activities SET video_url = ? WHERE id = 'breath-work' AND (video_url IS NULL OR video_url = '')`
    ).run('https://youtu.be/I77hh5I69gA?si=wrV-MNiglXpPP_Bw');
    db.prepare(
      `UPDATE activities SET video_url = ? WHERE id = 'body-scan' AND (video_url IS NULL OR video_url = '')`
    ).run('https://youtu.be/5mOZMxVKmiY?si=67NMCQ6llE_xBQ6U');
  }
  db.close();
};

router.get("/seed", (_req, res) => {
  ensureSeeded();
  res.json({ ok: true });
});

// List activities with optional filters
router.get("/", (_req, res) => {
  ensureSeeded();
  const db = getDb();
  const rows = db.prepare("SELECT * FROM activities").all() as any[];
  db.close();
  const mapped = rows.map((r) => ({
    ...r,
    benefits: JSON.parse(r.benefits || "[]"),
    recommendedFor: r.recommended_for ? JSON.parse(r.recommended_for) : undefined,
    videoUrl: r.video_url || undefined
  }));
  res.json(mapped);
});

// Get one activity
router.get("/:id", (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM activities WHERE id = ?").get(req.params.id) as any;
  db.close();
  if (!row) return res.status(404).json({ error: "Not found" });
  row.benefits = JSON.parse(row.benefits || "[]");
  row.recommendedFor = row.recommended_for ? JSON.parse(row.recommended_for) : undefined;
  res.json(row);
});

// Create/update activity (admin-style, but keeping it simple)
router.post("/", (req, res) => {
  const body = req.body || {};
  if (!body.id || !body.title) return res.status(400).json({ error: "id and title are required" });
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO activities (id, title, description, category, duration, difficulty, benefits, icon, color, recommended_for, video_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      description=excluded.description,
      category=excluded.category,
      duration=excluded.duration,
      difficulty=excluded.difficulty,
      benefits=excluded.benefits,
      icon=excluded.icon,
      color=excluded.color,
      recommended_for=excluded.recommended_for,
      video_url=excluded.video_url
  `);
  stmt.run(
    body.id,
    body.title,
    body.description || "",
    body.category || "mindfulness",
    body.duration || "10-15 min",
    body.difficulty || "Easy",
    JSON.stringify(body.benefits || []),
    body.icon || null,
    body.color || null,
    body.recommendedFor ? JSON.stringify(body.recommendedFor) : null,
    body.videoUrl || null
  );
  db.close();
  res.json({ ok: true, id: body.id });
});

// Delete activity
router.delete("/:id", (req, res) => {
  const db = getDb();
  const info = db.prepare("DELETE FROM activities WHERE id = ?").run(req.params.id);
  db.close();
  res.json({ ok: true, changes: info.changes });
});

// Mark completion
router.post("/:id/complete", requireAuth, (req: any, res) => {
  const userId = req.user!.userId;
  const notes = (req.body && req.body.notes) || null;
  const db = getDb();
  db.prepare(
    "INSERT INTO activity_completions (user_id, activity_id, notes) VALUES (?, ?, ?)"
  ).run(userId, req.params.id, notes);
  db.close();
  res.json({ ok: true });
});

// Unmark completion (toggle off)
router.delete("/:id/complete", requireAuth, (req: any, res) => {
  const userId = req.user!.userId;
  const db = getDb();
  const info = db
    .prepare(
      `DELETE FROM activity_completions WHERE user_id = ? AND activity_id = ?`
    )
    .run(userId, req.params.id);
  db.close();
  res.json({ ok: true, changes: info.changes });
});

// Get completions for current user
router.get("/me/completions", requireAuth, (req: any, res) => {
  const userId = req.user!.userId;
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ac.*, a.title, a.category, a.duration, a.difficulty
       FROM activity_completions ac
       JOIN activities a ON a.id = ac.activity_id
       WHERE ac.user_id = ?
       ORDER BY ac.completed_at DESC`
    )
    .all(userId) as any[];
  db.close();
  res.json(rows);
});

// Stats
router.get("/me/stats", requireAuth, (req: any, res) => {
  const userId = req.user!.userId;
  const db = getDb();
  const totals = db.prepare(
    `SELECT COUNT(*) as completed FROM activity_completions WHERE user_id = ?`
  ).get(userId) as any;
  const byCategory = db
    .prepare(
      `SELECT a.category, COUNT(*) as count
       FROM activity_completions ac JOIN activities a ON a.id = ac.activity_id
       WHERE ac.user_id = ?
       GROUP BY a.category`
    )
    .all(userId) as any[];
  db.close();
  res.json({ totalCompleted: totals.completed || 0, byCategory });
});

// Recommendations (simple heuristic similar to frontend)
router.get("/recommendations", (req, res) => {
  const { mood, time } = req.query as { mood?: string; time?: string };
  const db = getDb();
  const rows = db.prepare("SELECT * FROM activities").all() as any[];
  db.close();
  let recommended = rows.map((r) => ({
    ...r,
    benefits: JSON.parse(r.benefits || "[]"),
  }));

  if (mood) {
    const m = mood.toLowerCase();
    if (m === 'stressed') {
      recommended = recommended.filter((a) => a.category === 'mindfulness' || a.category === 'relaxation' || a.benefits.some((b: string) => b.toLowerCase().includes('stress')));
    } else if (m === 'anxious') {
      recommended = recommended.filter((a) => a.category === 'mindfulness' || a.benefits.some((b: string) => b.toLowerCase().includes('anxiety')));
    } else if (m === 'low-energy') {
      recommended = recommended.filter((a) => a.category === 'physical' || a.benefits.some((b: string) => b.toLowerCase().includes('energy')));
    } else if (m === 'creative') {
      recommended = recommended.filter((a) => a.category === 'creative');
    }
  }
  if (time) {
    const timeNum = parseInt(time, 10);
    if (!isNaN(timeNum)) {
      recommended = recommended.filter((activity) => {
        const parts = String(activity.duration).split('-');
        const upper = parts[1] ? parseInt(parts[1], 10) : parseInt(parts[0], 10);
        return !isNaN(upper) && upper <= timeNum;
      });
    }
  }

  res.json(recommended.slice(0, 6));
});

export default router;


