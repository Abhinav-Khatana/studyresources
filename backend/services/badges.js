import { query } from "../db/index.js";
import { createNotification } from "./push.js";

/**
 * Badge conditions — each badge has a SQL query that returns { eligible: boolean }
 * and an optional push notification message.
 */
const BADGE_CHECKS = [
  {
    id: "first_fire",
    sql: `SELECT (COUNT(*) >= 1) AS eligible FROM completed_resources WHERE student_id = $1`,
    push: { title: "🔥 Badge Unlocked!", body: "First Flame — you completed your first resource fr fr 🔥" },
  },
  {
    id: "bookworm",
    sql: `SELECT (COUNT(*) >= 10) AS eligible FROM completed_resources WHERE student_id = $1`,
    push: { title: "📚 Badge Unlocked!", body: "Bookworm — 10 resources? You're built different 📚" },
  },
  {
    id: "scholar",
    sql: `SELECT (COUNT(*) >= 25) AS eligible FROM completed_resources WHERE student_id = $1`,
    push: { title: "🎓 Badge Unlocked!", body: "Scholar — 25 resources done. Top tier grind 🎓" },
  },
  {
    id: "week_warrior",
    // streak computed separately — we pass it as a parameter
    sql: null,
    checkFn: async (studentId) => {
      const { rows } = await query(
        `SELECT log_date::text FROM study_logs WHERE student_id = $1 ORDER BY log_date DESC LIMIT 7`,
        [studentId]
      );
      return rows.length >= 7;
    },
    push: { title: "🎯 Badge Unlocked!", body: "Week Warrior — 7 days straight! You're on a mission 🎯" },
  },
  {
    id: "speed_runner",
    sql: `SELECT (COUNT(*) >= 5) AS eligible
          FROM completed_resources
          WHERE student_id = $1
            AND completed_at >= NOW() - INTERVAL '1 day'`,
    push: { title: "⚡ Badge Unlocked!", body: "Speed Runner — 5 resources in one day?? insane fr ⚡" },
  },
  {
    id: "centurion",
    sql: `SELECT (COALESCE(SUM(minutes), 0) >= 6000) AS eligible
          FROM study_logs WHERE student_id = $1`,
    push: { title: "💯 Badge Unlocked!", body: "Centurion — 100 hours studied. Absolute legend 💯" },
  },
  {
    id: "night_owl",
    sql: null,
    checkFn: async (studentId) => {
      const hour = new Date().getHours();
      if (hour < 22) return false; // Only check if it's 10 PM or later
      const { rows } = await query(
        `SELECT COUNT(*) FROM study_logs WHERE student_id = $1 AND log_date = CURRENT_DATE`,
        [studentId]
      );
      return parseInt(rows[0].count) > 0;
    },
    push: { title: "🦉 Badge Unlocked!", body: "Night Owl — burning the midnight oil. respect 🦉" },
  },

  // ── Previously missing: now implemented ──────────────────────────────────────
  {
    id: "dedicated",
    sql: null,
    checkFn: async (studentId) => {
      // Check if the student has logged study on every one of the last 30 days
      const { rows } = await query(
        `SELECT COUNT(DISTINCT log_date)::int AS cnt
         FROM study_logs
         WHERE student_id = $1
           AND log_date >= CURRENT_DATE - INTERVAL '29 days'
           AND log_date <= CURRENT_DATE`,
        [studentId]
      );
      return parseInt(rows[0].cnt) >= 30;
    },
    push: { title: "👑 Badge Unlocked!", body: "Dedicated — 30 days straight! You're an absolute legend 👑" },
  },

  {
    id: "top3",
    sql: null,
    checkFn: async (studentId) => {
      // Check if this student is in the top-3 by points (completed resources × 10)
      const { rows } = await query(
        `SELECT student_id
         FROM (
           SELECT student_id, COUNT(*) * 10 AS points
           FROM completed_resources
           GROUP BY student_id
           ORDER BY points DESC
           LIMIT 3
         ) top3
         WHERE student_id = $1`,
        [studentId]
      );
      return rows.length > 0;
    },
    push: { title: "🏆 Badge Unlocked!", body: "Elite — Top 3 on the leaderboard! You're built different 🏆" },
  },
];

/**
 * Check all badges and award any that are newly earned.
 * Call this after resource completions, study logs, roadmap generation, etc.
 */
export async function checkAndAwardBadges(studentId) {
  try {
    // Get already-earned badges
    const { rows: earned } = await query(
      `SELECT badge_id FROM student_badges WHERE student_id = $1`,
      [studentId]
    );
    const earnedIds = new Set(earned.map((r) => r.badge_id));

    for (const badge of BADGE_CHECKS) {
      if (earnedIds.has(badge.id)) continue; // already earned

      let eligible = false;

      if (badge.sql) {
        const { rows } = await query(badge.sql, [studentId]);
        eligible = rows[0]?.eligible === true || rows[0]?.eligible === "t";
      } else if (badge.checkFn) {
        eligible = await badge.checkFn(studentId);
      }

      if (eligible) {
        await query(
          `INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [studentId, badge.id]
        );
        if (badge.push) {
          await createNotification(
            studentId,
            "badge",
            badge.push.title,
            badge.push.body,
            "/profile"
          );
        }
      }
    }
  } catch (err) {
    console.error("checkAndAwardBadges error:", err.message);
  }
}

/**
 * Award a specific badge manually (e.g. ai_explorer after roadmap generation)
 */
export async function awardBadge(studentId, badgeId) {
  try {
    const { rows: already } = await query(
      `SELECT 1 FROM student_badges WHERE student_id = $1 AND badge_id = $2`,
      [studentId, badgeId]
    );
    if (already.length > 0) return;

    await query(
      `INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [studentId, badgeId]
    );

    const { rows } = await query(`SELECT * FROM badges WHERE id = $1`, [badgeId]);
    const badge = rows[0];
    if (badge) {
      await createNotification(
        studentId,
        "badge",
        `${badge.icon} Badge Unlocked: ${badge.name}!`,
        badge.description,
        "/profile"
      );
    }
  } catch (err) {
    console.error("awardBadge error:", err.message);
  }
}
