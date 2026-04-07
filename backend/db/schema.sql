-- ─────────────────────────────────────────────────────────────────────────────
-- StudyHub Database Schema
-- Run once: psql -U postgres -d studyhub -f schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Students ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            VARCHAR(20)  PRIMARY KEY,        -- e.g. CS2021001
  name          VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  batch         VARCHAR(10),
  semester      INT          DEFAULT 5,
  cgpa          DECIMAL(3,1) DEFAULT 0.0,
  branch        VARCHAR(10)  DEFAULT 'CSE',
  avatar        VARCHAR(10),
  role          VARCHAR(10)  DEFAULT 'student',  -- 'student' | 'admin'
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── Subjects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id         VARCHAR(20)  PRIMARY KEY,           -- e.g. 'daa'
  name       VARCHAR(200) NOT NULL,
  code       VARCHAR(20),
  semester   INT          DEFAULT 5,
  credits    INT          DEFAULT 3,
  icon       VARCHAR(20)  DEFAULT '📚',
  color      VARCHAR(100) DEFAULT 'from-brand-500 to-brand-700',
  created_at TIMESTAMP    DEFAULT NOW()
);

-- ── Units ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id           SERIAL       PRIMARY KEY,
  subject_id   VARCHAR(20)  REFERENCES subjects(id) ON DELETE CASCADE,
  unit_number  INT          NOT NULL,
  title        VARCHAR(200) NOT NULL,
  UNIQUE(subject_id, unit_number)
);

-- ── Unit Topics ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS unit_topics (
  id         SERIAL       PRIMARY KEY,
  unit_id    INT          REFERENCES units(id) ON DELETE CASCADE,
  topic      VARCHAR(200) NOT NULL,
  position   INT          DEFAULT 0
);

-- ── Resources ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id            VARCHAR(50)  PRIMARY KEY,         -- e.g. 'v1-1'
  unit_id       INT          REFERENCES units(id) ON DELETE CASCADE,
  type          VARCHAR(20)  NOT NULL              -- 'notes' | 'videos' | 'articles' | 'pyqs'
                             CHECK (type IN ('notes', 'videos', 'articles', 'pyqs')),
  title         VARCHAR(300) NOT NULL,
  url           VARCHAR(500) DEFAULT '#',
  uploaded_by   VARCHAR(100),
  file_size     VARCHAR(20),
  duration      VARCHAR(20),
  channel       VARCHAR(100),
  read_time     VARCHAR(20),
  year          VARCHAR(10),
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── Study Logs (one row per student per day) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS study_logs (
  id          SERIAL      PRIMARY KEY,
  student_id  VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  log_date    DATE        NOT NULL,
  minutes     INT         NOT NULL DEFAULT 0,
  UNIQUE(student_id, log_date)
);

-- ── Completed Resources ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completed_resources (
  student_id   VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  resource_id  VARCHAR(50) REFERENCES resources(id) ON DELETE CASCADE,
  completed_at TIMESTAMP   DEFAULT NOW(),
  PRIMARY KEY (student_id, resource_id)
);

-- ── Resource Votes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_votes (
  student_id  VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  resource_id VARCHAR(50) REFERENCES resources(id) ON DELETE CASCADE,
  vote        INT         NOT NULL CHECK (vote IN (1, -1)),  -- 1 = upvote, -1 = downvote
  updated_at  TIMESTAMP   DEFAULT NOW(),
  PRIMARY KEY (student_id, resource_id)
);

-- ── Bookmarks ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  student_id  VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  resource_id VARCHAR(50) REFERENCES resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMP   DEFAULT NOW(),
  PRIMARY KEY (student_id, resource_id)
);

-- ── Exam Dates ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_dates (
  id             SERIAL      PRIMARY KEY,
  subject_id     VARCHAR(20) REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date      DATE        NOT NULL,
  academic_year  VARCHAR(20),
  notes          VARCHAR(200),
  created_at     TIMESTAMP   DEFAULT NOW()
);

-- ── Saved Roadmaps ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_roadmaps (
  id            SERIAL      PRIMARY KEY,
  student_id    VARCHAR(20) REFERENCES students(id) ON DELETE CASCADE,
  subject_id    VARCHAR(20) REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date     DATE,
  effort_level  INT,
  cgpa          DECIMAL(3,1),
  knowledge_pct INT,
  roadmap_data  JSONB       NOT NULL,
  created_at    TIMESTAMP   DEFAULT NOW()
);

-- ── Announcements ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          SERIAL       PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  content     TEXT,
  created_by  VARCHAR(20)  REFERENCES students(id),
  expires_at  TIMESTAMP,                           -- NULL = never expires
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ── Indexes for common queries ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_study_logs_student    ON study_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_study_logs_date       ON study_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_completed_student     ON completed_resources(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_unit        ON resources(unit_id);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON resources(type);
CREATE INDEX IF NOT EXISTS idx_votes_resource        ON resource_votes(resource_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student     ON bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active  ON announcements(expires_at);
-- Full-text search index on resources
CREATE INDEX IF NOT EXISTS idx_resources_search
  ON resources USING GIN(to_tsvector('english', title || ' ' || COALESCE(uploaded_by,'') || ' ' || COALESCE(channel,'')));
