import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate3.sql"), "utf-8");

console.log("Running StudyHub v5 migration (Exam-first Prep Platform)...\n");

try {
  await pool.query(sql);
  console.log("✅ Migration complete!\n");
  console.log("Changes applied:");
  console.log("  • modern auth columns on students");
  console.log("  • prep_plans table");
  console.log("  • prep_plan_topic_status table");
  console.log("  • performance indexes\n");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
