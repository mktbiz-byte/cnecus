# CNEC US Platform - Admin Setup Guide

## Current Issues and Solutions

### Issues Identified:
1. ✅ **Database reference error** - `database.bankTransfers` not defined (FIXED in code)
2. ⚠️ **Admin role not set** - User showing as "pending approval"
3. ⚠️ **Email templates in Korean/Japanese** - Need English versions
4. ⚠️ **Data loading errors** - SNS uploads and confirmed creators pages

---

## Step 1: Execute SQL Fixes

### In Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/ybsibqlaipsbvbyqlcny/sql/new
2. Copy and paste the contents of `COMPLETE_FIXES.sql`
3. **IMPORTANT**: Before running, update line 18-19 with your admin email:

```sql
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'YOUR-ACTUAL-EMAIL@gmail.com';
```

4. Click "Run" to execute the script

### What this script does:
- ✅ Removes campaign status change constraints
- ✅ Creates applications view for admin panel
- ✅ Creates user points balance view
- ✅ Adds admin helper functions (manage points, change status)
- ✅ Updates RLS policies for admin access
- ✅ Updates all email templates to English
- ✅ Ensures applications table/view exists

---

## Step 2: Verify Admin Role

After running the SQL script:

1. **Check your admin status:**
```sql
SELECT id, user_id, email, name, role, created_at 
FROM user_profiles 
WHERE email = 'your-email@gmail.com';
```

2. **Expected result:**
   - `role` should be: `admin`
   - If not, run the UPDATE command again

3. **Log out and log back in** to refresh your session

---

## Step 3: Test Admin Functions

After logging back in, verify:

1. ✅ **Admin Dashboard** - Should show statistics
2. ✅ **Campaign Status Changes** - Should work without errors
3. ✅ **User Management** - Should see all users with roles
4. ✅ **Point Management** - Should be able to add/subtract points
5. ✅ **SNS Uploads Page** - Should load data without errors
6. ✅ **Confirmed Creators Page** - Should load data without errors

---

## Step 4: Domain Setup (cnec-us.com)

### In Netlify:

1. Go to: https://app.netlify.com/sites/cnecus/settings/domain
2. Click "Add custom domain"
3. Enter: `cnec-us.com`
4. Netlify will provide DNS records

### In Your Domain Registrar (where you bought cnec-us.com):

Add these DNS records:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME  
Name: www
Value: cnecus.netlify.app
```

**DNS propagation takes 24-48 hours**

---

## Step 5: Update Environment Variables

If you change the domain, update in Netlify:

1. Go to: https://app.netlify.com/sites/cnecus/settings/env
2. Add/Update:
   - `VITE_SITE_URL` = `https://cnec-us.com`
   - `VITE_SUPABASE_URL` = (already set)
   - `VITE_SUPABASE_ANON_KEY` = (already set)

3. Redeploy the site after updating

---

## Step 6: Update Supabase Redirect URLs

In Supabase:

1. Go to: https://supabase.com/dashboard/project/ybsibqlaipsbvbyqlcny/auth/url-configuration
2. Add to "Redirect URLs":
   ```
   https://cnec-us.com/auth/callback
   https://cnec-us.com/*
   ```

---

## Troubleshooting

### Issue: Still showing "Pending Approval"

**Solution:**
```sql
-- Check current role
SELECT email, role FROM user_profiles WHERE email = 'your-email@gmail.com';

-- Force update
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@gmail.com';

-- Verify
SELECT email, role FROM user_profiles WHERE email = 'your-email@gmail.com';
```

Then **log out and log back in**.

---

### Issue: "Database is not defined" error

**Solution:** Already fixed in code. Redeploy:

```bash
cd /home/ubuntu/cnecus
git add .
git commit -m "Fix database.bankTransfers reference"
git push origin main
```

Netlify will auto-deploy.

---

### Issue: SNS Uploads / Confirmed Creators pages not loading

**Solution:** 
1. Execute `COMPLETE_FIXES.sql` to create the applications view
2. Clear browser cache
3. Refresh the page

---

### Issue: Email templates still in Korean/Japanese

**Solution:**
The SQL script deletes old templates and inserts English ones. If still showing old templates:

```sql
-- Verify current templates
SELECT template_type, subject_template FROM email_templates;

-- If still wrong, force delete and re-insert
DELETE FROM email_templates;
-- Then run the INSERT statements from COMPLETE_FIXES.sql
```

---

## Code Changes Made

### 1. `/home/ubuntu/cnecus/src/lib/supabase.js`

Added `bankTransfers` object to prevent "undefined" errors:

```javascript
bankTransfers: {
  async getAll() {
    return safeQuery(async () => {
      console.log('Bank transfers getAll() - US version does not use bank transfers')
      return [] // US version uses PayPal only
    })
  }
}
```

---

## Files Created

1. ✅ `COMPLETE_FIXES.sql` - All SQL fixes in one script
2. ✅ `ADMIN_SETUP_GUIDE.md` - This guide
3. ✅ `UPDATE_EMAIL_TEMPLATES_ENGLISH.sql` - Detailed email templates (backup)
4. ✅ `FINAL_FIXES.sql` - Alternative fix script (backup)

---

## Next Steps After Setup

1. ✅ Test all admin functions
2. ✅ Create test campaigns
3. ✅ Test user registration and application flow
4. ✅ Test point system
5. ✅ Test withdrawal requests
6. ✅ Verify email templates (if email system is configured)
7. ✅ Set up domain DNS
8. ✅ Update OAuth redirect URLs in Google Cloud Console

---

## Admin Email Configuration

Once admin role is set, you can:

- **Manage Users**: Approve/reject user registrations
- **Manage Campaigns**: Create, edit, delete campaigns
- **Manage Applications**: Approve/reject campaign applications
- **Manage Points**: Add/subtract points for users
- **View Reports**: SNS uploads, confirmed creators, statistics
- **Manage Withdrawals**: Approve/reject PayPal withdrawal requests

---

## Support

If you encounter any issues:

1. Check browser console for errors (F12)
2. Check Supabase logs
3. Check Netlify deploy logs
4. Verify SQL script execution results

---

## Summary Checklist

- [ ] Execute `COMPLETE_FIXES.sql` in Supabase
- [ ] Update admin email in SQL script
- [ ] Verify admin role in database
- [ ] Log out and log back in
- [ ] Test admin dashboard
- [ ] Test SNS uploads page
- [ ] Test confirmed creators page
- [ ] Set up domain DNS records
- [ ] Update Supabase redirect URLs
- [ ] Test complete user flow

---

**Last Updated:** 2025-01-15
**Platform:** CNEC US (cnecus.netlify.app → cnec-us.com)
**Database:** Supabase (ybsibqlaipsbvbyqlcny)

