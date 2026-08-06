-- Study question bank: pre-generated, reusable across sessions/users
CREATE TABLE study_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_area TEXT NOT NULL,
  study_mode TEXT NOT NULL,
  text TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  rationale TEXT NOT NULL,
  wrong_choice_rationales JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_questions_area_mode ON study_questions(content_area, study_mode);

-- Study sessions now reference a pre-generated bank + record per-question answers
ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS question_ids JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}';
