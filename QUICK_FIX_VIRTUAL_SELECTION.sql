-- ============================================
-- QUICK FIX: Virtual Selection Feature
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN
-- ============================================

-- Step 1: Add virtual_selected_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'virtual_selected_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications 
        ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 2: Drop existing status constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_applications_status_check'
    ) THEN
        ALTER TABLE campaign_applications 
        DROP CONSTRAINT campaign_applications_status_check;
    END IF;
END $$;

-- Step 3: Add new status constraint with virtual_selected and cancelled
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

-- Done! Virtual selection should now work.

