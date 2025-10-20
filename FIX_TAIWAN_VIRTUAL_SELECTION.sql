-- ============================================
-- Taiwan Platform: Virtual Selection Feature Fix
-- Run this in Taiwan Supabase SQL Editor AFTER running COMPLETE_TW_SCHEMA.sql
-- ============================================

-- Step 1: Fix campaign_applications table constraint
ALTER TABLE campaign_applications 
DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- Step 2: Add virtual_selected_at column
ALTER TABLE campaign_applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

-- Done! Virtual selection feature is now enabled.

