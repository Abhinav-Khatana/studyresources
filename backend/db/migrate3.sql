-- ─────────────────────────────────────────────────────────────────────────────
-- StudyHub Migration v5 — Exam-first Prep Platform
-- Run once: npm run db:migrate3
-- Safe to re-run (IF NOT EXISTS / guarded ALTERs)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE students ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(30) DEFAULT 'email';
ALTER TABLE students ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS google_email_verified BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS linkedin VARCHAR(200);
ALTER TABLE students ADD COLUMN IF NOT EXISTS website VARCHAR(200);

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_provider_user
  ON students(auth_provider, provider_user_id)
  WHERE provider_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS prep_plans (
  id                SERIAL       PRIMARY KEY,
  student_id        VARCHAR(20)  REFERENCES students(id) ON DELETE CASCADE,
  title             VARCHAR(300) NOT NULL,
  raw_syllabus      TEXT         NOT NULL,
  input_settings    JSONB        NOT NULL,
  plan_data         JSONB        NOT NULL,
  generation_source VARCHAR(20)  DEFAULT 'ai',
  generation_note   VARCHAR(400),
  is_premium_ready  BOOLEAN      DEFAULT false,
  premium_preview   JSONB        DEFAULT '{}'::jsonb,
  last_opened_at    TIMESTAMP    DEFAULT NOW(),
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prep_plan_topic_status (
  student_id   VARCHAR(20)  REFERENCES students(id) ON DELETE CASCADE,
  plan_id      INT          REFERENCES prep_plans(id) ON DELETE CASCADE,
  topic_id     VARCHAR(100) NOT NULL,
  status       VARCHAR(20)  DEFAULT 'not_started',
  note         TEXT,
  starred      BOOLEAN      DEFAULT false,
  updated_at   TIMESTAMP    DEFAULT NOW(),
  PRIMARY KEY (student_id, plan_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_prep_plans_student ON prep_plans(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prep_plans_last_opened ON prep_plans(student_id, last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_prep_plan_topic_status_plan ON prep_plan_topic_status(plan_id);
CREATE INDEX IF NOT EXISTS idx_prep_plan_topic_status_student ON prep_plan_topic_status(student_id);
