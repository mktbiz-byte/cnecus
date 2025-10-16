-- ============================================
-- FIX BOTH TABLES: applications AND campaign_applications
-- Run each step ONE BY ONE in Supabase SQL Editor
-- ============================================

-- STEP 1: Fix applications table constraint
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- STEP 2: Fix campaign_applications table constraint
ALTER TABLE campaign_applications 
DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- STEP 3: Add virtual_selected_at column to both tables
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE campaign_applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

-- STEP 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_status 
ON applications(status);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

-- DONE! Refresh browser and try again.

