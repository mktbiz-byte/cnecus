-- ============================================
-- FINAL FIX: Virtual Selection Feature
-- Run each step ONE BY ONE in Supabase SQL Editor
-- ============================================

-- STEP 1: Drop existing constraint (run this first)
ALTER TABLE campaign_applications 
DROP CONSTRAINT campaign_applications_status_check;

-- STEP 2: Add new constraint with virtual_selected (run this second)
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- STEP 3: Add virtual_selected_at column (run this third)
ALTER TABLE campaign_applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

-- STEP 4: Create indexes (run this last)
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

-- DONE! Refresh your browser and try virtual selection again.

