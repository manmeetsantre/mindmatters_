import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../data.sqlite");

export function ensureCrewMonitoringDatabase() {
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Crew members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS crew_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      mission_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Monitoring sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS monitoring_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      session_id TEXT UNIQUE NOT NULL,
      monitoring_type TEXT DEFAULT 'continuous',
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
    )
  `);

  // Crew emotion analysis table
  db.exec(`
    CREATE TABLE IF NOT EXISTS crew_emotion_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      session_id TEXT,
      file_path TEXT,
      emotion_data TEXT NOT NULL,
      confidence_scores TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      location TEXT,
      analysis_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id),
      FOREIGN KEY (session_id) REFERENCES monitoring_sessions(session_id)
    )
  `);

  // Critical issues table
  db.exec(`
    CREATE TABLE IF NOT EXISTS critical_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      issue_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      location TEXT,
      auto_detected BOOLEAN DEFAULT FALSE,
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at DATETIME,
      resolved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
    )
  `);

  // AI companion conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_companion_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      emotional_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
    )
  `);

  // Ground control alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ground_control_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      acknowledged BOOLEAN DEFAULT FALSE,
      acknowledged_by TEXT,
      acknowledged_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
    )
  `);

  // Crew wellness metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS crew_wellness_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crew_member_id INTEGER NOT NULL,
      metric_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      timestamp DATETIME NOT NULL,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
    )
  `);

  // Mission phases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mission_phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase_name TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME,
      description TEXT,
      expected_challenges TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_crew_emotion_analysis_crew_member_id 
    ON crew_emotion_analysis(crew_member_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_crew_emotion_analysis_timestamp 
    ON crew_emotion_analysis(timestamp);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_critical_issues_crew_member_id 
    ON critical_issues(crew_member_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_critical_issues_severity 
    ON critical_issues(severity);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_critical_issues_timestamp 
    ON critical_issues(timestamp);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ai_companion_crew_member_id 
    ON ai_companion_conversations(crew_member_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_ai_companion_timestamp 
    ON ai_companion_conversations(timestamp);
  `);

  db.close();
}

export function seedCrewData() {
  const db = new Database(dbPath);
  
  // Insert sample crew members
  const crewMembers = [
    {
      name: "Commander Sarah Chen",
      role: "Mission Commander",
      mission_id: "BAS-1",
      status: "active"
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Flight Engineer",
      mission_id: "BAS-1",
      status: "active"
    },
    {
      name: "Lt. Maria Rodriguez",
      role: "Payload Specialist",
      mission_id: "BAS-1",
      status: "active"
    },
    {
      name: "Dr. Alexei Volkov",
      role: "Mission Specialist",
      mission_id: "BAS-1",
      status: "active"
    },
    {
      name: "Captain Li Wei",
      role: "Pilot",
      mission_id: "BAS-1",
      status: "active"
    },
    {
      name: "Dr. Priya Sharma",
      role: "Science Officer",
      mission_id: "BAS-1",
      status: "active"
    }
  ];

  crewMembers.forEach(member => {
    db.prepare(`
      INSERT OR IGNORE INTO crew_members (name, role, mission_id, status)
      VALUES (?, ?, ?, ?)
    `).run(member.name, member.role, member.mission_id, member.status);
  });

  // Insert sample mission phases
  const missionPhases = [
    {
      phase_name: "Launch and Docking",
      start_date: "2025-01-15T00:00:00Z",
      end_date: "2025-01-20T00:00:00Z",
      description: "Initial launch and space station docking procedures",
      expected_challenges: "High stress, adaptation to microgravity, crew coordination"
    },
    {
      phase_name: "Mission Operations",
      start_date: "2025-01-20T00:00:00Z",
      end_date: "2025-06-20T00:00:00Z",
      description: "Primary mission operations and experiments",
      expected_challenges: "Isolation, routine monotony, crew dynamics, communication delays"
    },
    {
      phase_name: "Return Preparation",
      start_date: "2025-06-20T00:00:00Z",
      end_date: "2025-07-15T00:00:00Z",
      description: "Preparation for return to Earth",
      expected_challenges: "Anxiety about return, physical readaptation concerns, mission completion stress"
    }
  ];

  missionPhases.forEach(phase => {
    db.prepare(`
      INSERT OR IGNORE INTO mission_phases (phase_name, start_date, end_date, description, expected_challenges)
      VALUES (?, ?, ?, ?, ?)
    `).run(phase.phase_name, phase.start_date, phase.end_date, phase.description, phase.expected_challenges);
  });

  db.close();
}
