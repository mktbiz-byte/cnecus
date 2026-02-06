-- ============================================================
-- FIX: Update status CHECK constraint for campaign_applications
--
-- PROBLEM:
--   campaign_applications.status CHECK constraint only allows
--   ('pending', 'approved', 'rejected', 'completed')
--   but the app uses: 'selected', 'filming', 'video_submitted',
--   'revision_requested', 'sns_uploaded'
--   → DB update fails → video upload stays loading
--
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. Drop the old restrictive CHECK constraint
ALTER TABLE campaign_applications DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

-- 2. Add new CHECK constraint with all valid statuses
ALTER TABLE campaign_applications ADD CONSTRAINT campaign_applications_status_check
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

-- 3. Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'campaign_applications'::regclass
  AND contype = 'c'
  AND conname LIKE '%status%';
