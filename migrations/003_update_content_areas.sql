-- Migrate content_area values from old naming to NLP I-V structure
-- Run: psql $DATABASE_URL -f migrations/003_update_content_areas.sql

UPDATE questions SET content_area = 'nlp-i' WHERE content_area = 'leadership-management';
UPDATE questions SET content_area = 'nlp-ii' WHERE content_area = 'community-health';
UPDATE questions SET content_area = 'nlp-iii' WHERE content_area = 'mother-child';
UPDATE questions SET content_area = 'nlp-iv' WHERE content_area = 'medical-surgical';
UPDATE questions SET content_area = 'nlp-v' WHERE content_area = 'psychiatric';

UPDATE sessions SET content_areas = (
  SELECT jsonb_agg(
    CASE
      WHEN value = 'leadership-management' THEN 'nlp-i'::text
      WHEN value = 'community-health' THEN 'nlp-ii'::text
      WHEN value = 'mother-child' THEN 'nlp-iii'::text
      WHEN value = 'medical-surgical' THEN 'nlp-iv'::text
      WHEN value = 'psychiatric' THEN 'nlp-v'::text
      ELSE value
    END
  )
  FROM jsonb_array_elements_text(content_areas) AS value
)
WHERE content_areas ?| array['leadership-management','community-health','mother-child','medical-surgical','psychiatric'];

UPDATE user_profiles SET content_areas = (
  SELECT jsonb_agg(
    CASE
      WHEN value = 'leadership-management' THEN 'nlp-i'::text
      WHEN value = 'community-health' THEN 'nlp-ii'::text
      WHEN value = 'mother-child' THEN 'nlp-iii'::text
      WHEN value = 'medical-surgical' THEN 'nlp-iv'::text
      WHEN value = 'psychiatric' THEN 'nlp-v'::text
      ELSE value
    END
  )
  FROM jsonb_array_elements_text(content_areas) AS value
)
WHERE content_areas ?| array['leadership-management','community-health','mother-child','medical-surgical','psychiatric'];
