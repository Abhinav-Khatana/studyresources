import express from "express";
import { query } from "../db/index.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/exams  — upcoming exam dates
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT e.*, s.name AS subject_name, s.icon AS subject_icon, s.color AS subject_color,
              (e.exam_date - CURRENT_DATE)::int AS days_left
       FROM exam_dates e
       JOIN subjects s ON s.id = e.subject_id
       WHERE e.exam_date >= CURRENT_DATE
       ORDER BY e.exam_date ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exams  — set exam date (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { subjectId, examDate, academicYear, notes } = req.body;
  if (!subjectId || !examDate)
    return res.status(400).json({ error: "Subject and exam date required" });
  try {
    const { rows } = await query(
      `INSERT INTO exam_dates (subject_id, exam_date, academic_year, notes)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [subjectId, examDate, academicYear || null, notes || null]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/exams/:id  (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await query(`DELETE FROM exam_dates WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
