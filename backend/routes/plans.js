import express from "express";
import rateLimit from "express-rate-limit";
import { query, withTransaction } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { askGeminiJson, mapGeminiError } from "../services/gemini.js";
import {
  buildFallbackPrepPlan,
  normalizeAiPrepPlan,
  computePlanSummary,
  buildPremiumPreview,
} from "../services/prepPlans.js";
import { awardBadge } from "../services/badges.js";
import { createNotification } from "../services/push.js";

const router = express.Router();

const generatorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyGenerator: (req) => req.user?.id || "anonymous",
  validate: { xForwardedForHeader: false },
  handler: (_req, res) =>
    res.status(429).json({
      error: "You have generated a lot of plans in a short time. Wait a few minutes and try again.",
      code: "too_many_plan_generations",
    }),
});

router.use(authenticate);

function sanitizeInputs(body = {}) {
  return {
    syllabusText: String(body.syllabusText || "").trim(),
    daysLeft: Number(body.daysLeft),
    hoursPerDay: Number(body.hoursPerDay),
    familiarity: String(body.familiarity || "").toLowerCase(),
    effortLevel: String(body.effortLevel || "").toLowerCase(),
    goal: String(body.goal || "").toLowerCase(),
  };
}

function validateInputs(inputs) {
  if (inputs.syllabusText.length < 10) return "Paste a clearer syllabus so we can build a useful prep plan.";
  if (!Number.isFinite(inputs.daysLeft) || inputs.daysLeft < 1 || inputs.daysLeft > 60) return "Choose a valid number of days left.";
  if (!Number.isFinite(inputs.hoursPerDay) || inputs.hoursPerDay < 0.5 || inputs.hoursPerDay > 16) return "Choose valid daily study hours.";
  if (!["beginner", "intermediate", "strong"].includes(inputs.familiarity)) return "Select your current familiarity level.";
  if (!["low", "medium", "high"].includes(inputs.effortLevel)) return "Select your effort level.";
  if (!["pass_exam", "score_high"].includes(inputs.goal)) return "Select whether you want to pass the exam or score high marks.";
  return null;
}

function buildPrompt(inputs) {
  return `You are building an AI-powered A2Z exam preparation sheet for a student.
Respond ONLY with valid JSON. No markdown. No comments.

Student inputs:
- Days left: ${inputs.daysLeft}
- Study hours per day: ${inputs.hoursPerDay}
- Familiarity: ${inputs.familiarity}
- Effort level: ${inputs.effortLevel}
- Goal: ${inputs.goal === "score_high" ? "Score high marks" : "Pass exam"}

Syllabus:
${inputs.syllabusText.slice(0, 12000)}

Return exactly this JSON shape:
{
  "title": "short plan title",
  "overview": {
    "summary": "2-3 sentence overview",
    "limitedTimeStrategy": "single sentence about how to use limited time",
    "goalLabel": "Score high marks or Pass exam confidently",
    "estimatedTotalHours": 18
  },
  "topics": [
    {
      "id": "section-1",
      "title": "Unit or section title",
      "topics": [
        {
          "id": "topic-1",
          "title": "topic name",
          "priority": "high",
          "estimatedHours": 1.5,
          "whyPriority": "why this topic matters for exam scoring",
          "keyConcepts": ["concept 1", "concept 2", "concept 3"],
          "quickNotes": "what to put into fast notes",
          "videoRecommendation": {
            "title": "best video angle",
            "searchQuery": "youtube search query"
          },
          "practiceRecommendation": "practice prompt or important questions search"
        }
      ]
    }
  ],
  "dailyPlan": [
    {
      "day": 1,
      "label": "Day 1",
      "dateLabel": "Day 1",
      "totalHours": 3,
      "headline": "main focus",
      "revisionFocus": "how to revise today",
      "sessions": [
        {
          "topicId": "topic-1",
          "topicTitle": "topic name",
          "priority": "high",
          "focus": "what to do",
          "estimatedHours": 1.5
        }
      ]
    }
  ],
  "revisionStrategy": {
    "cadence": "short revision cadence",
    "checkpoints": ["checkpoint 1", "checkpoint 2", "checkpoint 3"],
    "lastDayChecklist": ["item 1", "item 2", "item 3"]
  },
  "resources": {
    "videoStrategy": "how to use videos efficiently",
    "recommendedChannels": ["channel 1", "channel 2"],
    "searchHints": ["hint 1", "hint 2"]
  }
}

Rules:
- Prioritize scoring potential and limited-time efficiency.
- Use priority only as high, medium, or low.
- Keep the plan student-friendly and realistic.
- Do not include premium features or billing language.
- If time is short, compress aggressively and say what to skip indirectly by lowering priority.`;
}

async function loadTopicStatuses(planId, studentId) {
  const { rows } = await query(
    `SELECT topic_id, status, note, starred
     FROM prep_plan_topic_status
     WHERE plan_id = $1 AND student_id = $2`,
    [planId, studentId]
  );

  return rows.reduce((acc, row) => {
    acc[row.topic_id] = { status: row.status, note: row.note, starred: row.starred };
    return acc;
  }, {});
}

async function formatPlanRow(planRow, studentId) {
  const topicStatuses = await loadTopicStatuses(planRow.id, studentId);
  const summary = computePlanSummary(planRow.plan_data, topicStatuses);
  return {
    id: planRow.id,
    title: planRow.title,
    rawSyllabus: planRow.raw_syllabus,
    inputSettings: planRow.input_settings,
    plan: planRow.plan_data,
    topicStatuses,
    summary,
    generationSource: planRow.generation_source,
    generationNote: planRow.generation_note,
    isPremiumReady: planRow.is_premium_ready,
    premiumPreview: planRow.premium_preview || buildPremiumPreview(),
    createdAt: planRow.created_at,
    updatedAt: planRow.updated_at,
    lastOpenedAt: planRow.last_opened_at,
  };
}

router.post("/generate", generatorLimiter, async (req, res) => {
  const inputs = sanitizeInputs(req.body);
  const validationError = validateInputs(inputs);
  if (validationError) {
    return res.status(400).json({ error: validationError, code: "invalid_plan_input" });
  }

  let planData;
  let generationSource = "ai";
  let generationNote = "Generated with AI and normalized for a consistent student experience.";

  try {
    const aiPlan = await askGeminiJson(buildPrompt(inputs));
    planData = normalizeAiPrepPlan(aiPlan, inputs);
  } catch (err) {
    const mapped = mapGeminiError(err);
    generationSource = "fallback";
    generationNote = mapped.code === "gemini_rate_limited"
      ? "AI was rate-limited, so we built a smart fallback plan from your syllabus instantly."
      : "AI was unavailable, so we built a smart fallback plan from your syllabus.";
    planData = buildFallbackPrepPlan(inputs, {
      title: "A2Z Prep Plan",
      generationMode: "fallback",
      generationNote,
    });
  }

  const premiumPreview = buildPremiumPreview();

  try {
    const saved = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO prep_plans (
          student_id, title, raw_syllabus, input_settings, plan_data, generation_source,
          generation_note, is_premium_ready, premium_preview
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [
          req.user.id,
          planData.title || "A2Z Prep Plan",
          inputs.syllabusText,
          JSON.stringify(inputs),
          JSON.stringify(planData),
          generationSource,
          generationNote,
          true,
          JSON.stringify(premiumPreview),
        ]
      );
      return rows[0];
    });

    await awardBadge(req.user.id, "planner");
    await createNotification(
      req.user.id,
      "plan",
      generationSource === "ai" ? "Your prep plan is ready" : "Your fallback prep plan is ready",
      generationSource === "ai"
        ? "Your A2Z prep sheet is ready to study from."
        : "AI was busy, but your A2Z fallback plan is ready so you can keep moving.",
      `/plans/${saved.id}`
    );

    const payload = await formatPlanRow(saved, req.user.id);
    return res.status(201).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Could not save the prep plan.", code: "plan_save_failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM prep_plans
       WHERE student_id = $1
       ORDER BY COALESCE(last_opened_at, updated_at, created_at) DESC`,
      [req.user.id]
    );

    const payload = await Promise.all(rows.map((row) => formatPlanRow(row, req.user.id)));
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not load plans." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE prep_plans
       SET last_opened_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND student_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ error: "Prep plan not found." });

    const payload = await formatPlanRow(rows[0], req.user.id);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not load the plan." });
  }
});

router.patch("/:id/topic/:topicId", async (req, res) => {
  const { status, note, starred } = req.body || {};
  if (status && !["not_started", "in_progress", "done", "revise_again"].includes(status)) {
    return res.status(400).json({ error: "Invalid topic status." });
  }

  try {
    const { rows } = await query(`SELECT id FROM prep_plans WHERE id = $1 AND student_id = $2`, [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Prep plan not found." });

    await query(
      `INSERT INTO prep_plan_topic_status (student_id, plan_id, topic_id, status, note, starred, updated_at)
       VALUES ($1, $2, $3, COALESCE($4, 'not_started'), $5, COALESCE($6, false), NOW())
       ON CONFLICT (student_id, plan_id, topic_id) DO UPDATE SET
         status = CASE WHEN $4 IS NOT NULL THEN $4 ELSE prep_plan_topic_status.status END,
         note = CASE WHEN $5 IS NOT NULL THEN $5 ELSE prep_plan_topic_status.note END,
         starred = CASE WHEN $6 IS NOT NULL THEN $6 ELSE prep_plan_topic_status.starred END,
         updated_at = NOW()`,
      [req.user.id, req.params.id, req.params.topicId, status ?? null, note ?? null, starred ?? null]
    );

    await query(`UPDATE prep_plans SET updated_at = NOW() WHERE id = $1 AND student_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not update topic progress." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await query(`DELETE FROM prep_plans WHERE id = $1 AND student_id = $2`, [req.params.id, req.user.id]);
    if (!rowCount) return res.status(404).json({ error: "Prep plan not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not delete the plan." });
  }
});

export default router;
