-- Fix 1: Update campaigns status constraint to include 'suspended'
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'inactive', 'completed', 'suspended', 'draft', 'closed'));

-- Fix 2: Add category constraint (if not exists)
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_category_check;
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_category_check 
CHECK (category IN ('beauty', 'fitness', 'food', 'fashion', 'technology', 'travel', 'home', 'pet', 'other'));

-- Fix 3: Storage bucket policies (run AFTER creating bucket in Dashboard)
-- IMPORTANT: You must create the 'campaign-images' bucket in Supabase Dashboard first!
-- Go to: Storage > Create a new bucket > Name: campaign-images > Make it PUBLIC

-- After creating the bucket, run these policies:

CREATE POLICY "Allow authenticated users to upload campaign images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "Allow public read access to campaign images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaign-images');

CREATE POLICY "Allow admins to update campaign images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Allow admins to delete campaign images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid() IN (
    SELECT user_id FROM profiles WHERE role = 'admin'
  )
);

-- Verify the changes
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'campaigns'::regclass
  AND conname LIKE '%check%';

