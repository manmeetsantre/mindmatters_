"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get("/entries", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { page = 1, limit = 20, search = '', role = 'all' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT s.id, s.created_at as signed_in_at, s.ip, s.user_agent,
             u.id as user_id, u.name, u.email, u.role
      FROM signins s
      JOIN users u ON u.id = s.user_id
      WHERE 1=1
    `;
    let params = [];
    if (search) {
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR (s.ip LIKE ?))`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role !== 'all') {
        query += ` AND u.role = ?`;
        params.push(role);
    }
    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);
    const rows = db.prepare(query).all(...params);
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM signins s JOIN users u ON u.id = s.user_id WHERE 1=1`;
    let countParams = [];
    if (search) {
        countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR (s.ip LIKE ?))`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role !== 'all') {
        countQuery += ` AND u.role = ?`;
        countParams.push(role);
    }
    const countResult = db.prepare(countQuery).get(...countParams) || { total: 0 };
    const total = countResult.total || 0;
    db.close();
    const io = req.app.get('io');
    io.emit('entries-updated', { count: total });
    res.json({
        entries: rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
    });
});
router.get("/profiles", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { page = 1, limit = 20, search = '', role = 'all' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT u.id as user_id, u.name, u.email, u.role,
             p.age, p.locality, p.personal_notes as personalNotes, p.goals, p.updated_at
      FROM users u
      INNER JOIN profiles p ON p.user_id = u.id
      WHERE 1=1
    `;
    let params = [];
    if (search) {
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR (p.locality LIKE ?) OR (p.goals LIKE ?))`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role !== 'all') {
        query += ` AND u.role = ?`;
        params.push(role);
    }
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);
    const rows = db.prepare(query).all(...params);
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM users u INNER JOIN profiles p ON p.user_id = u.id WHERE 1=1`;
    let countParams = [];
    if (search) {
        countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR (p.locality LIKE ?) OR (p.goals LIKE ?))`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role !== 'all') {
        countQuery += ` AND u.role = ?`;
        countParams.push(role);
    }
    const countResult = db.prepare(countQuery).get(...countParams) || { total: 0 };
    const total = countResult.total || 0;
    db.close();
    const io = req.app.get('io');
    io.emit('profiles-updated', { count: total });
    res.json({
        profiles: rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
    });
});
router.get("/assessments", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { page = 1, limit = 20, search = '', assessment_type = 'all' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = `
      SELECT a.id, a.assessment_type, a.answers, a.results, a.created_at,
             u.id as user_id, u.name, u.email
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      WHERE 1=1
    `;
    let params = [];
    if (search) {
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR a.assessment_type LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (assessment_type !== 'all') {
        query += ` AND a.assessment_type = ?`;
        params.push(assessment_type);
    }
    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);
    const rows = db.prepare(query).all(...params);
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM assessments a JOIN users u ON u.id = a.user_id WHERE 1=1`;
    let countParams = [];
    if (search) {
        countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR a.assessment_type LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (assessment_type !== 'all') {
        countQuery += ` AND a.assessment_type = ?`;
        countParams.push(assessment_type);
    }
    const countResult = db.prepare(countQuery).get(...countParams) || { total: 0 };
    const total = countResult.total || 0;
    db.close();
    const io = req.app.get('io');
    io.emit('assessments-updated', { count: total });
    res.json({
        assessments: rows,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
    });
});
router.get("/analytics", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    try {
        const db = (0, setup_1.getDb)();
        // Weekly metrics (last 8 weeks)
        const weeks = db.prepare(`
        SELECT
          strftime('%W', s.created_at) as week_num,
          COUNT(DISTINCT s.user_id) as active_users,
          AVG(CASE WHEN p.gad7_score IS NOT NULL THEN p.gad7_score ELSE 0 END) as avg_anxiety,
          AVG(CASE WHEN p.phq9_score IS NOT NULL THEN p.phq9_score ELSE 0 END) as avg_depression,
          AVG(CASE WHEN p.ghq12_score IS NOT NULL THEN p.ghq12_score ELSE 0 END) as avg_stress
        FROM signins s
        LEFT JOIN profiles p ON p.user_id = s.user_id
        WHERE s.created_at > datetime('now', '-8 weeks')
        GROUP BY strftime('%W', s.created_at)
        ORDER BY week_num DESC
        LIMIT 8
      `).all();
        // Total users
        const totalUsersResult = db.prepare('SELECT COUNT(*) as count FROM users').get() || { count: 0 };
        const totalUsers = totalUsersResult.count;
        // Active users (last 7 days)
        const activeUsersResult = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM signins
        WHERE created_at > datetime('now', '-7 days')
      `).get() || { count: 0 };
        const activeUsers = activeUsersResult.count;
        // New bookings (last week)
        const newBookingsResult = db.prepare(`
        SELECT COUNT(*) as count
        FROM bookings
        WHERE created_at > datetime('now', '-7 days')
      `).get() || { count: 0 };
        const newBookings = newBookingsResult.count;
        // Flagged/high risk profiles (use 0 if fields don't exist)
        const highRiskResult = db.prepare(`
        SELECT COUNT(*) as count
        FROM profiles
        WHERE (gad7_score > 15 OR phq9_score > 20 OR ghq12_score > 12)
      `).get() || { count: 0 };
        const highRisk = highRiskResult.count || 0;
        // Average score across all assessments
        const avgScoreResult = db.prepare(`
        SELECT AVG(CASE WHEN json_extract(results, '$.score') IS NOT NULL THEN json_extract(results, '$.score') ELSE NULL END) as avg
        FROM assessments
      `).get() || { avg: 0 };
        const avgAnxiety = avgScoreResult.avg || 0;
        // Risk distribution (fallback to empty if fields missing)
        const riskData = db.prepare(`
        SELECT
          CASE
            WHEN (gad7_score > 15 OR phq9_score > 20 OR ghq12_score > 12) THEN 'high'
            WHEN (gad7_score > 10 OR phq9_score > 15 OR ghq12_score > 8) THEN 'medium'
            ELSE 'low'
          END as risk_level,
          COUNT(*) as count
        FROM profiles
        GROUP BY risk_level
      `).all() || [];
        // Department usage (group by role or add major if available)
        const deptData = db.prepare(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `).all() || [];
        // Recent activity (last 10 anonymized entries)
        const recentActivity = db.prepare(`
        SELECT j.created_at as date, j.mood,
               CASE
                 WHEN (p.gad7_score > 15 OR p.phq9_score > 20 OR p.ghq12_score > 12) THEN 'High'
                 WHEN (p.gad7_score > 10 OR p.phq9_score > 15 OR p.ghq12_score > 8) THEN 'Medium'
                 ELSE 'Low'
               END as risk
        FROM journal_entries j
        LEFT JOIN profiles p ON p.user_id = j.user_id
        ORDER BY j.created_at DESC
        LIMIT 10
      `).all() || [];
        // Recent assessments (last 7 days)
        const recentAssessmentsResult = db.prepare(`
        SELECT COUNT(*) as count
        FROM assessments
        WHERE created_at > datetime('now', '-7 days')
      `).get() || { count: 0 };
        const recentAssessments = recentAssessmentsResult.count || 0;
        // Assessment types breakdown (all-time)
        const assessmentTypes = db.prepare(`
        SELECT 
          assessment_type,
          COUNT(*) as count,
          AVG(CASE WHEN json_extract(results, '$.score') IS NOT NULL THEN json_extract(results, '$.score') ELSE 0 END) as avgScore
        FROM assessments
        GROUP BY assessment_type
      `).all() || [];
        // Score distributions by assessment type (bins: low 0-5, medium 6-10, high 11+ for simplicity; adjust per type if needed)
        const scoreDistributions = db.prepare(`
        SELECT 
          assessment_type,
          SUM(CASE WHEN json_extract(results, '$.score') < 6 THEN 1 ELSE 0 END) as low,
          SUM(CASE WHEN json_extract(results, '$.score') BETWEEN 6 AND 10 THEN 1 ELSE 0 END) as medium,
          SUM(CASE WHEN json_extract(results, '$.score') > 10 THEN 1 ELSE 0 END) as high
        FROM assessments
        GROUP BY assessment_type
      `).all() || [];
        // Demographics: Risk by locality (using profile scores)
        const demographics = db.prepare(`
        SELECT 
          p.locality,
          SUM(CASE WHEN (p.gad7_score > 15 OR p.phq9_score > 20 OR p.ghq12_score > 12) THEN 1 ELSE 0 END) as highRisk,
          SUM(CASE WHEN (p.gad7_score > 10 OR p.phq9_score > 15 OR p.ghq12_score > 8) THEN 1 ELSE 0 END 
               AND NOT (p.gad7_score > 15 OR p.phq9_score > 20 OR p.ghq12_score > 12)) as mediumRisk,
          SUM(CASE WHEN NOT (p.gad7_score > 10 OR p.phq9_score > 15 OR p.ghq12_score > 8) THEN 1 ELSE 0 END) as lowRisk,
          COUNT(*) as total
        FROM profiles p
        GROUP BY p.locality
      `).all() || [];
        // Current week metrics
        const currentWeekActiveUsers = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM signins
        WHERE created_at > datetime('now', '-7 days')
      `).get() || { count: 0 };
        const currentWeekAvgAnxiety = db.prepare(`
        SELECT AVG(CASE WHEN gad7_score IS NOT NULL THEN gad7_score ELSE 0 END) as avg
        FROM profiles
        WHERE user_id IN (
          SELECT DISTINCT user_id FROM signins WHERE created_at > datetime('now', '-7 days')
        )
      `).get() || { avg: 0 };
        const currentWeekRecentAssessments = db.prepare(`
        SELECT COUNT(*) as count
        FROM assessments
        WHERE created_at > datetime('now', '-7 days')
      `).get() || { count: 0 };
        const currentWeek = {
            activeUsers: currentWeekActiveUsers.count || 0,
            avgAnxiety: currentWeekAvgAnxiety.avg || 0,
            recentAssessments: currentWeekRecentAssessments.count || 0
        };
        // Previous week metrics
        const previousWeekActiveUsers = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM signins
        WHERE created_at > datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')
      `).get() || { count: 0 };
        const previousWeekAvgAnxiety = db.prepare(`
        SELECT AVG(CASE WHEN gad7_score IS NOT NULL THEN gad7_score ELSE 0 END) as avg
        FROM profiles
        WHERE user_id IN (
          SELECT DISTINCT user_id FROM signins WHERE created_at > datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')
        )
      `).get() || { avg: 0 };
        const previousWeekRecentAssessments = db.prepare(`
        SELECT COUNT(*) as count
        FROM assessments
        WHERE created_at > datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')
      `).get() || { count: 0 };
        const previousWeek = {
            activeUsers: previousWeekActiveUsers.count || 0,
            avgAnxiety: previousWeekAvgAnxiety.avg || 0,
            recentAssessments: previousWeekRecentAssessments.count || 0
        };
        const wowChanges = {
            activeUsersDelta: currentWeek.activeUsers - previousWeek.activeUsers,
            avgAnxietyDelta: currentWeek.avgAnxiety - previousWeek.avgAnxiety,
            recentAssessmentsDelta: currentWeek.recentAssessments - previousWeek.recentAssessments
        };
        db.close();
        res.json({
            weeks: weeks || [],
            totalUsers,
            activeUsers,
            newBookings,
            highRisk,
            avgAnxiety,
            riskData,
            deptData,
            recentActivity,
            recentAssessments,
            assessmentTypes,
            scoreDistributions,
            demographics,
            wowChanges
        });
    }
    catch (error) {
        console.error('Analytics query error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data. Database may be missing required tables or fields.' });
    }
});
router.delete("/entries/:id", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM signins WHERE id = ?').run(id);
        db.close();
        if (result.changes > 0) {
            const io = req.app.get('io');
            io.emit('entries-updated', { type: 'delete', id: Number(id) });
            res.json({ message: 'Entry deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Entry not found' });
        }
    }
    catch (error) {
        console.error('Delete entry error:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});
router.delete("/profiles/:user_id", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { user_id } = req.params;
    try {
        const result = db.prepare('DELETE FROM profiles WHERE user_id = ?').run(user_id);
        db.close();
        if (result.changes > 0) {
            const io = req.app.get('io');
            io.emit('profiles-updated', { deleted: user_id });
            res.json({ message: 'Profile deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Profile not found' });
        }
    }
    catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});
router.delete("/assessments/:id", middleware_1.requireAuth, middleware_1.requireAdmin, (req, res) => {
    const db = (0, setup_1.getDb)();
    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM assessments WHERE id = ?').run(id);
        db.close();
        if (result.changes > 0) {
            const io = req.app.get('io');
            io.emit('assessments-updated', { deleted: id });
            res.json({ message: 'Assessment deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Assessment not found' });
        }
    }
    catch (error) {
        console.error('Delete assessment error:', error);
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});
exports.default = router;
