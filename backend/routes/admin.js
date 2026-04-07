import express from "express";
import { query } from "../db/index.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Resources ─────────────────────────────────────────────────────────────────

// GET /api/admin/resources  — all resources with unit/subject info
router.get("/resources", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.title AS unit_title, u.unit_number, s.name AS subject_name, s.id AS subject_id
       FROM resources r
       JOIN units u ON u.id = r.unit_id
       JOIN subjects s ON s.id = u.subject_id
       ORDER BY s.code, u.unit_number, r.type, r.created_at`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/resources  — add a resource
router.post("/resources", async (req, res) => {
  const { unitId, type, title, url, uploadedBy, fileSize, duration, channel, readTime, year } = req.body;
  if (!unitId || !type || !title)
    return res.status(400).json({ error: "unitId, type, and title are required" });

  const validTypes = ["notes", "videos", "articles", "pyqs"];
  if (!validTypes.includes(type))
    return res.status(400).json({ error: `type must be one of: ${validTypes.join(", ")}` });

  try {
    // Generate a unique ID like "n-<timestamp>"
    const id = `${type[0]}-${Date.now()}`;
    const { rows } = await query(
      `INSERT INTO resources (id, unit_id, type, title, url, uploaded_by, file_size, duration, channel, read_time, year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, unitId, type, title, url || "#", uploadedBy || null, fileSize || null, duration || null, channel || null, readTime || null, year || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/resources/:id  — edit a resource
router.put("/resources/:id", async (req, res) => {
  const { title, url, uploadedBy, fileSize, duration, channel, readTime, year } = req.body;
  try {
    const { rows } = await query(
      `UPDATE resources SET
         title=$1, url=$2, uploaded_by=$3, file_size=$4,
         duration=$5, channel=$6, read_time=$7, year=$8
       WHERE id=$9 RETURNING *`,
      [title, url || "#", uploadedBy || null, fileSize || null, duration || null, channel || null, readTime || null, year || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Resource not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/resources/:id
router.delete("/resources/:id", async (req, res) => {
  try {
    await query(`DELETE FROM resources WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Units info (for the add resource form dropdown) ───────────────────────────
router.get("/units", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.unit_number, u.title, s.name AS subject_name, s.id AS subject_id
       FROM units u JOIN subjects s ON s.id=u.subject_id
       ORDER BY s.code, u.unit_number`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
