import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

function resolveSslConfig() {
  const sslMode = String(process.env.DB_SSL || process.env.PGSSLMODE || "").toLowerCase();
  if (!sslMode || ["false", "0", "disable"].includes(sslMode)) return false;
  return { rejectUnauthorized: !["allow", "prefer", "require", "no-verify"].includes(sslMode) };
}

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSslConfig(),
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || "10000", 10),
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "studyhub",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: resolveSslConfig(),
    max: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || "10000", 10),
  };
}

// ── Connection pool ───────────────────────────────────────────────────────────
// All routes import { query } from here. If you ever swap DBs, only this file changes.
const pool = new Pool(buildPoolConfig());

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
// Simple query wrapper
export const query = (text, params) => pool.query(text, params);

// Transaction helper — use when you need multiple queries to succeed or fail together
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── Computed helpers (called from multiple routes) ────────────────────────────

// Compute streak: count consecutive days backwards from today
export async function computeStreak(studentId) {
  const { rows } = await query(
    `SELECT log_date::text FROM study_logs
     WHERE student_id = $1
     ORDER BY log_date DESC`,
    [studentId]
  );
  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const logDate = new Date(rows[i].log_date);
    logDate.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);

    if (logDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      // Allow one gap for today not yet logged
      if (i === 0) {
        expected.setDate(expected.getDate() - 1);
        if (logDate.getTime() === expected.getTime()) {
          streak++;
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

// Compute subject progress: completed resources / total resources * 100
export async function computeSubjectProgress(studentId, subjectId) {
  const [totalRes, completedRes] = await Promise.all([
    query(
      `SELECT COUNT(*) FROM resources r
       JOIN units u ON r.unit_id = u.id
       WHERE u.subject_id = $1`,
      [subjectId]
    ),
    query(
      `SELECT COUNT(*) FROM completed_resources cr
       JOIN resources r ON cr.resource_id = r.id
       JOIN units u ON r.unit_id = u.id
       WHERE cr.student_id = $1 AND u.subject_id = $2`,
      [studentId, subjectId]
    ),
  ]);

  const total     = parseInt(totalRes.rows[0].count);
  const completed = parseInt(completedRes.rows[0].count);
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Compute total points: minutes studied + (resources completed * 10)
export async function computeTotalPoints(studentId) {
  const [studyRes, resourceRes] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(minutes), 0) as total FROM study_logs WHERE student_id = $1`,
      [studentId]
    ),
    query(
      `SELECT COUNT(*) * 10 as points FROM completed_resources WHERE student_id = $1`,
      [studentId]
    ),
  ]);
  return parseInt(studyRes.rows[0].total) + parseInt(resourceRes.rows[0].points);
}

export default pool;
