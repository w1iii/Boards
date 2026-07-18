-- Migrate content_area values from old naming to PNLE I-V structure
-- Run: psql $DATABASE_URL -f migrations/003_update_content_areas.sql

UPDATE questions SET content_area = 'pnle-i' WHERE content_area = 'leadership-management';
UPDATE questions SET content_area = 'pnle-ii' WHERE content_area = 'community-health';
UPDATE questions SET content_area = 'pnle-iii' WHERE content_area = 'mother-child';
UPDATE questions SET content_area = 'pnle-iv' WHERE content_area = 'medical-surgical';
UPDATE questions SET content_area = 'pnle-v' WHERE content_area = 'psychiatric';

UPDATE sessions SET content_areas = (
  SELECT jsonb_agg(
    CASE
      WHEN value = 'leadership-management' THEN 'pnle-i'::text
      WHEN value = 'community-health' THEN 'pnle-ii'::text
      WHEN value = 'mother-child' THEN 'pnle-iii'::text
      WHEN value = 'medical-surgical' THEN 'pnle-iv'::text
      WHEN value = 'psychiatric' THEN 'pnle-v'::text
      ELSE value
    END
  )
  FROM jsonb_array_elements_text(content_areas) AS value
)
WHERE content_areas ?| array['leadership-management','community-health','mother-child','medical-surgical','psychiatric'];

UPDATE user_profiles SET content_areas = (
  SELECT jsonb_agg(
    CASE
      WHEN value = 'leadership-management' THEN 'pnle-i'::text
      WHEN value = 'community-health' THEN 'pnle-ii'::text
      WHEN value = 'mother-child' THEN 'pnle-iii'::text
      WHEN value = 'medical-surgical' THEN 'pnle-iv'::text
      WHEN value = 'psychiatric' THEN 'pnle-v'::text
      ELSE value
    END
  )
  FROM jsonb_array_elements_text(content_areas) AS value
)
WHERE content_areas ?| array['leadership-management','community-health','mother-child','medical-surgical','psychiatric'];
