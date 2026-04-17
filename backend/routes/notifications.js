import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { vapidPublicKey } from "../services/push.js";

const router = express.Router();

// GET /api/notifications — last 50 for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE student_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE student_id = $1 AND is_read = false`,
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read/:id
router.post("/read/:id", authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND student_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all
router.post("/read-all", authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE notifications SET is_read = true WHERE student_id = $1 AND is_read = false`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/push-subscribe — save browser push subscription
router.post("/push-subscribe", authenticate, async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: "Subscription required" });
  try {
    await query(
      `UPDATE students SET push_subscription = $1 WHERE id = $2`,
      [JSON.stringify(subscription), req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/vapid-key — public key for browser to subscribe
router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: vapidPublicKey });
});

export default router;
