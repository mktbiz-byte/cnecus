-- ============================================================
-- FIX: Add missing video/workflow columns to applications table
--
-- PROBLEM:
--   The applications table lacks video upload columns
--   (video_file_url, week*_url, etc.) that the code expects.
--   The status CHECK constraint is too restrictive.
--   → Video upload update fails → user sees error
--
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS)
-- ============================================================

-- 1. Add video workflow columns
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_file_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_file_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_file_size BIGINT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_uploaded_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS clean_video_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS partnership_code TEXT;

-- 2. Add 4-week challenge per-week columns
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week1_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week2_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week3_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week4_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week1_sns_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week2_sns_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week3_sns_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week4_sns_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week1_clean_video_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week2_clean_video_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week3_clean_video_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week4_clean_video_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week1_partnership_code TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week2_partnership_code TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week3_partnership_code TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS week4_partnership_code TEXT;

-- 3. Add custom deadlines
ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_deadlines JSONB;

-- 4. Fix status CHECK constraint to allow video workflow statuses
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN (
    'pending',
    'selected',
    'filming',
    'video_submitted',
    'revision_requested',
    'approved',
    'sns_uploaded',
    'completed',
    'rejected'
  ));

-- 5. Add video_submissions table if not exists
CREATE TABLE IF NOT EXISTS video_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    application_id UUID,
    user_id UUID,
    video_number INTEGER,
    week_number INTEGER,
    version INTEGER DEFAULT 1,
    video_file_url TEXT,
    video_file_name TEXT,
    video_file_size BIGINT,
    video_uploaded_at TIMESTAMPTZ,
    clean_video_url TEXT,
    sns_upload_url TEXT,
    partnership_code TEXT,
    status TEXT DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    revision_notes TEXT,
    revision_notes_en TEXT,
    admin_comment TEXT,
    admin_comment_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS for video_submissions
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own video submissions" ON video_submissions;
CREATE POLICY "Users can view own video submissions" ON video_submissions
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

DROP POLICY IF EXISTS "Users can insert own video submissions" ON video_submissions;
CREATE POLICY "Users can insert own video submissions" ON video_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own video submissions" ON video_submissions;
CREATE POLICY "Users can update own video submissions" ON video_submissions
    FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

DROP POLICY IF EXISTS "Admins can manage video submissions" ON video_submissions;
CREATE POLICY "Admins can manage video submissions" ON video_submissions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- 7. Indexes for video_submissions
CREATE INDEX IF NOT EXISTS idx_video_submissions_application_id ON video_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_video_submissions_user_id ON video_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_submissions_campaign_id ON video_submissions(campaign_id);

-- 8. Verify
SELECT 'applications' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'applications'
  AND column_name IN ('video_file_url', 'week1_url', 'status')
ORDER BY ordinal_position;
