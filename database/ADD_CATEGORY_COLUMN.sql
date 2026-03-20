-- Add category column to campaigns table
-- Run this in Supabase SQL Editor

-- Add category column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add comment
COMMENT ON COLUMN campaigns.category IS 'Campaign category (Beauty, Fitness, Food & Lifestyle, etc.)';

-- Update existing campaigns with default category
UPDATE campaigns 
SET category = 'Other'
WHERE category IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns' AND column_name = 'category';

