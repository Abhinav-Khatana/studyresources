import express       from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit     from "express-rate-limit";
import { query }     from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const ai     = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Retry helper: auto-retry on 429 with exponential backoff ─────────────────
async function callGemini(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const text = response.text || "";
      return text.replace(/```json\n?/gi, "").replace(/\n?```/g, "").trim();
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("quota") || err?.message?.includes("Too Many");
      if (isRateLimit && attempt < retries) {
        const waitMs = attempt * 6000;
        console.log(`[Gemini] Rate limit hit — retry ${attempt}/${retries - 1} in ${waitMs / 1000}s`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw err;
      }
    }
  }
}

// ── Rate limiter (shared with AI routes: 5 parses per 15 min per user) ─────────
const parseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || "anon",
  validate: { xForwardedForHeader: false },
  handler: (_, res) =>
    res.status(429).json({ error: "Too many parse requests — wait 15 minutes and try again 😅" }),
});

// Apply auth to all routes
router.use(authenticate);

// ── POST /api/syllabus/parse — AI-parse raw syllabus text ─────────────────────
router.post("/parse", parseLimiter, async (req, res) => {
  const { rawSyllabus, title } = req.body;
  if (!rawSyllabus || rawSyllabus.trim().length < 10)
    return res.status(400).json({ error: "Please provide a valid syllabus (at least 10 characters)." });

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith("your_"))
    return res.status(503).json({ error: "GEMINI_API_KEY is not configured in backend/.env. Get a free key at https://aistudio.google.com" });

  try {
    const prompt = `You are a CS education expert. Parse the following syllabus or topic list into a structured JSON study tracker.
Return ONLY valid JSON — no markdown fences, no explanation, just raw JSON.

Required JSON structure:
{
  "title": "short descriptive title",
  "sections": [
    {
      "id": "sec-1",
      "title": "Section Title",
      "topics": [
        {
          "id": "t-1-1",
          "title": "Topic Name",
          "difficulty": "Easy",
          "key_points": ["what this concept does", "time/space complexity or key formula", "exam tip or common mistake"],
          "yt_url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
          "gfg_url": "https://www.geeksforgeeks.org/article-slug/",
          "lc_url": "https://leetcode.com/problems/problem-slug/"
        }
      ]
    }
  ]
}

Rules:
- Group into logical sections; split broad topics into specific sub-topics (e.g. "Sorting" → "Bubble Sort", "Merge Sort", "Quick Sort")
- Difficulty: Easy / Medium / Hard
- Sequential IDs: sec-1, sec-2... and t-1-1, t-1-2...
- key_points: EXACTLY 2-3 short bullets — concept definition, complexity/formula, and exam tip
- yt_url: DIRECT video URL https://www.youtube.com/watch?v=VIDEO_ID from top educators:
    DSA → Striver (TakeUForward) or NeetCode
    Theory (OS/CN/DBMS/TOC) → Neso Academy or Gate Smashers
    If unsure of exact ID → https://www.youtube.com/results?search_query=striver+TOPICNAME+explained
- gfg_url: DIRECT GFG article URL. If unsure → https://www.geeksforgeeks.org/search/?q=TOPICNAME
- lc_url: DIRECT LeetCode problem URL if applicable, else null
${title ? `Title hint: ${title}` : ""}

Syllabus to parse:
${rawSyllabus.slice(0, 8000)}`;


    const text = await callGemini(prompt);
    const parsed = JSON.parse(text);

    if (!parsed.sections || !Array.isArray(parsed.sections))
      return res.status(500).json({ error: "AI returned an unexpected format. Try again." });

    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError)
      return res.status(500).json({ error: "AI response couldn't be parsed. Please try again." });
    const isQuota = err?.message?.includes("429") || err?.message?.includes("quota") || err?.message?.includes("Too Many");
    if (isQuota)
      return res.status(429).json({ error: "Gemini free-tier limit reached. Please wait 60 seconds and try again." });
    res.status(500).json({ error: "Parse failed: " + err.message });
  }
});

// ── GET /api/syllabus — list student's saved sheets ───────────────────────────
router.get("/", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, title, created_at,
              jsonb_array_length(sheet_data->'sections') AS section_count,
              (SELECT COUNT(*) FROM jsonb_array_elements(sheet_data->'sections') s,
               jsonb_array_elements(s->'topics') t)::int AS topic_count
       FROM syllabus_sheets WHERE student_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/syllabus — save a parsed sheet ──────────────────────────────────
router.post("/", async (req, res) => {
  const { title, rawSyllabus, sheetData } = req.body;
  if (!title || !sheetData)
    return res.status(400).json({ error: "Title and sheet data are required." });

  try {
    const { rows } = await query(
      `INSERT INTO syllabus_sheets (student_id, title, raw_syllabus, sheet_data)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, raw_syllabus, sheet_data, created_at`,
      [req.user.id, title.trim(), rawSyllabus || null, JSON.stringify(sheetData)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/syllabus/:id — get sheet + topic statuses ────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { rows: sheetRows } = await query(
      `SELECT id, title, raw_syllabus, sheet_data, created_at
       FROM syllabus_sheets WHERE id = $1 AND student_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!sheetRows.length)
      return res.status(404).json({ error: "Sheet not found" });

    const { rows: statusRows } = await query(
      `SELECT topic_id, status, note, starred
       FROM sheet_topic_status WHERE sheet_id = $1 AND student_id = $2`,
      [req.params.id, req.user.id]
    );

    const topicStatuses = {};
    for (const s of statusRows) {
      topicStatuses[s.topic_id] = {
        status:  s.status,
        note:    s.note,
        starred: s.starred,
      };
    }

    res.json({ ...sheetRows[0], topicStatuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/syllabus/:id/topic/:topicId — update topic status/note/star ───
router.patch("/:id/topic/:topicId", async (req, res) => {
  const { status, note, starred } = req.body;
  try {
    await query(
      `INSERT INTO sheet_topic_status (student_id, sheet_id, topic_id, status, note, starred, updated_at)
       VALUES ($1, $2, $3,
         COALESCE($4, 'pending'),
         $5,
         COALESCE($6, false),
         NOW()
       )
       ON CONFLICT (student_id, sheet_id, topic_id) DO UPDATE SET
         status     = CASE WHEN $4 IS NOT NULL THEN $4 ELSE sheet_topic_status.status END,
         note       = CASE WHEN $5 IS NOT NULL THEN $5 ELSE sheet_topic_status.note  END,
         starred    = CASE WHEN $6 IS NOT NULL THEN $6 ELSE sheet_topic_status.starred END,
         updated_at = NOW()`,
      [
        req.user.id,
        req.params.id,
        req.params.topicId,
        status   ?? null,
        note     ?? null,
        starred  ?? null,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/syllabus/:id — delete a sheet ─────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM syllabus_sheets WHERE id = $1 AND student_id = $2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0)
      return res.status(404).json({ error: "Sheet not found" });
    res.json({ message: "Sheet deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
