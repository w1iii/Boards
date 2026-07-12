CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  content_areas JSONB NOT NULL DEFAULT '["medical-surgical", "mother-child", "psychiatric", "community-health", "leadership-management"]',
  daily_goal INT NOT NULL DEFAULT 20,
  target_exam_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
