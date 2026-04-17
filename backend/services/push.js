import webpush from "web-push";
import { query } from "../db/index.js";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const hasPushConfig = Boolean(vapidPublicKey && vapidPrivateKey);

if (hasPushConfig) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "admin@studyhub.app"}`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

function normalizeSubscription(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export { hasPushConfig, vapidPublicKey };

/**
 * Send a browser push notification to a single student if they have a subscription.
 * Returns 'ok', 'no-sub', or 'expired'
 */
export async function sendPushToStudent(studentId, payload) {
  if (!hasPushConfig) return "no-config";

  try {
    const { rows } = await query(
      `SELECT push_subscription FROM students WHERE id = $1`,
      [studentId]
    );
    if (!rows[0]?.push_subscription) return "no-sub";

    const sub = normalizeSubscription(rows[0].push_subscription);
    if (!sub) return "no-sub";

    await webpush.sendNotification(sub, JSON.stringify(payload));
    return "ok";
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Expired subscription — clean it up
      await query(`UPDATE students SET push_subscription = NULL WHERE id = $1`, [studentId]);
      return "expired";
    }
    console.error("Push send error:", err.message);
    return "error";
  }
}

/**
 * Create an in-app notification record + optionally send a browser push.
 */
export async function createNotification(studentId, type, title, body, actionUrl = null, sendPush = true) {
  try {
    await query(
      `INSERT INTO notifications (student_id, type, title, body, action_url) VALUES ($1,$2,$3,$4,$5)`,
      [studentId, type, title, body, actionUrl]
    );
    if (sendPush && hasPushConfig) {
      await sendPushToStudent(studentId, { title, body, actionUrl });
    }
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
}
