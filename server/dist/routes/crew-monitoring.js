"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|avi|mov|wav|mp3|jpg|jpeg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('video/') ||
            file.mimetype.startsWith('audio/') ||
            file.mimetype.startsWith('image/');
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only video, audio, and image files are allowed'));
        }
    }
});
// Emotion detection schema
const emotionDetectionSchema = zod_1.z.object({
    crewMemberId: zod_1.z.string(),
    sessionId: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime(),
    location: zod_1.z.string().optional(), // e.g., "command_module", "sleep_quarters"
});
// Critical issue detection schema
const criticalIssueSchema = zod_1.z.object({
    crewMemberId: zod_1.z.string(),
    issueType: zod_1.z.enum(['emotional_distress', 'physical_discomfort', 'sleep_disruption', 'crew_conflict', 'mission_stress']),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    description: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
    location: zod_1.z.string(),
    autoDetected: zod_1.z.boolean().default(false)
});
// Process video/audio for emotion detection
router.post("/analyze-media", middleware_1.requireAuth, upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No media file provided" });
        }
        const { crewMemberId, sessionId, location } = req.body;
        // Validate input
        const validation = emotionDetectionSchema.safeParse({
            crewMemberId,
            sessionId,
            timestamp: new Date().toISOString(),
            location
        });
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.flatten() });
        }
        // Determine processing type based on file type
        const fileExt = path_1.default.extname(req.file.filename).toLowerCase();
        let analysisResult;
        if (['.mp4', '.avi', '.mov'].includes(fileExt)) {
            // Video processing for facial emotion detection
            analysisResult = await processVideoEmotion(req.file.path);
        }
        else if (['.wav', '.mp3'].includes(fileExt)) {
            // Audio processing for voice emotion detection
            analysisResult = await processAudioEmotion(req.file.path);
        }
        else if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
            // Image processing for facial emotion detection
            analysisResult = await processImageEmotion(req.file.path);
        }
        else {
            return res.status(400).json({ error: "Unsupported file type" });
        }
        // Store analysis results in database
        const db = (0, setup_1.getDb)();
        const analysisId = db.prepare(`
      INSERT INTO crew_emotion_analysis 
      (crew_member_id, session_id, file_path, emotion_data, confidence_scores, 
       timestamp, location, analysis_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(crewMemberId, sessionId || null, req.file.path, JSON.stringify(analysisResult.emotions), JSON.stringify(analysisResult.confidenceScores), new Date().toISOString(), location || null, analysisResult.type).lastInsertRowid;
        // Check for critical issues
        const criticalIssues = await detectCriticalIssues(analysisResult, crewMemberId);
        if (criticalIssues.length > 0) {
            // Store critical issues
            for (const issue of criticalIssues) {
                db.prepare(`
          INSERT INTO critical_issues 
          (crew_member_id, issue_type, severity, description, timestamp, location, auto_detected)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(issue.crewMemberId, issue.issueType, issue.severity, issue.description, issue.timestamp, issue.location, issue.autoDetected);
            }
        }
        db.close();
        res.json({
            success: true,
            analysisId,
            emotions: analysisResult.emotions,
            confidenceScores: analysisResult.confidenceScores,
            criticalIssues,
            recommendations: generateRecommendations(analysisResult)
        });
    }
    catch (error) {
        console.error('Media analysis error:', error);
        res.status(500).json({ error: "Failed to analyze media" });
    }
});
// Real-time emotion monitoring endpoint
router.post("/start-monitoring", middleware_1.requireAuth, async (req, res) => {
    try {
        const { crewMemberId, sessionId, monitoringType } = req.body;
        const db = (0, setup_1.getDb)();
        const session = db.prepare(`
      INSERT INTO monitoring_sessions 
      (crew_member_id, session_id, monitoring_type, start_time, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(crewMemberId, sessionId, monitoringType || 'continuous', new Date().toISOString(), 'active');
        db.close();
        res.json({
            success: true,
            sessionId: sessionId,
            message: "Monitoring session started"
        });
    }
    catch (error) {
        console.error('Monitoring start error:', error);
        res.status(500).json({ error: "Failed to start monitoring" });
    }
});
// Get crew member's emotional state history
router.get("/crew/:crewMemberId/emotions", middleware_1.requireAuth, async (req, res) => {
    try {
        const { crewMemberId } = req.params;
        const { days = 7 } = req.query;
        const db = (0, setup_1.getDb)();
        const emotions = db.prepare(`
      SELECT * FROM crew_emotion_analysis 
      WHERE crew_member_id = ? 
      AND timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `).all(crewMemberId);
        const criticalIssues = db.prepare(`
      SELECT * FROM critical_issues 
      WHERE crew_member_id = ? 
      AND timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `).all(crewMemberId);
        db.close();
        res.json({
            emotions,
            criticalIssues,
            summary: generateEmotionalSummary(emotions)
        });
    }
    catch (error) {
        console.error('Emotion history error:', error);
        res.status(500).json({ error: "Failed to retrieve emotion history" });
    }
});
// Get critical issues for ground control
router.get("/critical-issues", middleware_1.requireAuth, async (req, res) => {
    try {
        const { severity = 'medium', hours = 24 } = req.query;
        const db = (0, setup_1.getDb)();
        const issues = db.prepare(`
      SELECT ci.*, c.name as crew_member_name 
      FROM critical_issues ci
      JOIN crew_members c ON ci.crew_member_id = c.id
      WHERE ci.severity IN (?, 'high', 'critical')
      AND ci.timestamp >= datetime('now', '-${hours} hours')
      ORDER BY ci.timestamp DESC
    `).all(severity);
        db.close();
        res.json({
            issues,
            summary: {
                total: issues.length,
                bySeverity: issues.reduce((acc, issue) => {
                    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
                    return acc;
                }, {}),
                byCrewMember: issues.reduce((acc, issue) => {
                    acc[issue.crew_member_name] = (acc[issue.crew_member_name] || 0) + 1;
                    return acc;
                }, {})
            }
        });
    }
    catch (error) {
        console.error('Critical issues error:', error);
        res.status(500).json({ error: "Failed to retrieve critical issues" });
    }
});
// AI Companion endpoint for psychological support
router.post("/ai-companion", middleware_1.requireAuth, async (req, res) => {
    try {
        const { crewMemberId, message, context } = req.body;
        // Get recent emotional state for context
        const db = (0, setup_1.getDb)();
        const recentEmotions = db.prepare(`
      SELECT * FROM crew_emotion_analysis 
      WHERE crew_member_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 5
    `).all(crewMemberId);
        const recentIssues = db.prepare(`
      SELECT * FROM critical_issues 
      WHERE crew_member_id = ? 
      AND timestamp >= datetime('now', '-24 hours')
      ORDER BY timestamp DESC
    `).all(crewMemberId);
        db.close();
        // Generate AI response based on emotional context
        const aiResponse = await generateAICompanionResponse(message, {
            recentEmotions,
            recentIssues,
            context
        });
        // Store conversation
        const db2 = (0, setup_1.getDb)();
        db2.prepare(`
      INSERT INTO ai_companion_conversations 
      (crew_member_id, user_message, ai_response, timestamp, emotional_context)
      VALUES (?, ?, ?, ?, ?)
    `).run(crewMemberId, message, aiResponse.response, new Date().toISOString(), JSON.stringify(aiResponse.context));
        db2.close();
        res.json({
            success: true,
            response: aiResponse.response,
            recommendations: aiResponse.recommendations,
            emotionalSupport: aiResponse.emotionalSupport
        });
    }
    catch (error) {
        console.error('AI companion error:', error);
        res.status(500).json({ error: "Failed to process AI companion request" });
    }
});
// Helper functions
async function processVideoEmotion(filePath) {
    // This would integrate with your existing emotion detection model
    // For now, returning mock data
    return {
        type: 'video',
        emotions: {
            primary: 'neutral',
            secondary: ['calm', 'focused'],
            confidence: 0.85
        },
        confidenceScores: {
            happy: 0.1,
            sad: 0.05,
            angry: 0.02,
            fearful: 0.03,
            surprised: 0.05,
            disgusted: 0.01,
            neutral: 0.85
        },
        metadata: {
            duration: 30,
            frameRate: 30,
            resolution: '1920x1080'
        }
    };
}
async function processAudioEmotion(filePath) {
    // This would integrate with voice emotion detection
    return {
        type: 'audio',
        emotions: {
            primary: 'calm',
            secondary: ['focused'],
            confidence: 0.78
        },
        confidenceScores: {
            happy: 0.15,
            sad: 0.08,
            angry: 0.05,
            fearful: 0.12,
            surprised: 0.10,
            disgusted: 0.02,
            neutral: 0.48
        },
        metadata: {
            duration: 15,
            sampleRate: 44100,
            channels: 1
        }
    };
}
async function processImageEmotion(filePath) {
    // This would integrate with your existing facial emotion detection
    return {
        type: 'image',
        emotions: {
            primary: 'neutral',
            secondary: ['calm'],
            confidence: 0.82
        },
        confidenceScores: {
            happy: 0.12,
            sad: 0.08,
            angry: 0.03,
            fearful: 0.05,
            surprised: 0.08,
            disgusted: 0.02,
            neutral: 0.62
        },
        metadata: {
            resolution: '1920x1080',
            format: 'JPEG'
        }
    };
}
async function detectCriticalIssues(analysisResult, crewMemberId) {
    const issues = [];
    // Check for high stress indicators
    if (analysisResult.confidenceScores.angry > 0.7 ||
        analysisResult.confidenceScores.fearful > 0.7) {
        issues.push({
            crewMemberId,
            issueType: 'emotional_distress',
            severity: analysisResult.confidenceScores.angry > 0.8 ? 'critical' : 'high',
            description: 'Detected high levels of anger or fear in crew member',
            timestamp: new Date().toISOString(),
            location: 'unknown',
            autoDetected: true
        });
    }
    // Check for sadness/depression indicators
    if (analysisResult.confidenceScores.sad > 0.6) {
        issues.push({
            crewMemberId,
            issueType: 'emotional_distress',
            severity: 'medium',
            description: 'Detected signs of sadness or depression',
            timestamp: new Date().toISOString(),
            location: 'unknown',
            autoDetected: true
        });
    }
    return issues;
}
function generateRecommendations(analysisResult) {
    const recommendations = [];
    if (analysisResult.confidenceScores.stress > 0.6) {
        recommendations.push({
            type: 'stress_management',
            priority: 'high',
            action: 'Suggest mindfulness exercises or breathing techniques',
            duration: '15-20 minutes'
        });
    }
    if (analysisResult.confidenceScores.isolation > 0.5) {
        recommendations.push({
            type: 'social_connection',
            priority: 'medium',
            action: 'Encourage crew interaction or ground communication',
            duration: '30 minutes'
        });
    }
    return recommendations;
}
async function generateAICompanionResponse(message, context) {
    // This would integrate with a more sophisticated AI model
    // For now, providing contextual responses based on emotional state
    const recentEmotion = context.recentEmotions[0];
    const hasRecentIssues = context.recentIssues.length > 0;
    let response = "I understand you're reaching out. ";
    if (hasRecentIssues) {
        response += "I've noticed some concerning patterns in your recent emotional state. ";
        response += "Would you like to talk about what's been troubling you? ";
        response += "Remember, you're not alone in this mission - we're all here to support each other.";
    }
    else if (recentEmotion && recentEmotion.confidence_scores) {
        const scores = JSON.parse(recentEmotion.confidence_scores);
        if (scores.stress > 0.6) {
            response += "I can sense you might be feeling some stress. ";
            response += "Would you like to try some relaxation techniques? ";
            response += "We have breathing exercises and meditation sessions available.";
        }
        else {
            response += "It's good to hear from you. ";
            response += "How are you feeling today? ";
            response += "Is there anything specific you'd like to discuss?";
        }
    }
    else {
        response += "How can I help you today? ";
        response += "I'm here to provide support and companionship during your mission.";
    }
    return {
        response,
        recommendations: generateRecommendations({ confidenceScores: recentEmotion?.confidence_scores || {} }),
        emotionalSupport: {
            type: hasRecentIssues ? 'crisis_support' : 'general_support',
            intensity: hasRecentIssues ? 'high' : 'medium'
        },
        context: {
            recentEmotions: context.recentEmotions.length,
            recentIssues: context.recentIssues.length,
            timestamp: new Date().toISOString()
        }
    };
}
function generateEmotionalSummary(emotions) {
    if (emotions.length === 0)
        return null;
    const avgConfidence = emotions.reduce((acc, emotion) => {
        const scores = JSON.parse(emotion.confidence_scores);
        Object.keys(scores).forEach(key => {
            acc[key] = (acc[key] || 0) + scores[key];
        });
        return acc;
    }, {});
    Object.keys(avgConfidence).forEach(key => {
        avgConfidence[key] = avgConfidence[key] / emotions.length;
    });
    const dominantEmotion = Object.keys(avgConfidence).reduce((a, b) => avgConfidence[a] > avgConfidence[b] ? a : b);
    return {
        dominantEmotion,
        averageConfidence: avgConfidence,
        totalAnalyses: emotions.length,
        trend: emotions.length > 1 ? 'stable' : 'insufficient_data'
    };
}
exports.default = router;
