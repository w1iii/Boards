CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_id_as_text ON questions(CAST(id AS TEXT));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_completed_at ON sessions(completed_at DESC);
