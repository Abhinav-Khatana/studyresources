import express from "express";
import { query } from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// POST /api/votes  — cast or toggle vote  { resourceId, vote: 1 | -1 }
router.post("/", authenticate, async (req, res) => {
  const { resourceId, vote } = req.body;
  if (!resourceId || ![1, -1].includes(vote))
    return res.status(400).json({ error: "resourceId and vote (1 or -1) required" });

  try {
    // If same vote already exists → remove (toggle off). Otherwise upsert.
    const { rows: existing } = await query(
      `SELECT vote FROM resource_votes WHERE student_id=$1 AND resource_id=$2`,
      [req.user.id, resourceId]
    );

    if (existing.length > 0 && existing[0].vote === vote) {
      // Toggle off
      await query(
        `DELETE FROM resource_votes WHERE student_id=$1 AND resource_id=$2`,
        [req.user.id, resourceId]
      );
    } else {
      await query(
        `INSERT INTO resource_votes (student_id, resource_id, vote, updated_at)
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT (student_id, resource_id)
         DO UPDATE SET vote=$3, updated_at=NOW()`,
        [req.user.id, resourceId, vote]
      );
    }

    // Return updated score
    const { rows } = await query(
      `SELECT COALESCE(SUM(vote),0)::int AS score,
              COUNT(CASE WHEN vote=1 THEN 1 END)::int AS upvotes,
              COUNT(CASE WHEN vote=-1 THEN 1 END)::int AS downvotes
       FROM resource_votes WHERE resource_id=$1`,
      [resourceId]
    );

    // Return user's current vote (null if removed)
    const { rows: myVote } = await query(
      `SELECT vote FROM resource_votes WHERE student_id=$1 AND resource_id=$2`,
      [req.user.id, resourceId]
    );

    res.json({
      resourceId,
      score:     rows[0].score,
      upvotes:   rows[0].upvotes,
      downvotes: rows[0].downvotes,
      myVote:    myVote[0]?.vote ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/votes/my  — get all votes by current user (to populate UI state)
router.get("/my", authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT resource_id, vote FROM resource_votes WHERE student_id=$1`,
      [req.user.id]
    );
    const map = {};
    for (const r of rows) map[r.resource_id] = r.vote;
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
