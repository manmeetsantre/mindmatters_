import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import { seedAdminData } from "./data/adminSeed";
import { ensureCrewMonitoringDatabase, seedCrewData } from "./setup-crew-monitoring";

export const getDb = () => {
  const dbPath = path.join(__dirname, "..", "..", "data.sqlite");
  const db = new Database(dbPath);
  return db;
};

export const ensureDatabase = () => {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      age INTEGER,
      locality TEXT,
      personal_notes TEXT,
      goals TEXT,
      bp TEXT,
      heart_rate TEXT,
      o2_level TEXT,
      stress_level TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS signins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS reset_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      mood TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      benefits TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      recommended_for TEXT,
      video_url TEXT
    );
    CREATE TABLE IF NOT EXISTS activity_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_id TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(activity_id) REFERENCES activities(id)
    );
    CREATE TABLE IF NOT EXISTS peer_mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      specialization TEXT,
      qualification TEXT,
      year TEXT,
      languages TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      rating REAL DEFAULT 0,
      sessions INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      replies INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS counselors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT,
      experience TEXT,
      languages TEXT,
      rating REAL
    );
    CREATE TABLE IF NOT EXISTS counselor_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      counselor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      is_booked INTEGER NOT NULL DEFAULT 0,
      UNIQUE(counselor_id, date, time_slot),
      FOREIGN KEY(counselor_id) REFERENCES counselors(id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      counselor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      issue TEXT,
      urgency TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(counselor_id) REFERENCES counselors(id)
    );
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      assessment_type TEXT NOT NULL,
      answers TEXT NOT NULL,
      results TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Seed counselors if empty
  const count = db.prepare("SELECT COUNT(*) as c FROM counselors").get() as any;
  if (!count || count.c === 0) {
    const counselors = [
      { id: "dr-sharma", name: "Dr. Priya Sharma", specialization: "Anxiety & Depression", experience: "8 years", languages: "Hindi, English, Punjabi", rating: 4.9 },
      { id: "dr-kumar", name: "Dr. Raj Kumar", specialization: "Academic Stress & Career Counseling", experience: "6 years", languages: "Hindi, English, Urdu", rating: 4.8 },
      { id: "dr-singh", name: "Dr. Aman Singh", specialization: "Relationship & Social Issues", experience: "5 years", languages: "Hindi, English", rating: 4.7 },
    ];
    const ins = db.prepare("INSERT INTO counselors (id, name, specialization, experience, languages, rating) VALUES (@id, @name, @specialization, @experience, @languages, @rating)");
    const insertMany = db.transaction((rows: any[]) => { rows.forEach((r) => ins.run(r)); });
    insertMany(counselors);
  }

  // Migration: add video_url to activities if missing
  try {
    const cols = db.prepare("PRAGMA table_info(activities)").all() as any[];
    const hasVideoUrl = cols.some((c) => c.name === "video_url");
    if (!hasVideoUrl) {
      db.exec(`ALTER TABLE activities ADD COLUMN video_url TEXT;`);
    }
  } catch {}

  // Migration: add assessment fields to profiles if missing
  try {
    const profileCols = db.prepare("PRAGMA table_info(profiles)").all() as any[];
    const hasGad7 = profileCols.some((c) => c.name === "gad7_score");
    const hasPhq9 = profileCols.some((c) => c.name === "phq9_score");
    const hasGhq12 = profileCols.some((c) => c.name === "ghq12_score");
    if (!hasGad7) {
      db.exec(`ALTER TABLE profiles ADD COLUMN gad7_score REAL;`);
    }
    if (!hasPhq9) {
      db.exec(`ALTER TABLE profiles ADD COLUMN phq9_score REAL;`);
    }
    if (!hasGhq12) {
      db.exec(`ALTER TABLE profiles ADD COLUMN ghq12_score REAL;`);
    }
  } catch (error) {
    console.warn('Migration warning:', error);
  }

  // Seed a default admin user if none exists
  const name = "Admin";
  const email = "admin@mindmatters.local";
  const passwordHash = bcrypt.hashSync("admin12345", 10);
  db.prepare(
    "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')"
  ).run(name, email, passwordHash);
  db.close();

  // Initialize crew monitoring database
  ensureCrewMonitoringDatabase();
  seedCrewData();

  // Seed additional admin data is now called in index.ts
};


