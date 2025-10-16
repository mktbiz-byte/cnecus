-- ============================================
-- Fix Virtual Selection Feature
-- CNEC US Platform - Database Schema Update
-- ============================================
-- This script adds virtual_selected status and timestamp to campaign_applications table
-- Execute this in Supabase SQL Editor

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
        RAISE NOTICE 'Added virtual_selected_at column';
    ELSE
        RAISE NOTICE 'virtual_selected_at column already exists';
    END IF;
END $$;

-- Step 2: Drop existing status constraint
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_applications_status_check'
    ) THEN
        ALTER TABLE campaign_applications 
        DROP CONSTRAINT campaign_applications_status_check;
        RAISE NOTICE 'Dropped old status constraint';
    END IF;
END $$;

-- Step 3: Add new status constraint with virtual_selected and cancelled
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

-- Step 4: Create index on virtual_selected_at for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_virtual_selected_at 
ON campaign_applications(virtual_selected_at) 
WHERE virtual_selected_at IS NOT NULL;

-- Step 5: Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status 
ON campaign_applications(status);

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_applications' 
AND column_name IN ('status', 'virtual_selected_at')
ORDER BY column_name;

-- Show constraint details
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'campaign_applications'
AND con.conname LIKE '%status%';

RAISE NOTICE 'Virtual selection feature database update completed successfully!';

