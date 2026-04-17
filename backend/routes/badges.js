import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/badges — all badges + earned/not-earned status for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT b.id, b.name, b.description, b.icon, b.category,
              (sb.student_id IS NOT NULL) AS earned,
              sb.earned_at
       FROM badges b
       LEFT JOIN student_badges sb ON sb.badge_id = b.id AND sb.student_id = $1
       ORDER BY earned DESC NULLS LAST, b.category, b.id`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
