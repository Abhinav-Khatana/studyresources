import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "./index.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = await readFile(join(__dirname, "migrate4.sql"), "utf8");
  console.log("Running DSA progress migration...\n");
  await query(sql);

  console.log("✅ Migration 4 complete!\n");
  console.log("Changes applied:");
  console.log("  • dsa_progress table (student-level DSA problem tracking)");
  console.log("  • idx_dsa_progress_student index\n");
  process.exit(0);
}

run().catch((e) => { console.error("Migration 4 failed:", e.message); process.exit(1); });
