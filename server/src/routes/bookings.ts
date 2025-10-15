import express from "express";
import { getDb } from "../setup";

const router = express.Router();

router.get("/counselors", (_req, res) => {
  const db = getDb();
  const counselors = db.prepare("SELECT * FROM counselors").all();
  db.close();
  res.json(counselors);
});

router.get("/availability", (req, res) => {
  const { counselor_id, date } = req.query as { counselor_id?: string; date?: string };
  if (!counselor_id || !date) return res.status(400).json({ error: "counselor_id and date are required" });
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT time_slot, is_booked FROM counselor_availability WHERE counselor_id = ? AND date = ? ORDER BY time_slot`
    )
    .all(counselor_id, date);
  db.close();
  res.json(rows);
});

router.post("/availability", (req, res) => {
  // Admin/seed endpoint to upsert availability slots for a counselor and date
  const { counselor_id, date, time_slots } = req.body || {};
  if (!counselor_id || !date || !Array.isArray(time_slots)) {
    return res.status(400).json({ error: "counselor_id, date, and time_slots[] are required" });
  }
  const db = getDb();
  const upsert = db.prepare(
    `INSERT INTO counselor_availability (counselor_id, date, time_slot, is_booked) VALUES (?, ?, ?, 0)
     ON CONFLICT(counselor_id, date, time_slot) DO NOTHING`
  );
  const tx = db.transaction((slots: string[]) => {
    slots.forEach((s) => upsert.run(counselor_id, date, s));
  });
  tx(time_slots);
  db.close();
  res.json({ ok: true });
});

router.post("/book", (req, res) => {
  const { counselor_id, date, time_slot, name, email, phone, issue, urgency, notes } = req.body || {};
  if (!counselor_id || !date || !time_slot || !name || !email) {
    return res.status(400).json({ error: "missing required fields" });
  }
  const db = getDb();
  // Ensure slot exists and not booked
  const slot = db
    .prepare(
      `SELECT id, is_booked FROM counselor_availability WHERE counselor_id = ? AND date = ? AND time_slot = ?`
    )
    .get(counselor_id, date, time_slot) as any;
  if (!slot) {
    db.close();
    return res.status(409).json({ error: "slot not available" });
  }
  if (slot.is_booked) {
    db.close();
    return res.status(409).json({ error: "slot already booked" });
  }

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO bookings (counselor_id, date, time_slot, name, email, phone, issue, urgency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(counselor_id, date, time_slot, name, email, phone ?? null, issue ?? null, urgency ?? null, notes ?? null);
    db.prepare(`UPDATE counselor_availability SET is_booked = 1 WHERE id = ?`).run(slot.id);
  });

  try {
    tx();
  } catch (e) {
    db.close();
    return res.status(500).json({ error: "failed to book" });
  }

  const created = db
    .prepare(
      `SELECT b.*, c.name as counselor_name, c.specialization FROM bookings b JOIN counselors c ON b.counselor_id = c.id
       WHERE b.counselor_id = ? AND b.date = ? AND b.time_slot = ? AND b.email = ?
       ORDER BY b.id DESC LIMIT 1`
    )
    .get(counselor_id, date, time_slot, email);
  db.close();
  res.status(201).json(created);
});

router.get("/list", (req, res) => {
  const { email } = req.query as { email?: string };
  if (!email) return res.status(400).json({ error: "email is required" });
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, c.name as counselor_name, c.specialization
       FROM bookings b JOIN counselors c ON b.counselor_id = c.id
       WHERE b.email = ? ORDER BY datetime(b.date || ' ' || b.time_slot) DESC`
    )
    .all(email);
  db.close();
  res.json(rows);
});

export default router;


