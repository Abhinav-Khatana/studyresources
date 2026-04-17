import express    from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit  from "express-rate-limit";
import { query }  from "../db/index.js";
import { authenticate }       from "../middleware/auth.js";
import { awardBadge }         from "../services/badges.js";
import { createNotification } from "../services/push.js";

const router = express.Router();

// ── New Google Gen AI SDK (supports Gemini 2.5) ───────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Retry helper: auto-retry on 429 rate-limit with exponential backoff ────────
async function askGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const text = response.text || "";
      // Strip markdown code fences if model wraps response
      return text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("quota") || err?.message?.includes("Too Many");
      if (isRateLimit && attempt < retries) {
        const waitMs = attempt * 5000; // 5s, 10s, 15s backoff
        console.log(`[Gemini] Rate limit hit. Retry ${attempt}/${retries - 1} in ${waitMs / 1000}s...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
}

// ── Rate limiter: max 10 AI calls per user per 15 min ─────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || "anonymous",
  validate: { xForwardedForHeader: false },
  handler: (req, res) =>
    res.status(429).json({ error: "Too many AI requests — take a breath and try again in 15 min 😅", code: "rate_limited" }),
});

// Apply limiter to all AI routes
router.use(authenticate, aiLimiter);

// ── POST /api/ai/roadmap ──────────────────────────────────────────────────────
router.post("/roadmap", async (req, res) => {
  const { subjectId, examDate, effortLevel, cgpa, knowledgePercent } = req.body;
  if (!subjectId || !examDate || !effortLevel || cgpa === undefined || knowledgePercent === undefined)
    return res.status(400).json({ error: "All fields required" });

  try {
    const { rows: subRows } = await query(`SELECT * FROM subjects WHERE id=$1`, [subjectId]);
    if (subRows.length === 0) return res.status(404).json({ error: "Subject not found" });
    const subject = subRows[0];

    const { rows: units } = await query(
      `SELECT u.unit_number, u.title, ARRAY_AGG(t.topic ORDER BY t.position) AS topics
       FROM units u LEFT JOIN unit_topics t ON t.unit_id=u.id
       WHERE u.subject_id=$1 GROUP BY u.id ORDER BY u.unit_number`,
      [subjectId]
    );

    const daysLeft    = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / 86400000));
    const unitSummary = units.map(u => `Unit ${u.unit_number}: ${u.title} [${(u.topics || []).join(", ")}]`).join("\n");

    const prompt = `You are an expert academic advisor for a CSE student preparing for ${subject.name} exam.
Student: ${daysLeft} days left, effort ${effortLevel}/10, CGPA ${cgpa}, knows ${knowledgePercent}% of subject.
Syllabus:\n${unitSummary}
Generate a realistic day-by-day roadmap. Respond ONLY with valid JSON, no markdown:
{
  "summary": "2-3 sentence personalized summary",
  "totalHours": number,
  "dailyHours": number,
  "targetGrade": "A+/A/B+ etc",
  "weeks": [{ "week": 1, "theme": "string", "days": [{ "day": 1, "date": "Day 1", "unit": "Unit X", "focus": "topic", "tasks": ["task1","task2"], "hours": number, "type": "study|revision|practice|rest" }] }],
  "tips": ["tip1","tip2","tip3"],
  "warnings": []
}`;

    const clean   = await askGemini(prompt);
    const roadmap = JSON.parse(clean);

    const { rows: saved } = await query(
      `INSERT INTO saved_roadmaps (student_id, subject_id, exam_date, effort_level, cgpa, knowledge_pct, roadmap_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
      [req.user.id, subjectId, examDate, effortLevel, cgpa, knowledgePercent, JSON.stringify(roadmap)]
    );

    await awardBadge(req.user.id, "ai_explorer");

    res.json({ roadmap, savedId: saved[0].id, subject: { id: subject.id, name: subject.name, code: subject.code }, daysLeft });
  } catch (err) {
    if (err instanceof SyntaxError)
      return res.status(500).json({ error: "AI response parsing failed. Try again." });
    res.status(500).json({ error: "Failed to generate roadmap", details: err.message });
  }
});

// ── GET /api/ai/roadmaps ──────────────────────────────────────────────────────
router.get("/roadmaps", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.id, r.exam_date::text, r.effort_level, r.cgpa, r.knowledge_pct,
              r.created_at, r.roadmap_data,
              s.name AS subject_name, s.icon AS subject_icon, s.id AS subject_id
       FROM saved_roadmaps r JOIN subjects s ON s.id = r.subject_id
       WHERE r.student_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/roadmaps/:id", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, s.name AS subject_name, s.icon AS subject_icon
       FROM saved_roadmaps r JOIN subjects s ON s.id=r.subject_id
       WHERE r.id=$1 AND r.student_id=$2`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Roadmap not found" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/roadmaps/:id", async (req, res) => {
  try {
    await query(`DELETE FROM saved_roadmaps WHERE id=$1 AND student_id=$2`, [req.params.id, req.user.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/ai/weekly-plan ──────────────────────────────────────────────────
router.post("/weekly-plan", async (req, res) => {
  const { subjectIds, hoursPerDay, availableDays, startDate } = req.body;
  if (!subjectIds?.length || !hoursPerDay)
    return res.status(400).json({ error: "Select at least one subject and hours/day" });

  try {
    const placeholders = subjectIds.map((_, i) => `$${i + 1}`).join(",");
    const { rows: subjects } = await query(
      `SELECT s.id, s.name, s.icon,
              COALESCE(JSON_AGG(JSON_BUILD_OBJECT('unit', u.unit_number, 'title', u.title) ORDER BY u.unit_number) FILTER (WHERE u.id IS NOT NULL), '[]') AS units
       FROM subjects s LEFT JOIN units u ON u.subject_id = s.id
       WHERE s.id IN (${placeholders}) GROUP BY s.id`,
      subjectIds
    );

    const progressData = {};
    for (const s of subjects) {
      const { rows: total } = await query(
        `SELECT COUNT(*) FROM resources r JOIN units u ON r.unit_id=u.id WHERE u.subject_id=$1`, [s.id]
      );
      const { rows: done } = await query(
        `SELECT COUNT(*) FROM completed_resources cr JOIN resources r ON cr.resource_id=r.id
         JOIN units u ON r.unit_id=u.id WHERE cr.student_id=$1 AND u.subject_id=$2`,
        [req.user.id, s.id]
      );
      const t = parseInt(total[0]?.count) || 1;
      const d = parseInt(done[0]?.count) || 0;
      progressData[s.id] = Math.round((d / t) * 100);
    }

    const days          = availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const subjectSummary = subjects.map(s =>
      `${s.icon} ${s.name} (${progressData[s.id]}% completed) — Units: ${JSON.stringify(s.units)}`
    ).join("\n");

    const prompt = `You are a smart academic planner for CSE students.
Student data:
- Available days per week: ${days.join(", ")}
- Hours available per day: ${hoursPerDay}h
- Subjects to cover:\n${subjectSummary}

Generate a 7-day weekly study plan starting from ${startDate || "tomorrow"}.
Make it light, actionable, and motivating.
Respond ONLY with valid JSON, no markdown:
{
  "summary": "3-sentence plan overview with motivation",
  "totalHours": number,
  "days": [
    {
      "day": "Monday",
      "date": "Day 1",
      "subject": "Subject Name",
      "icon": "emoji",
      "topics": ["topic1", "topic2"],
      "tasks": ["action1", "action2"],
      "hours": number,
      "type": "study|revision|practice|rest",
      "motivation": "short gen-z motivational quote for this day"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const clean = await askGemini(prompt);
    const plan  = JSON.parse(clean);

    const { rows: saved } = await query(
      `INSERT INTO study_plans (student_id, plan_type, subject_ids, plan_data) VALUES ($1,'weekly',$2,$3) RETURNING id, created_at`,
      [req.user.id, subjectIds, JSON.stringify(plan)]
    );

    await awardBadge(req.user.id, "planner");
    await createNotification(
      req.user.id, "plan",
      "📅 Weekly plan ready!",
      `Your ${subjects.length}-subject study plan is set. Let's get it 💪`,
      "/study-mode"
    );

    res.json({ plan, savedId: saved[0].id });
  } catch (err) {
    if (err instanceof SyntaxError) return res.status(500).json({ error: "AI parsing failed. Retry." });
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/crash-plan ───────────────────────────────────────────────────
router.post("/crash-plan", async (req, res) => {
  const { subjectId, hoursAvailable, knowledgePercent } = req.body;
  if (!subjectId || !hoursAvailable)
    return res.status(400).json({ error: "Subject and hours required" });

  try {
    const { rows: subRows } = await query(`SELECT * FROM subjects WHERE id=$1`, [subjectId]);
    if (subRows.length === 0) return res.status(404).json({ error: "Subject not found" });
    const subject = subRows[0];

    const { rows: units } = await query(
      `SELECT u.unit_number, u.title, ARRAY_AGG(t.topic ORDER BY t.position) AS topics
       FROM units u LEFT JOIN unit_topics t ON t.unit_id=u.id
       WHERE u.subject_id=$1 GROUP BY u.id ORDER BY u.unit_number`,
      [subjectId]
    );

    const unitSummary = units.map(u =>
      `Unit ${u.unit_number}: ${u.title} [Topics: ${(u.topics || []).join(", ")}]`
    ).join("\n");

    const prompt = `EMERGENCY MODE: A CSE student has ${hoursAvailable} hours before their ${subject.name} exam.
They currently know about ${knowledgePercent || 20}% of the subject.

Full syllabus:\n${unitSummary}

Generate a CRASH REVISION strategy. Be brutal about what to skip. Be smart about what to prioritize.
Use an urgent, Gen-Z friendly tone in motivation tips.
Respond ONLY with valid JSON, no markdown:
{
  "summary": "2-sentence brutally honest assessment and plan",
  "mustDo": [
    {
      "topic": "topic name",
      "unit": "Unit X",
      "priority": "CRITICAL|HIGH",
      "reason": "why this topic is high-value for exam",
      "timeNeeded": number_minutes,
      "quickTip": "1 sentence on HOW to study this super fast"
    }
  ],
  "skip": [
    {
      "topic": "topic name",
      "unit": "Unit X",
      "reason": "why skipping this is smart right now"
    }
  ],
  "schedule": [
    {
      "slot": "9:00 PM",
      "activity": "activity name",
      "duration": number_minutes,
      "type": "study|break|revision",
      "tip": "quick motivational/tactical tip"
    }
  ],
  "emergencyTips": ["Gen-Z tip 1", "tip 2", "tip 3", "tip 4"],
  "survivalMode": true
}`;

    const clean = await askGemini(prompt);
    const plan  = JSON.parse(clean);

    await query(
      `INSERT INTO study_plans (student_id, plan_type, subject_ids, plan_data) VALUES ($1,'crash',$2,$3)`,
      [req.user.id, [subjectId], JSON.stringify(plan)]
    );

    await awardBadge(req.user.id, "night_before");
    await createNotification(
      req.user.id, "crash",
      "🌙 Crash plan locked in!",
      `${subject.name} crash strategy ready. You got ${hoursAvailable}h — let's goooo ⚡`,
      "/study-mode"
    );

    res.json({ plan, subject: { id: subject.id, name: subject.name, icon: subject.icon } });
  } catch (err) {
    if (err instanceof SyntaxError) return res.status(500).json({ error: "AI parsing failed. Retry." });
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/plans ─────────────────────────────────────────────────────────
router.get("/plans", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, plan_type, subject_ids, plan_data, created_at
       FROM study_plans WHERE student_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
