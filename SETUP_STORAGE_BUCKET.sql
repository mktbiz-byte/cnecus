-- Supabase Storage Setup for Campaign Images
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets are created through the Supabase Dashboard UI
-- Go to Storage > Create a new bucket > Name: "campaign-images"
-- Make it PUBLIC so images can be accessed via URL

-- After creating the bucket in the UI, run these policies:

-- 1. Allow authenticated users (especially admins) to upload images
CREATE POLICY "Allow authenticated users to upload campaign images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-images');

-- 2. Allow public read access to campaign images
CREATE POLICY "Allow public read access to campaign images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaign-images');

-- 3. Allow admins to update campaign images
CREATE POLICY "Allow admins to update campaign images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- 4. Allow admins to delete campaign images
CREATE POLICY "Allow admins to delete campaign images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Manual Steps to Complete in Supabase Dashboard:
-- 
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Bucket name: campaign-images
-- 4. Make it PUBLIC (toggle the public option)
-- 5. Click Create
-- 6. Then run the SQL above to set up the policies
--
-- After setup, you can upload images and get URLs like:
-- https://[your-project].supabase.co/storage/v1/object/public/campaign-images/[filename]

