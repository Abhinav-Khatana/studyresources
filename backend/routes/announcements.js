import express from "express";
import { query } from "../db/index.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/announcements  — active announcements (not expired)
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT a.*, s.name AS created_by_name
       FROM announcements a
       LEFT JOIN students s ON s.id = a.created_by
       WHERE a.expires_at IS NULL OR a.expires_at > NOW()
       ORDER BY a.created_at DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements  — create (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { title, content, expiresAt } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  try {
    const { rows } = await query(
      `INSERT INTO announcements (title, content, created_by, expires_at)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [title, content || null, req.user.id, expiresAt || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/announcements/:id  — delete (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await query(`DELETE FROM announcements WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
