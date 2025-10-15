"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const setup_1 = require("../setup");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
const saveAssessmentSchema = zod_1.z.object({
    assessment_type: zod_1.z.string(),
    answers: zod_1.z.record(zod_1.z.number()),
    results: zod_1.z.array(zod_1.z.object({
        toolName: zod_1.z.string(),
        category: zod_1.z.string(),
        score: zod_1.z.number(),
        maxScore: zod_1.z.number(),
        severity: zod_1.z.string(),
        riskLevel: zod_1.z.string(),
        requiresFollowUp: zod_1.z.boolean(),
        description: zod_1.z.string(),
        recommendations: zod_1.z.array(zod_1.z.string())
    }))
});
router.post("/", middleware_1.requireAuth, (req, res) => {
    const userId = req.user.userId;
    const parse = saveAssessmentSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { assessment_type, answers, results } = parse.data;
    const db = (0, setup_1.getDb)();
    db.prepare("INSERT INTO assessments (user_id, assessment_type, answers, results) VALUES (?, ?, ?, ?)").run(userId, assessment_type, JSON.stringify(answers), JSON.stringify(results));
    db.close();
    res.json({ message: "Assessment saved successfully" });
});
exports.default = router;
