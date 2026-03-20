# Supabase Storage Setup Guide

## Problem
"Bucket not found" error when uploading campaign images.

## Solution
You need to create the Storage bucket in Supabase Dashboard (cannot be done via SQL).

---

## Step-by-Step Instructions

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"Create a new bucket"** button
5. Enter bucket details:
   - **Name**: `campaign-images`
   - **Public bucket**: Toggle **ON** (important!)
   - **File size limit**: 5MB (optional)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/png, image/webp`
6. Click **"Create bucket"**

### Step 2: Run SQL for Policies

After creating the bucket, go to **SQL Editor** and run the `FIX_CATEGORY_AND_STORAGE.sql` file.

This will:
- Fix the `status` constraint to allow "suspended"
- Add `category` constraint for the dropdown
- Set up Storage policies for upload/read/delete permissions

### Step 3: Verify

1. Go back to **Storage** section
2. You should see `campaign-images` bucket
3. Try uploading an image in the campaign creation form
4. If successful, you'll see the image preview

---

## Storage URL Format

After upload, images will be accessible at:
```
https://[your-project-id].supabase.co/storage/v1/object/public/campaign-images/[filename]
```

---

## Troubleshooting

### Still getting "Bucket not found"?
- Make sure the bucket name is exactly `campaign-images` (lowercase, with hyphen)
- Make sure the bucket is set to **Public**

### Upload fails with permission error?
- Run the SQL policies in `FIX_CATEGORY_AND_STORAGE.sql`
- Make sure you're logged in as admin

### Image doesn't display?
- Check if the bucket is set to **Public**
- Check the image URL in browser console

