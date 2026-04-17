// Run: node db/runMigration.js
// This applies the v3 migration using the existing DB connection pool

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(join(__dirname, "migrate.sql"), "utf-8");

console.log("Running StudyHub v3 migration...\n");

try {
  await pool.query(sql);
  console.log("✅ Migration complete! New tables and columns created successfully.\n");
  console.log("Changes applied:");
  console.log("  • students.email, bio, github, push_subscription columns");
  console.log("  • badges table + 12 badge definitions");
  console.log("  • student_badges table");
  console.log("  • notifications table");
  console.log("  • study_plans table");
  console.log("  • Performance indexes\n");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
