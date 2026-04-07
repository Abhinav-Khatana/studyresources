import express from "express";
import { query, computeStreak, computeTotalPoints } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/leaderboard
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows: students } = await query(
      `SELECT id, name, avatar, batch FROM students WHERE role='student' ORDER BY id`
    );

    const board = await Promise.all(
      students.map(async (s) => {
        const [streak, totalPoints, minsRes, resourcesRes] = await Promise.all([
          computeStreak(s.id),
          computeTotalPoints(s.id),
          query(`SELECT COALESCE(SUM(minutes),0)::int AS total FROM study_logs WHERE student_id=$1`, [s.id]),
          query(`SELECT COUNT(*)::int AS cnt FROM completed_resources WHERE student_id=$1`, [s.id]),
        ]);
        return {
          ...s,
          streak,
          totalPoints,
          totalMinutes:       minsRes.rows[0].total,
          resourcesCompleted: resourcesRes.rows[0].cnt,
        };
      })
    );

    const ranked = board
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
