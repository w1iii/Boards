-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('drill','case','recall','weak_area','teach_back')),
  content_area TEXT NOT NULL,
  topic TEXT,
  transcript_json JSONB NOT NULL DEFAULT '[]',
  weak_concepts JSONB NOT NULL DEFAULT '[]',
  score_pct NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_user_completed ON study_sessions(user_id, completed_at DESC);

-- Unified mastery events table
CREATE TABLE mastery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content_area TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  source TEXT NOT NULL CHECK (source IN ('practice','study')),
  ref_id UUID,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_user_area ON mastery_events(user_id, content_area);
CREATE INDEX idx_events_user_correct ON mastery_events(user_id, correct);

-- Backfill: one mastery_event per answered question from completed sessions
INSERT INTO mastery_events (user_id, content_area, weight, source, ref_id, correct, created_at)
SELECT
  s.user_id,
  q.content_area,
  1.0,
  'practice',
  s.id,
  (COALESCE(s.answers->>q.id::text, '') = q.correct_answer),
  s.completed_at
FROM sessions s
CROSS JOIN LATERAL jsonb_array_elements_text(s.questions) AS qid(qid_txt)
JOIN questions q ON q.id::text = qid.qid_txt
WHERE s.status = 'completed';
