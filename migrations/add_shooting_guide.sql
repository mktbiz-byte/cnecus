-- Add shooting_guide field to campaigns table
-- This stores the detailed shooting guide for each campaign

-- Add shooting_guide column (JSONB for flexible scene-based structure)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS shooting_guide JSONB;

-- Add video_submission_url column to applications table for video uploads
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_submission_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_submitted_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS revision_requested BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS revision_notes TEXT;

-- Example shooting_guide structure:
-- {
--   "scenes": [
--     {
--       "scene_number": 1,
--       "title_en": "Introduction",
--       "title_ko": "인트로",
--       "description_en": "Introduce yourself and the product",
--       "description_ko": "자기소개 및 제품 소개",
--       "script_en": "Hi everyone! Today I'm going to share...",
--       "script_ko": "안녕하세요! 오늘 소개해드릴...",
--       "tips_en": "Make sure to smile and be natural",
--       "tips_ko": "자연스럽게 웃으면서 촬영하세요",
--       "duration": "10-15 seconds"
--     }
--   ],
--   "general_tips_en": "Film in good lighting, keep it authentic",
--   "general_tips_ko": "조명이 좋은 곳에서, 자연스럽게 촬영하세요"
-- }

COMMENT ON COLUMN campaigns.shooting_guide IS 'JSON structure containing scene-by-scene shooting guide with bilingual content';
COMMENT ON COLUMN applications.video_submission_url IS 'URL of the submitted video (Google Drive, YouTube, etc.)';
COMMENT ON COLUMN applications.video_submitted_at IS 'Timestamp when the video was submitted';
COMMENT ON COLUMN applications.revision_requested IS 'Whether revision has been requested for the video';
COMMENT ON COLUMN applications.revision_notes IS 'Notes for revision if requested';
