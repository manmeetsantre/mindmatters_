"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setup_1 = require("../setup");
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    const db = (0, setup_1.getDb)();
    const rows = db
        .prepare(`SELECT id, name, specialization, year, rating, sessions, languages, available
       FROM peer_mentors
       ORDER BY created_at DESC`)
        .all();
    db.close();
    res.json(rows);
});
router.post("/", (req, res) => {
    const { name, email, phone, specialization, qualification, year, languages, } = req.body || {};
    if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
    }
    const db = (0, setup_1.getDb)();
    const stmt = db.prepare(`INSERT INTO peer_mentors (name, email, phone, specialization, qualification, year, languages, available, rating, sessions)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0)`);
    const info = stmt.run(name, email, phone ?? null, specialization ?? null, qualification ?? null, year ?? null, languages ?? null);
    const created = db
        .prepare(`SELECT id, name, specialization, year, rating, sessions, languages, available
       FROM peer_mentors WHERE id = ?`)
        .get(info.lastInsertRowid);
    db.close();
    res.status(201).json(created);
});
exports.default = router;
