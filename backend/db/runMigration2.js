// Run: node db/runMigration2.js
// This applies the v4 migration (Syllabus Sheet Tracker tables)

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate2.sql"), "utf-8");

console.log("Running StudyHub v4 migration (Syllabus Sheet Tracker)...\n");

try {
  await pool.query(sql);
  console.log("✅ Migration complete!\n");
  console.log("Changes applied:");
  console.log("  • syllabus_sheets table");
  console.log("  • sheet_topic_status table");
  console.log("  • Performance indexes\n");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
