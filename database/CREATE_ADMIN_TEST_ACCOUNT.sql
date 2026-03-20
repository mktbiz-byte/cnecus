-- Create Admin Test Account for CNEC US Platform
-- Run this in your Supabase SQL Editor

-- Step 1: First, you need to sign up through the website with this email:
-- Email: admin.test@cnec-us.com
-- (Use Google OAuth or any auth method available)

-- Step 2: After signing up, run this SQL to grant admin privileges:

-- Update the profile to admin role
UPDATE profiles 
SET 
  role = 'admin',
  name = 'Admin Test Account',
  points = 10000,
  instagram_followers = 50000,
  tiktok_followers = 30000,
  youtube_subscribers = 20000,
  instagram_url = 'https://instagram.com/cnecus_test',
  tiktok_url = 'https://tiktok.com/@cnecus_test',
  youtube_url = 'https://youtube.com/@cnecus_test'
WHERE email = 'admin.test@cnec-us.com';

-- Verify the admin account was created
SELECT 
  id,
  email,
  name,
  role,
  points,
  created_at
FROM profiles 
WHERE email = 'admin.test@cnec-us.com';

-- Alternative: If you want to use your own email as admin
-- Replace 'your-email@example.com' with your actual email

-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';

-- Check all admin accounts
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

