import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/bookmarks  — all bookmarked resources for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, b.created_at AS bookmarked_at,
              u.title AS unit_title, u.unit_number,
              s.name AS subject_name, s.id AS subject_id, s.icon AS subject_icon,
              COALESCE(SUM(v.vote), 0)::int AS vote_score
       FROM bookmarks b
       JOIN resources r ON r.id = b.resource_id
       JOIN units u ON u.id = r.unit_id
       JOIN subjects s ON s.id = u.subject_id
       LEFT JOIN resource_votes v ON v.resource_id = r.id
       WHERE b.student_id = $1
       GROUP BY r.id, b.created_at, u.title, u.unit_number, s.name, s.id, s.icon
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookmarks  — add bookmark
router.post("/", authenticate, async (req, res) => {
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ error: "Resource ID required" });
  try {
    await query(
      `INSERT INTO bookmarks (student_id, resource_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [req.user.id, resourceId]
    );
    res.json({ message: "Bookmarked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookmarks/:resourceId  — remove bookmark
router.delete("/:resourceId", authenticate, async (req, res) => {
  try {
    await query(
      `DELETE FROM bookmarks WHERE student_id=$1 AND resource_id=$2`,
      [req.user.id, req.params.resourceId]
    );
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
