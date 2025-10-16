-- ============================================
-- FIXED VERSION: Virtual Selection Feature
-- Copy this ENTIRE script and run in Supabase SQL Editor
-- ============================================

-- Step 1: Find and drop the existing constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the actual constraint name
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'campaign_applications'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE campaign_applications DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END IF;
END $$;

-- Step 2: Add new constraint with virtual_selected
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- Step 3: Add virtual_selected_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'virtual_selected_at'
    ) THEN
        ALTER TABLE campaign_applications 
        ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added virtual_selected_at column';
    END IF;
END $$;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

-- Verification: Show the new constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'campaign_applications'
AND con.contype = 'c'
AND pg_get_constraintdef(con.oid) LIKE '%status%';

