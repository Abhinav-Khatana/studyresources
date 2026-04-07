import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password)
    return res.status(400).json({ error: "Student ID and password required" });

  try {
    const { rows } = await query(
      `SELECT id, name, password_hash, batch, semester, cgpa, branch, avatar, role
       FROM students WHERE id = $1`,
      [studentId.toUpperCase()]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid student ID or password" });

    const student = rows[0];
    const valid   = await bcrypt.compare(password, student.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid student ID or password" });

    const token = jwt.sign(
      { id: student.id, name: student.name, role: student.role },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "7d" }
    );

    const { password_hash, ...safe } = student;
    res.json({ token, student: safe });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, batch, semester, cgpa, branch, avatar, role FROM students WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
