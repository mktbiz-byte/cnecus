-- Migration: Add contact information fields to applications table
-- Date: 2026-01-05
-- Description: Add fields for contact info collection from confirmed creators

-- Add phone_number column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'phone_number') THEN
        ALTER TABLE applications ADD COLUMN phone_number TEXT;
    END IF;
END $$;

-- Add postal_code column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'postal_code') THEN
        ALTER TABLE applications ADD COLUMN postal_code TEXT;
    END IF;
END $$;

-- Add address column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'address') THEN
        ALTER TABLE applications ADD COLUMN address TEXT;
    END IF;
END $$;

-- Add address_detail column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'address_detail') THEN
        ALTER TABLE applications ADD COLUMN address_detail TEXT;
    END IF;
END $$;

-- Add contact_submitted flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'contact_submitted') THEN
        ALTER TABLE applications ADD COLUMN contact_submitted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add contact_submitted_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'contact_submitted_at') THEN
        ALTER TABLE applications ADD COLUMN contact_submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add contact_email_sent flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'contact_email_sent') THEN
        ALTER TABLE applications ADD COLUMN contact_email_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add contact_email_sent_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'applications' AND column_name = 'contact_email_sent_at') THEN
        ALTER TABLE applications ADD COLUMN contact_email_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add RLS policy for applications table to allow users to update their own contact info
DO $$
BEGIN
    -- Check if policy exists
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own application contact info') THEN
        CREATE POLICY "Users can update own application contact info" ON applications
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create index for faster queries on contact status
CREATE INDEX IF NOT EXISTS idx_applications_contact_submitted ON applications (contact_submitted);
CREATE INDEX IF NOT EXISTS idx_applications_contact_email_sent ON applications (contact_email_sent);

SELECT 'Contact fields migration completed successfully' as result;
