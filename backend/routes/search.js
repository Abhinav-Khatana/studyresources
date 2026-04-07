import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/search?q=merge+sort&type=videos&subject=daa
router.get("/", authenticate, async (req, res) => {
  const { q, type, subject } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ error: "Query must be at least 2 characters" });

  try {
    // Build dynamic query
    const conditions = [`r.title ILIKE $1`];
    const params     = [`%${q.trim()}%`];
    let   idx        = 2;

    if (type) {
      conditions.push(`r.type = $${idx++}`);
      params.push(type);
    }
    if (subject) {
      conditions.push(`s.id = $${idx++}`);
      params.push(subject);
    }

    const { rows } = await query(
      `SELECT r.*,
              u.title AS unit_title, u.unit_number,
              s.name  AS subject_name, s.id AS subject_id, s.icon AS subject_icon,
              COALESCE(SUM(v.vote), 0)::int AS vote_score
       FROM resources r
       JOIN units    u ON u.id = r.unit_id
       JOIN subjects s ON s.id = u.subject_id
       LEFT JOIN resource_votes v ON v.resource_id = r.id
       WHERE ${conditions.join(" AND ")}
       GROUP BY r.id, u.title, u.unit_number, s.name, s.id, s.icon
       ORDER BY vote_score DESC, r.created_at DESC
       LIMIT 30`,
      params
    );
    res.json({ results: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
