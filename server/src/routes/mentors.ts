import express from "express";
import { getDb } from "../setup";

const router = express.Router();

router.get("/", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, specialization, year, rating, sessions, languages, available
       FROM peer_mentors
       ORDER BY created_at DESC`
    )
    .all();
  db.close();
  res.json(rows);
});

router.post("/", (req, res) => {
  const {
    name,
    email,
    phone,
    specialization,
    qualification,
    year,
    languages,
  } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO peer_mentors (name, email, phone, specialization, qualification, year, languages, available, rating, sessions)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0)`
  );
  const info = stmt.run(
    name,
    email,
    phone ?? null,
    specialization ?? null,
    qualification ?? null,
    year ?? null,
    languages ?? null
  );
  const created = db
    .prepare(
      `SELECT id, name, specialization, year, rating, sessions, languages, available
       FROM peer_mentors WHERE id = ?`
    )
    .get(info.lastInsertRowid as number);
  db.close();
  res.status(201).json(created);
});

export default router;


