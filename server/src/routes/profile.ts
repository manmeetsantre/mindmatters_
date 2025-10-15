import { Router } from "express";
import { z } from "zod";
import { getDb } from "../setup";
import { requireAuth } from "../middleware";

const router = Router();

router.get("/me", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const db = getDb();
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
  const profile = db
    .prepare(
      "SELECT age, locality, personal_notes as personalNotes, goals, bp, heart_rate as heartRate, o2_level as o2Level, stress_level as stressLevel FROM profiles WHERE user_id = ?"
    )
    .get(userId) || { age: null, locality: null, personalNotes: "", goals: "", bp: "", heartRate: "", o2Level: "", stressLevel: "" };
  db.close();
  res.json({ user, profile });
});

const updateSchema = z.object({
  name: z.string().min(1),
  age: z.union([z.number().int().min(0), z.string().regex(/^\d+$/).transform(Number)]).optional(),
  locality: z.string().optional(),
  personalNotes: z.string().optional(),
  goals: z.string().optional(),
  bp: z.string().optional(),
  heartRate: z.string().optional(),
  o2Level: z.string().optional(),
  stressLevel: z.string().optional(),
  gad7_score: z.number().optional(),
  phq9_score: z.number().optional(),
  ghq12_score: z.number().optional(),
});

router.put("/me", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, age, locality, personalNotes, goals, bp, heartRate, o2Level, stressLevel, gad7_score, phq9_score, ghq12_score } = parse.data as any;

  const db = getDb();
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);

  const exists = db.prepare("SELECT user_id FROM profiles WHERE user_id = ?").get(userId);
  if (exists) {
    db.prepare(
      "UPDATE profiles SET age = ?, locality = ?, personal_notes = ?, goals = ?, bp = ?, heart_rate = ?, o2_level = ?, stress_level = ?, gad7_score = ?, phq9_score = ?, ghq12_score = ?, updated_at = datetime('now') WHERE user_id = ?"
    ).run(age ?? null, locality ?? null, personalNotes ?? "", goals ?? "", bp ?? "", heartRate ?? "", o2Level ?? "", stressLevel ?? "", gad7_score ?? null, phq9_score ?? null, ghq12_score ?? null, userId);
  } else {
    db.prepare(
      "INSERT INTO profiles (user_id, age, locality, personal_notes, goals, bp, heart_rate, o2_level, stress_level, gad7_score, phq9_score, ghq12_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, age ?? null, locality ?? null, personalNotes ?? "", goals ?? "", bp ?? "", heartRate ?? "", o2Level ?? "", stressLevel ?? "", gad7_score ?? null, phq9_score ?? null, ghq12_score ?? null);
  }
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
  const profile = db
    .prepare(
      "SELECT age, locality, personal_notes as personalNotes, goals, bp, heart_rate as heartRate, o2_level as o2Level, stress_level as stressLevel, gad7_score, phq9_score, ghq12_score FROM profiles WHERE user_id = ?"
    )
    .get(userId) || { age: null, locality: null, personalNotes: "", goals: "", bp: "", heartRate: "", o2Level: "", stressLevel: "", gad7_score: null, phq9_score: null, ghq12_score: null };
  db.close();
  res.json({ user, profile });
});

export default router;



