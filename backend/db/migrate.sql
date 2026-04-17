-- ─────────────────────────────────────────────────────────────────────────────
-- StudyHub Migration v2 → v3
-- Run once: psql -U postgres -d studyhub -f migrate.sql
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extend students table ─────────────────────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS email            VARCHAR(200) UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio              VARCHAR(300);
ALTER TABLE students ADD COLUMN IF NOT EXISTS github           VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- ── Badges master table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          VARCHAR(50)  PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(300),
  icon        VARCHAR(10),
  category    VARCHAR(50)  DEFAULT 'general'
);

-- ── Student → Badge (earned) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_badges (
  student_id VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  badge_id   VARCHAR(50) REFERENCES badges(id)   ON DELETE CASCADE,
  earned_at  TIMESTAMP   DEFAULT NOW(),
  PRIMARY KEY (student_id, badge_id)
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL       PRIMARY KEY,
  student_id  VARCHAR(20)  REFERENCES students(id) ON DELETE CASCADE,
  type        VARCHAR(50)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  is_read     BOOLEAN      DEFAULT false,
  action_url  VARCHAR(200),
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ── Weekly / Crash Plans ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_plans (
  id          SERIAL      PRIMARY KEY,
  student_id  VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  plan_type   VARCHAR(20) DEFAULT 'weekly',       -- 'weekly' | 'crash'
  subject_ids TEXT[],
  plan_data   JSONB       NOT NULL,
  created_at  TIMESTAMP   DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(student_id, is_read);
CREATE INDEX IF NOT EXISTS idx_student_badges        ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_student   ON study_plans(student_id);

-- ── Seed badge definitions ────────────────────────────────────────────────────
INSERT INTO badges (id, name, description, icon, category) VALUES
  ('first_fire',    'First Flame',    'Complete your very first resource',             '🔥', 'progress'),
  ('bookworm',      'Bookworm',       'Complete 10 resources',                         '📚', 'progress'),
  ('scholar',       'Scholar',        'Complete 25 resources',                         '🎓', 'progress'),
  ('speed_runner',  'Speed Runner',   'Complete 5 resources in a single day',          '⚡', 'streak'),
  ('week_warrior',  'Week Warrior',   'Maintain a 7-day study streak',                 '🎯', 'streak'),
  ('dedicated',     'Dedicated',      'Maintain a 30-day study streak',                '👑', 'streak'),
  ('top3',          'Elite',          'Reach Top 3 on the leaderboard',                '🏆', 'social'),
  ('night_owl',     'Night Owl',      'Log study time after 11 PM',                    '🦉', 'special'),
  ('ai_explorer',   'AI Explorer',    'Generate your first AI roadmap',                '🤖', 'ai'),
  ('planner',       'The Planner',    'Create your first weekly study plan',           '📅', 'ai'),
  ('centurion',     'Centurion',      'Study for 100+ hours total',                    '💯', 'milestone'),
  ('night_before',  '1 Night Hero',   'Survive an all-night crash revision session',   '🌙', 'special')
ON CONFLICT (id) DO NOTHING;
