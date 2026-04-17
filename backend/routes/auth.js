import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { createNotification } from "../services/push.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

function createToken(student) {
  return jwt.sign(
    { id: student.id, name: student.name, role: student.role },
    process.env.JWT_SECRET || "fallback",
    { expiresIn: "7d" }
  );
}

function sanitizeStudent(row) {
  const { password_hash, ...safe } = row;
  return safe;
}

function makeAvatar(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ST";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

async function generateStudentId() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `STU${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;
    const { rows } = await query(`SELECT 1 FROM students WHERE id = $1`, [candidate]);
    if (!rows.length) return candidate;
  }
  return `STU${Date.now().toString().slice(-9)}`;
}

router.post("/register", async (req, res) => {
  const { studentId, name, email, password, branch, semester } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email, and password are required" });

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email))
    return res.status(400).json({ error: "Invalid email address" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const uid = studentId?.trim() ? studentId.toUpperCase().trim() : await generateStudentId();
    const { rows: dupe } = await query(
      `SELECT id FROM students WHERE id = $1 OR email = $2`,
      [uid, email.toLowerCase()]
    );
    if (dupe.length > 0)
      return res.status(409).json({ error: "This email is already registered. Try signing in instead." });

    const hash = await bcrypt.hash(password, 10);
    const avatar = makeAvatar(name);

    const { rows } = await query(
      `INSERT INTO students (
         id, name, email, password_hash, branch, semester, avatar, batch, role, auth_provider
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'student', 'email')
       RETURNING id, name, email, batch, semester, cgpa, branch, avatar, role, auth_provider, linkedin, website, bio, github`,
      [uid, name.trim(), email.toLowerCase(), hash, branch || "General", parseInt(semester) || 1, avatar, new Date().getFullYear().toString()]
    );

    const student = sanitizeStudent(rows[0]);
    const token = createToken(student);

    await createNotification(
      student.id,
      "welcome",
      "Welcome to StudyHub",
      `Hey ${student.name.split(" ")[0]}! Your exam-prep workspace is ready.`,
      "/dashboard",
      false
    );

    res.status(201).json({ token, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const identifier = String(req.body.identifier || req.body.studentId || "").trim();
  const password = String(req.body.password || "");
  if (!identifier || !password)
    return res.status(400).json({ error: "Email or student ID and password are required" });

  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, batch, semester, cgpa, branch, avatar, role,
              auth_provider, linkedin, website, bio, github
       FROM students
       WHERE LOWER(email) = $1 OR id = $2
       LIMIT 1`,
      [identifier.toLowerCase(), identifier.toUpperCase()]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid login credentials" });

    const student = rows[0];
    if (!student.password_hash) {
      return res.status(400).json({ error: "This account uses Google sign in. Continue with Google instead." });
    }

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid login credentials" });

    const safe = sanitizeStudent(student);
    const token = createToken(safe);
    res.json({ token, student: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/google", async (req, res) => {
  const idToken = String(req.body.idToken || "").trim();
  if (!idToken) return res.status(400).json({ error: "Google sign-in token is required" });
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: "Google sign in is not configured yet" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: "Google did not return a valid email for this account" });

    const email = payload.email.toLowerCase();
    const providerUserId = payload.sub;
    const displayName = payload.name || email.split("@")[0];

    let student;
    const { rows: existing } = await query(
      `SELECT id, name, email, password_hash, batch, semester, cgpa, branch, avatar, role,
              auth_provider, provider_user_id, linkedin, website, bio, github
       FROM students
       WHERE LOWER(email) = $1 OR (auth_provider = 'google' AND provider_user_id = $2)
       LIMIT 1`,
      [email, providerUserId]
    );

    if (existing.length) {
      const { rows } = await query(
        `UPDATE students
         SET name = COALESCE($1, name),
             email = $2,
             auth_provider = 'google',
             provider_user_id = $3,
             google_email_verified = $4,
             avatar = COALESCE(avatar, $5)
         WHERE id = $6
         RETURNING id, name, email, password_hash, batch, semester, cgpa, branch, avatar, role,
                   auth_provider, provider_user_id, linkedin, website, bio, github`,
        [displayName, email, providerUserId, Boolean(payload.email_verified), makeAvatar(displayName), existing[0].id]
      );
      student = sanitizeStudent(rows[0]);
    } else {
      const uid = await generateStudentId();
      const { rows } = await query(
        `INSERT INTO students (
          id, name, email, password_hash, branch, semester, avatar, batch, role,
          auth_provider, provider_user_id, google_email_verified
        )
        VALUES ($1, $2, $3, NULL, 'General', 1, $4, $5, 'student', 'google', $6, $7)
        RETURNING id, name, email, password_hash, batch, semester, cgpa, branch, avatar, role,
                  auth_provider, provider_user_id, linkedin, website, bio, github`,
        [uid, displayName, email, makeAvatar(displayName), new Date().getFullYear().toString(), providerUserId, Boolean(payload.email_verified)]
      );
      student = sanitizeStudent(rows[0]);
      await createNotification(
        student.id,
        "welcome",
        "Welcome to StudyHub",
        `You're in, ${displayName.split(" ")[0]}. Your exam-prep workspace is ready.`,
        "/dashboard",
        false
      );
    }

    const token = createToken(student);
    res.json({ token, student });
  } catch {
    res.status(401).json({ error: "Google sign in could not be verified" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, batch, semester, cgpa, branch, avatar, role, bio, github,
              linkedin, website, auth_provider
       FROM students WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/profile", authenticate, async (req, res) => {
  const { name, bio, github, linkedin, website, cgpa, semester } = req.body;
  try {
    const { rows } = await query(
      `UPDATE students SET
         name     = COALESCE($1, name),
         bio      = COALESCE($2, bio),
         github   = COALESCE($3, github),
         linkedin = COALESCE($4, linkedin),
         website  = COALESCE($5, website),
         cgpa     = COALESCE($6, cgpa),
         semester = COALESCE($7, semester)
       WHERE id = $8
       RETURNING id, name, email, batch, semester, cgpa, branch, avatar, role, bio, github, linkedin, website, auth_provider`,
      [name || null, bio || null, github || null, linkedin || null, website || null, cgpa || null, semester || null, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/avatar", authenticate, async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: "Avatar required" });
  try {
    const { rows } = await query(
      `UPDATE students SET avatar = $1 WHERE id = $2 RETURNING avatar`,
      [avatar, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Both passwords required" });
  if (newPassword.length < 6)
    return res.status(400).json({ error: "New password must be at least 6 characters" });

  try {
    const { rows } = await query(`SELECT password_hash FROM students WHERE id = $1`, [req.user.id]);
    if (!rows[0]?.password_hash) {
      return res.status(400).json({ error: "This account does not use password login yet." });
    }
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE students SET password_hash = $1 WHERE id = $2`, [hash, req.user.id]);
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
