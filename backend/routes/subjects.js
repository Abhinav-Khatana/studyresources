import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/subjects  — list all subjects with unit count
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows: subjects } = await query(
      `SELECT s.*, COUNT(u.id)::int AS unit_count
       FROM subjects s
       LEFT JOIN units u ON u.subject_id = s.id
       GROUP BY s.id ORDER BY s.code`
    );

    // Attach unit list (id, title, topics only — no resources for list view)
    for (const sub of subjects) {
      const { rows: units } = await query(
        `SELECT u.id, u.unit_number AS "unitNumber", u.title,
                ARRAY_AGG(t.topic ORDER BY t.position) AS topics
         FROM units u
         LEFT JOIN unit_topics t ON t.unit_id = u.id
         WHERE u.subject_id = $1
         GROUP BY u.id ORDER BY u.unit_number`,
        [sub.id]
      );
      sub.units    = units;
      sub.unitCount = sub.unit_count;
    }
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subjects/:id  — full subject with all resources
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { rows: subRows } = await query(`SELECT * FROM subjects WHERE id=$1`, [req.params.id]);
    if (subRows.length === 0) return res.status(404).json({ error: "Subject not found" });

    const subject = subRows[0];

    const { rows: units } = await query(
      `SELECT u.id, u.unit_number AS "unitNumber", u.title,
              ARRAY_AGG(DISTINCT t.topic ORDER BY t.topic) AS topics
       FROM units u
       LEFT JOIN unit_topics t ON t.unit_id = u.id
       WHERE u.subject_id = $1
       GROUP BY u.id ORDER BY u.unit_number`,
      [subject.id]
    );

    // Attach resources per unit, grouped by type
    for (const unit of units) {
      const { rows: resources } = await query(
        `SELECT r.*,
                COALESCE(SUM(v.vote), 0)::int AS vote_score,
                COUNT(CASE WHEN v.vote=1 THEN 1 END)::int AS upvotes,
                COUNT(CASE WHEN v.vote=-1 THEN 1 END)::int AS downvotes
         FROM resources r
         LEFT JOIN resource_votes v ON v.resource_id = r.id
         WHERE r.unit_id = $1
         GROUP BY r.id ORDER BY r.created_at`,
        [unit.id]
      );

      unit.resources = {
        notes:    resources.filter(r => r.type === "notes"),
        videos:   resources.filter(r => r.type === "videos"),
        articles: resources.filter(r => r.type === "articles"),
        pyqs:     resources.filter(r => r.type === "pyqs"),
      };
    }

    subject.units = units;
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
