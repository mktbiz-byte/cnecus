# CNEC Taiwan Platform - Deployment Checklist

## Phase 1: Supabase Setup

### 1.1 Create Taiwan Supabase Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Project Name: `cnec-taiwan` or `cnec-tw`
- [ ] Database Password: (save securely)
- [ ] Region: **Southeast Asia (Singapore)** (closest to Taiwan)
- [ ] Click "Create new project"

### 1.2 Get Credentials
- [ ] Go to Settings → API
- [ ] Copy **Project URL**: `https://xxxxx.supabase.co`
- [ ] Copy **Anon/Public Key**: `eyJhbGc...`
- [ ] Save these credentials

### 1.3 Run Database Schema
- [ ] Go to SQL Editor
- [ ] Click "New Query"
- [ ] Copy entire content of `COMPLETE_TW_SCHEMA.sql`
- [ ] Paste and click "RUN"
- [ ] Verify: No errors

### 1.4 Fix Virtual Selection Feature
- [ ] In SQL Editor, run `FIX_BOTH_TABLES.sql`:
```sql
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

ALTER TABLE campaign_applications 
DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'virtual_selected', 'approved', 'rejected', 'completed', 'cancelled'));

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE campaign_applications 
ADD COLUMN IF NOT EXISTS virtual_selected_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);
```

### 1.5 Configure Authentication
- [ ] Go to Authentication → Providers
- [ ] Enable **Email** provider
- [ ] Enable **Google OAuth** provider
- [ ] Add redirect URLs:
  - Production: `https://cnec.tw/auth/callback`
  - Development: `http://localhost:5173/auth/callback`

### 1.6 Configure Email Settings
- [ ] Go to Authentication → Email Templates
- [ ] Customize confirmation email (optional)
- [ ] Customize password reset email (optional)

---

## Phase 2: Code Setup

### 2.1 Clone/Create Taiwan Codebase

**Option A: Separate Repository (Recommended)**
```bash
git clone https://github.com/mktbiz-byte/cnecus.git cnectw
cd cnectw
rm -rf .git
git init
```

**Option B: Same Repository, Different Branch**
```bash
cd cnecus
git checkout -b taiwan
```

### 2.2 Update Environment Variables
- [ ] Copy `TAIWAN_ENV_TEMPLATE` to `.env`
- [ ] Fill in Taiwan Supabase credentials
- [ ] Set `VITE_PLATFORM_REGION=tw`
- [ ] Set `VITE_COUNTRY_CODE=TW`

### 2.3 Update Code Configuration

**File: `src/lib/supabase.js`**
- [ ] Verify it reads from `.env` (no hardcoded URLs)
- [ ] Should use: `import.meta.env.VITE_SUPABASE_URL`

**File: `src/contexts/AuthContext.jsx`**
- [ ] Update default region:
```javascript
platform_region: metadata.platform_region || 'tw',
country_code: metadata.country_code || 'TW'
```

**File: `src/components/HomePageUS.jsx` → Rename to `HomePageTW.jsx`**
- [ ] Update branding: "CNEC USA" → "CNEC Taiwan"
- [ ] Update contact email if different
- [ ] Update any US-specific content

**File: `src/App.jsx`**
- [ ] Update import: `HomePageUS` → `HomePageTW`
- [ ] Update route if needed

### 2.4 Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2.5 Test Locally
```bash
npm run dev
```
- [ ] Site loads without errors
- [ ] Can access homepage
- [ ] Can open signup page
- [ ] No console errors

---

## Phase 3: Testing

### 3.1 Authentication Testing
- [ ] Email signup works
- [ ] Confirmation email received
- [ ] Email confirmation link works
- [ ] Login with email works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Logout works

### 3.2 User Features Testing
- [ ] View campaigns list
- [ ] Apply to campaign
- [ ] Form validation works
- [ ] Application submitted successfully
- [ ] View "My Page"
- [ ] Profile settings work
- [ ] Can update profile

### 3.3 Admin Features Testing
- [ ] Create admin account (see below)
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] View campaigns list
- [ ] Create new campaign
- [ ] View applications
- [ ] Virtual select application ✅
- [ ] Approve application ✅
- [ ] Reject application ✅
- [ ] Status updates save correctly ✅

### 3.4 Create Admin Account
```sql
-- In Taiwan Supabase SQL Editor
-- First create user via signup, then:
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@cnec.tw';
```

---

## Phase 4: Build & Deploy

### 4.1 Build Production
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No errors
- [ ] Check `dist/` folder created

### 4.2 Deploy to Netlify

**Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Login**
```bash
netlify login
```

**Deploy**
```bash
netlify deploy --prod --dir=dist
```

**Set Environment Variables in Netlify**
- [ ] Go to Netlify dashboard → Site settings → Environment variables
- [ ] Add `VITE_SUPABASE_URL`
- [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] Add `VITE_PLATFORM_REGION=tw`
- [ ] Add `VITE_COUNTRY_CODE=TW`

### 4.3 Configure Custom Domain
- [ ] Go to Netlify → Domain settings
- [ ] Add custom domain: `cnec.tw` or `taiwan.cnec.com`
- [ ] Configure DNS (A record or CNAME)
- [ ] Enable HTTPS (automatic with Netlify)

### 4.4 Update OAuth Redirect URLs
- [ ] In Taiwan Supabase → Authentication → URL Configuration
- [ ] Add production URL: `https://cnec.tw/auth/callback`
- [ ] In Google Cloud Console (if using Google OAuth)
- [ ] Add authorized redirect URI: `https://cnec.tw/auth/callback`

---

## Phase 5: Post-Deployment Verification

### 5.1 Production Testing
- [ ] Visit production URL
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test Google OAuth
- [ ] Test campaign application
- [ ] Test admin panel
- [ ] Test virtual selection
- [ ] Check all features work

### 5.2 Performance Check
- [ ] Page load speed acceptable
- [ ] No console errors
- [ ] Images load correctly
- [ ] Forms submit correctly

### 5.3 Email Delivery Check
- [ ] Signup confirmation emails arrive
- [ ] Password reset emails arrive
- [ ] Check spam folder if not in inbox

---

## Phase 6: Monitoring & Maintenance

### 6.1 Setup Monitoring
- [ ] Enable Supabase logs monitoring
- [ ] Setup error tracking (optional: Sentry)
- [ ] Monitor email delivery logs

### 6.2 Backup Strategy
- [ ] Enable Supabase automatic backups
- [ ] Document recovery procedures
- [ ] Test restore process (optional)

### 6.3 Documentation
- [ ] Document admin procedures
- [ ] Create user guide (if needed)
- [ ] Document troubleshooting steps

---

## Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Check `.env` file has correct Taiwan Supabase credentials

### Issue: Virtual selection not working
**Solution**: Run `FIX_BOTH_TABLES.sql` in Taiwan Supabase

### Issue: OAuth redirect error
**Solution**: Verify redirect URLs in both Supabase and Google Cloud Console

### Issue: Email not sending
**Solution**: Check Supabase email settings and SMTP configuration

### Issue: Wrong region data showing
**Solution**: Verify default region is 'tw' in code and database

---

## Rollback Plan

If deployment fails:

### Database Rollback
- [ ] Supabase has automatic backups
- [ ] Can restore from backup in Settings → Database → Backups

### Code Rollback
```bash
# If using Netlify
netlify rollback

# If using git
git revert HEAD
git push
```

---

## Success Criteria

✅ Taiwan Supabase project created and configured  
✅ Database schema deployed successfully  
✅ Virtual selection feature working  
✅ All authentication methods working  
✅ Campaign application flow complete  
✅ Admin panel fully functional  
✅ Production site deployed and accessible  
✅ Custom domain configured (if applicable)  
✅ No critical errors in production  

---

## Next Steps After Deployment

1. **Monitor for 24 hours**: Check logs, errors, user feedback
2. **Create test campaigns**: Verify full workflow
3. **Train admin users**: Provide documentation
4. **Gather feedback**: From initial users
5. **Plan improvements**: Based on feedback

---

## Support Resources

### Documentation
- `TAIWAN_VERSION_SETUP_GUIDE.md` - Complete setup guide
- `COMPLETE_TW_SCHEMA.sql` - Database schema
- `FIX_BOTH_TABLES.sql` - Virtual selection fix
- `TAIWAN_ENV_TEMPLATE` - Environment variables

### Supabase Resources
- Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs
- Support: https://supabase.com/support

### Netlify Resources
- Dashboard: https://app.netlify.com
- Documentation: https://docs.netlify.com
- Support: https://www.netlify.com/support

---

**Last Updated**: October 16, 2025  
**Platform**: CNEC Taiwan Campaign Platform  
**Based on**: CNEC US Platform v1.0

