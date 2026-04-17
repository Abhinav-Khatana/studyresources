-- ─────────────────────────────────────────────────────────────────────────────
-- StudyHub Migration v4 — Syllabus Sheet Tracker
-- Run once: npm run db:migrate2
-- Safe to re-run (IF NOT EXISTS everywhere)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Syllabus Sheets (AI-parsed student syllabus sheets) ───────────────────────
CREATE TABLE IF NOT EXISTS syllabus_sheets (
  id           SERIAL       PRIMARY KEY,
  student_id   VARCHAR(20)  REFERENCES students(id) ON DELETE CASCADE,
  title        VARCHAR(300) NOT NULL,
  raw_syllabus TEXT,
  sheet_data   JSONB        NOT NULL,
  created_at   TIMESTAMP    DEFAULT NOW(),
  updated_at   TIMESTAMP    DEFAULT NOW()
);

-- ── Per-topic progress tracking ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sheet_topic_status (
  student_id  VARCHAR(20)  REFERENCES students(id) ON DELETE CASCADE,
  sheet_id    INT          REFERENCES syllabus_sheets(id) ON DELETE CASCADE,
  topic_id    VARCHAR(100) NOT NULL,
  status      VARCHAR(20)  DEFAULT 'pending',   -- 'pending' | 'done' | 'revision'
  note        TEXT,
  starred     BOOLEAN      DEFAULT false,
  updated_at  TIMESTAMP    DEFAULT NOW(),
  PRIMARY KEY (student_id, sheet_id, topic_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_syllabus_sheets_student  ON syllabus_sheets(student_id);
CREATE INDEX IF NOT EXISTS idx_sheet_topic_status_sheet ON sheet_topic_status(sheet_id);
CREATE INDEX IF NOT EXISTS idx_sheet_topic_status_std   ON sheet_topic_status(student_id);
