import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/roadmap  — generate + save roadmap
router.post("/roadmap", authenticate, async (req, res) => {
  const { subjectId, examDate, effortLevel, cgpa, knowledgePercent } = req.body;
  if (!subjectId || !examDate || !effortLevel || cgpa === undefined || knowledgePercent === undefined)
    return res.status(400).json({ error: "All fields required" });

  try {
    // Get subject + units from DB
    const { rows: subRows } = await query(`SELECT * FROM subjects WHERE id=$1`, [subjectId]);
    if (subRows.length === 0) return res.status(404).json({ error: "Subject not found" });
    const subject = subRows[0];

    const { rows: units } = await query(
      `SELECT u.unit_number, u.title, ARRAY_AGG(t.topic ORDER BY t.position) AS topics
       FROM units u LEFT JOIN unit_topics t ON t.unit_id=u.id
       WHERE u.subject_id=$1 GROUP BY u.id ORDER BY u.unit_number`,
      [subjectId]
    );

    const daysLeft = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / 86400000));
    const unitSummary = units.map(u => `Unit ${u.unit_number}: ${u.title} [${(u.topics||[]).join(", ")}]`).join("\n");

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

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const clean = msg.content[0].text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
    const roadmap = JSON.parse(clean);

    // Save to DB
    const { rows: saved } = await query(
      `INSERT INTO saved_roadmaps (student_id, subject_id, exam_date, effort_level, cgpa, knowledge_pct, roadmap_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
      [req.user.id, subjectId, examDate, effortLevel, cgpa, knowledgePercent, JSON.stringify(roadmap)]
    );

    res.json({
      roadmap,
      savedId: saved[0].id,
      subject: { id: subject.id, name: subject.name, code: subject.code },
      daysLeft,
    });
  } catch (err) {
    if (err instanceof SyntaxError)
      return res.status(500).json({ error: "AI response parsing failed. Try again." });
    res.status(500).json({ error: "Failed to generate roadmap", details: err.message });
  }
});

// GET /api/ai/roadmaps  — all saved roadmaps for current user
router.get("/roadmaps", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.id, r.exam_date::text, r.effort_level, r.cgpa, r.knowledge_pct,
              r.created_at, r.roadmap_data,
              s.name AS subject_name, s.icon AS subject_icon, s.id AS subject_id
       FROM saved_roadmaps r
       JOIN subjects s ON s.id = r.subject_id
       WHERE r.student_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/roadmaps/:id  — single saved roadmap
router.get("/roadmaps/:id", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, s.name AS subject_name, s.icon AS subject_icon
       FROM saved_roadmaps r JOIN subjects s ON s.id=r.subject_id
       WHERE r.id=$1 AND r.student_id=$2`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Roadmap not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/ai/roadmaps/:id
router.delete("/roadmaps/:id", authenticate, async (req, res) => {
  try {
    await query(`DELETE FROM saved_roadmaps WHERE id=$1 AND student_id=$2`, [req.params.id, req.user.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
