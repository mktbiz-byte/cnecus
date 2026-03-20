-- Fix applications table - add missing column
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applications' 
  AND column_name = 'additional_info';

