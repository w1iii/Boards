DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'study_sessions' AND column_name = 'wrong_choices') THEN
    ALTER TABLE study_sessions RENAME COLUMN wrong_choices TO retries;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'study_sessions' AND column_name = 'retries') THEN
    ALTER TABLE study_sessions ADD COLUMN retries INT NOT NULL DEFAULT 0;
  END IF;
END $$;