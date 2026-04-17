import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/leaderboard — optimized query with fallback
router.get("/", authenticate, async (req, res) => {
  try {
    // Simple, reliable leaderboard query
    const { rows: students } = await query(
      `SELECT id, name, avatar, batch FROM students WHERE role='student' ORDER BY id`
    );
    const board = await Promise.all(
      students.map(async (s) => {
        const [minsRes, crRes, streakRows] = await Promise.all([
          query(`SELECT COALESCE(SUM(minutes),0)::int AS total FROM study_logs WHERE student_id=$1`, [s.id]),
          query(`SELECT COUNT(*)::int AS cnt FROM completed_resources WHERE student_id=$1`, [s.id]),
          query(
            `SELECT log_date::text FROM study_logs WHERE student_id=$1 ORDER BY log_date DESC LIMIT 60`,
            [s.id]
          ),
        ]);
        const totalMinutes       = minsRes.rows[0].total;
        const resourcesCompleted = crRes.rows[0].cnt;
        const totalPoints        = totalMinutes + resourcesCompleted * 10;

        // Compute streak
        let streak = 0;
        const today = new Date(); today.setHours(0,0,0,0);
        for (let i = 0; i < streakRows.rows.length; i++) {
          const d = new Date(streakRows.rows[i].log_date); d.setHours(0,0,0,0);
          const exp = new Date(today); exp.setDate(exp.getDate() - i);
          if (d.getTime() === exp.getTime()) streak++;
          else if (i === 0) { exp.setDate(exp.getDate()-1); if(d.getTime()===exp.getTime()) { streak++; continue; } break; }
          else break;
        }
        return { ...s, totalMinutes, resourcesCompleted, totalPoints, streak };
      })
    );
    const ranked = board.sort((a,b) => b.totalPoints - a.totalPoints).map((s,i) => ({...s, rank: i+1}));
    res.json(ranked);
  } catch (err) {
    // Fallback to simpler query if subquery fails
    try {
      const { rows: students } = await query(
        `SELECT id, name, avatar, batch FROM students WHERE role='student' ORDER BY id`
      );
      const board = await Promise.all(
        students.map(async (s) => {
          const [minsRes, crRes] = await Promise.all([
            query(`SELECT COALESCE(SUM(minutes),0)::int AS total FROM study_logs WHERE student_id=$1`, [s.id]),
            query(`SELECT COUNT(*)::int AS cnt FROM completed_resources WHERE student_id=$1`, [s.id]),
          ]);
          const totalMinutes     = minsRes.rows[0].total;
          const resourcesCompleted = crRes.rows[0].cnt;
          const totalPoints      = totalMinutes + resourcesCompleted * 10;
          return { ...s, totalMinutes, resourcesCompleted, totalPoints, streak: 0 };
        })
      );
      const ranked = board.sort((a, b) => b.totalPoints - a.totalPoints).map((s, i) => ({ ...s, rank: i + 1 }));
      res.json(ranked);
    } catch (fallbackErr) {
      res.status(500).json({ error: fallbackErr.message });
    }
  }
});

export default router;
