import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

// GET /api/dsa/progress — get all DSA problem statuses for logged-in student
router.get("/progress", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT problem_id, status, starred FROM dsa_progress WHERE student_id = $1`,
      [req.user.id]
    );
    // Return as a map: { problem_id: { status, starred } }
    const progress = {};
    for (const r of rows) progress[r.problem_id] = { status: r.status, starred: r.starred };
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/dsa/progress/:problemId — upsert a problem's status/starred
router.patch("/progress/:problemId", async (req, res) => {
  const { status, starred } = req.body;
  const { problemId } = req.params;
  try {
    await query(
      `INSERT INTO dsa_progress (student_id, problem_id, status, starred, updated_at)
       VALUES ($1, $2, COALESCE($3, 'pending'), COALESCE($4, false), NOW())
       ON CONFLICT (student_id, problem_id) DO UPDATE SET
         status     = CASE WHEN $3 IS NOT NULL THEN $3 ELSE dsa_progress.status END,
         starred    = CASE WHEN $4 IS NOT NULL THEN $4 ELSE dsa_progress.starred END,
         updated_at = NOW()`,
      [req.user.id, problemId, status ?? null, starred ?? null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
