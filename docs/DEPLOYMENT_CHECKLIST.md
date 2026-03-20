# CNEC US Platform - Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] Run `FIX_VIRTUAL_SELECTION.sql` in Supabase SQL Editor
- [ ] Verify status constraint includes: pending, virtual_selected, approved, rejected, completed, cancelled
- [ ] Check `virtual_selected_at` column exists in campaign_applications table
- [ ] Verify indexes created successfully

### 2. Environment Variables
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Variables configured in hosting platform (Netlify/Vercel)

### 3. Code Verification
- [ ] Run `npm run build` successfully
- [ ] No errors in build output
- [ ] Check dist/ folder created
- [ ] Verify bundle sizes are reasonable

## Deployment

### 4. Deploy Frontend
```bash
# Build
npm run build

# Deploy (example for Netlify)
netlify deploy --prod --dir=dist
```

### 5. Configure Supabase
- [ ] Enable Email provider in Authentication → Providers
- [ ] Enable Google OAuth provider
- [ ] Add redirect URLs:
  - Production: `https://your-domain.com/auth/callback`
  - Development: `http://localhost:5173/auth/callback`
- [ ] Configure email templates (optional)
- [ ] Set up email delivery settings

### 6. Create Admin Account
```sql
-- Option 1: Update existing user
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@yourdomain.com';

-- Option 2: Create new user via signup, then update role
```

## Post-Deployment Testing

### 7. Authentication Flow
- [ ] Email signup works
- [ ] Confirmation email received
- [ ] Email confirmation link works
- [ ] Login with email works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Logout works

### 8. User Features
- [ ] View campaigns list
- [ ] Apply to campaign
- [ ] Form validation works
- [ ] Application submitted successfully
- [ ] View "My Page"
- [ ] Profile settings work

### 9. Admin Features
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] View campaigns list
- [ ] Create new campaign
- [ ] View applications
- [ ] Virtual select application
- [ ] Approve application
- [ ] Reject application
- [ ] Cancel virtual selection
- [ ] Status updates save correctly

### 10. Database Verification
```sql
-- Check virtual selection is working
SELECT id, status, virtual_selected_at, approved_at 
FROM campaign_applications 
WHERE status = 'virtual_selected' 
LIMIT 5;

-- Check status constraint
SELECT con.conname, pg_get_constraintdef(con.oid) 
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'campaign_applications'
AND con.conname LIKE '%status%';
```

## Monitoring

### 11. Error Tracking
- [ ] Check browser console for errors
- [ ] Monitor Supabase logs
- [ ] Check email delivery logs
- [ ] Monitor application performance

### 12. User Experience
- [ ] Test on desktop browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile browsers
- [ ] Verify responsive design
- [ ] Check loading times
- [ ] Test all user flows end-to-end

## Rollback Plan

If issues occur:

### Database Rollback
```sql
-- Remove virtual_selected_at column
ALTER TABLE campaign_applications 
DROP COLUMN IF EXISTS virtual_selected_at;

-- Restore original status constraint
ALTER TABLE campaign_applications 
DROP CONSTRAINT campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));
```

### Code Rollback
```bash
# Revert to previous deployment
netlify rollback
# or
vercel rollback
```

## Success Criteria

✅ All authentication methods working  
✅ Campaign application flow complete  
✅ Admin panel fully functional  
✅ Virtual selection feature working  
✅ Status updates saving correctly  
✅ No console errors  
✅ No database errors  
✅ Email delivery working  

## Support

### Documentation
- `SESSION_CONTINUATION_FIXES_REPORT.md` - Comprehensive fixes report
- `VIRTUAL_SELECTION_FIX_GUIDE.md` - Virtual selection setup
- `EMAIL_SIGNUP_FIX_GUIDE.md` - Email signup guide
- `APPLICATION_STATUS_UPDATE_FIX.md` - Status update reference

### Database Scripts
- `FIX_VIRTUAL_SELECTION.sql` - Required schema update
- `COMPLETE_US_SCHEMA_FIXED.sql` - Full schema reference

### Common Issues

**Email signup not working**
→ Check `EMAIL_SIGNUP_FIX_GUIDE.md`

**Virtual selection not working**
→ Run `FIX_VIRTUAL_SELECTION.sql` in Supabase

**Status updates failing**
→ Check `APPLICATION_STATUS_UPDATE_FIX.md`

**Google OAuth not working**
→ Verify redirect URLs in Supabase dashboard

---

**Last Updated**: October 16, 2025  
**Platform**: CNEC US Campaign Platform  
**Status**: Ready for Deployment

