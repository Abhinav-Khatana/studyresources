-- ── Migration 4: DSA Progress Tracker ─────────────────────────────────────────
-- Tracks per-student status for each DSA problem on the DSA Prep page

CREATE TABLE IF NOT EXISTS dsa_progress (
  student_id  TEXT        NOT NULL,
  problem_id  TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending',   -- pending | done | revision
  starred     BOOLEAN     NOT NULL DEFAULT false,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, problem_id),
  CONSTRAINT dsa_status_check CHECK (status IN ('pending', 'done', 'revision'))
);

CREATE INDEX IF NOT EXISTS idx_dsa_progress_student ON dsa_progress (student_id);
