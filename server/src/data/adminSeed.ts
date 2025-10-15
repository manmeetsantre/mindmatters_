import { getDb } from "../setup";
import bcrypt from "bcryptjs";

export function seedAdminData() {
  const db = getDb();

  // Insert sample users if not exist
  const adminPasswordHash = bcrypt.hashSync('admin12345', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role, created_at, password_hash)
    VALUES
      (1, 'Admin User', 'admin@mindmatters.local', 'admin', datetime('now'), ?)
  `).run(adminPasswordHash);

  // Insert sample profile for admin
  db.prepare(`
    INSERT OR IGNORE INTO profiles (user_id, age, locality, personal_notes, goals, updated_at)
    VALUES (1, 30, 'Admin City', 'Admin notes', 'Admin goals', datetime('now'))
  `).run();

  // Insert sample signins for recent days (to simulate real logins) - minimal for admin
  const daysBack = [0]; // only today
  daysBack.forEach((days, index) => {
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const userId = 1; // admin only
    const ip = `192.168.1.1`;
    const userAgent = `Mozilla/5.0 (admin login)`;
    db.prepare(`
      INSERT OR IGNORE INTO signins (user_id, ip, user_agent, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, ip, userAgent, date);
  });

  db.close();
  console.log('Sample admin data seeded successfully.');
}

