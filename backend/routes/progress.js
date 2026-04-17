import express from "express";
import { query, computeStreak, computeSubjectProgress, computeTotalPoints } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { checkAndAwardBadges } from "../services/badges.js";

const router = express.Router();

// GET /api/progress/me  — full progress for current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const sid = req.user.id;

    // Study log (last 6 months for heatmap)
    const { rows: logRows } = await query(
      `SELECT log_date::text, minutes FROM study_logs
       WHERE student_id=$1 AND log_date >= NOW() - INTERVAL '6 months'
       ORDER BY log_date`,
      [sid]
    );
    const studyLog = {};
    for (const row of logRows) studyLog[row.log_date] = parseInt(row.minutes);

    // Completed resources
    const { rows: cRows } = await query(
      `SELECT resource_id FROM completed_resources WHERE student_id=$1`,
      [sid]
    );
    const completedResources = cRows.map(r => r.resource_id);

    // Subject progress — computed dynamically
    const { rows: subjects } = await query(`SELECT id FROM subjects`);
    const subjectProgress = {};
    for (const s of subjects) {
      subjectProgress[s.id] = await computeSubjectProgress(sid, s.id);
    }

    // Stats
    const [streak, totalPoints, totalMinsRes] = await Promise.all([
      computeStreak(sid),
      computeTotalPoints(sid),
      query(`SELECT COALESCE(SUM(minutes),0)::int AS total FROM study_logs WHERE student_id=$1`, [sid]),
    ]);

    res.json({
      studyLog,
      completedResources,
      subjectProgress,
      totalPoints,
      streak,
      totalMinutes: totalMinsRes.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/log  — log study minutes for today
router.post("/log", authenticate, async (req, res) => {
  const { minutes } = req.body;
  if (!minutes || parseInt(minutes) <= 0)
    return res.status(400).json({ error: "Valid minutes required" });

  try {
    const today = new Date().toISOString().split("T")[0];
    await query(
      `INSERT INTO study_logs (student_id, log_date, minutes)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, log_date)
       DO UPDATE SET minutes = study_logs.minutes + $3`,
      [req.user.id, today, parseInt(minutes)]
    );
    const { rows } = await query(
      `SELECT minutes FROM study_logs WHERE student_id=$1 AND log_date=$2`,
      [req.user.id, today]
    );
    // Fire badge checks async (don't block response)
    checkAndAwardBadges(req.user.id).catch(() => {});
    res.json({ message: "Study logged", totalToday: rows[0]?.minutes || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/complete  — mark a resource as completed
router.post("/complete", authenticate, async (req, res) => {
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ error: "Resource ID required" });

  try {
    await query(
      `INSERT INTO completed_resources (student_id, resource_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, resourceId]
    );
    // Fire badge checks async
    checkAndAwardBadges(req.user.id).catch(() => {});
    const { rows } = await query(
      `SELECT resource_id FROM completed_resources WHERE student_id=$1`,
      [req.user.id]
    );
    res.json({ completed: rows.map(r => r.resource_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/progress/complete/:resourceId  — undo completion
router.delete("/complete/:resourceId", authenticate, async (req, res) => {
  try {
    await query(
      `DELETE FROM completed_resources WHERE student_id=$1 AND resource_id=$2`,
      [req.user.id, req.params.resourceId]
    );
    res.json({ message: "Unmarked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
