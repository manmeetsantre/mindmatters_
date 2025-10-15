import { Router } from "express";
import { z } from "zod";
import { getDb } from "../setup";
import { requireAuth } from "../middleware";

const router = Router();

const saveAssessmentSchema = z.object({
  assessment_type: z.string(),
  answers: z.record(z.number()),
  results: z.array(z.object({
    toolName: z.string(),
    category: z.string(),
    score: z.number(),
    maxScore: z.number(),
    severity: z.string(),
    riskLevel: z.string(),
    requiresFollowUp: z.boolean(),
    description: z.string(),
    recommendations: z.array(z.string())
  }))
});

router.post("/", requireAuth as any, (req: any, res) => {
  const userId = req.user.userId as number;
  const parse = saveAssessmentSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { assessment_type, answers, results } = parse.data;

  const db = getDb();
  db.prepare(
    "INSERT INTO assessments (user_id, assessment_type, answers, results) VALUES (?, ?, ?, ?)"
  ).run(userId, assessment_type, JSON.stringify(answers), JSON.stringify(results));
  db.close();
  res.json({ message: "Assessment saved successfully" });
});

export default router;
