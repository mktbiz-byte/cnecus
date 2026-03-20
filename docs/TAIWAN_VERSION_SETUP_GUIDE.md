# CNEC Taiwan Platform Setup Guide

## Overview

This guide explains how to create a Taiwan version of the CNEC platform based on the existing US version.

---

## Strategy

### Option 1: Separate Supabase Project (Recommended)
- **Pros**: Complete isolation, independent scaling, Taiwan region server
- **Cons**: Separate billing, manual sync if needed

### Option 2: Same Supabase Project with Region Filter
- **Pros**: Single database, easier management
- **Cons**: All regions share resources, potential data mixing

**Recommendation**: Use **Option 1** for better performance and data isolation.

---

## Step-by-Step Setup

### Phase 1: Create New Supabase Project (Taiwan)

#### 1. Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Settings:
   - **Name**: `cnec-taiwan` or `cnec-tw`
   - **Database Password**: (save this securely)
   - **Region**: **Southeast Asia (Singapore)** (closest to Taiwan)
   - **Pricing Plan**: Same as US version

#### 2. Get Taiwan Project Credentials
After project creation, go to **Settings** → **API**:
- **Project URL**: `https://your-tw-project.supabase.co`
- **Anon/Public Key**: `eyJhbGc...` (copy this)

Save these for later.

---

### Phase 2: Setup Taiwan Database Schema

#### 1. Run Complete Schema Script

Go to Taiwan Supabase project → **SQL Editor** → **New Query**

Copy and paste the entire content of `COMPLETE_TW_SCHEMA.sql` (we'll create this file)

Key changes from US version:
- Default `country_code`: `'TW'` instead of `'US'`
- Default `platform_region`: `'tw'` instead of `'us'`
- Currency: TWD instead of USD (if needed)

#### 2. Run Virtual Selection Fix

After base schema, run:
```sql
-- Fix both tables for virtual selection
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
```

#### 3. Create Admin Account

```sql
-- After creating a user via signup, update their role:
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@cnec.tw';
```

---

### Phase 3: Setup Taiwan Frontend Code

#### Option A: Separate Repository (Recommended)

```bash
# Clone US version
git clone https://github.com/mktbiz-byte/cnecus.git cnectw

cd cnectw

# Remove US git history
rm -rf .git

# Initialize new git repo
git init
git add .
git commit -m "Initial Taiwan version based on US platform"

# Create new GitHub repo and push
git remote add origin https://github.com/your-org/cnectw.git
git push -u origin main
```

#### Option B: Same Repository, Different Branch

```bash
cd cnecus

# Create Taiwan branch
git checkout -b taiwan

# Make changes (see below)
git add .
git commit -m "Taiwan version configuration"
git push origin taiwan
```

---

### Phase 4: Configure Taiwan Frontend

#### 1. Update Environment Variables

Create `.env` file:

```env
# Taiwan Supabase Project
VITE_SUPABASE_URL=https://your-tw-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-tw-anon-key

# Taiwan Platform Region
VITE_PLATFORM_REGION=tw
VITE_COUNTRY_CODE=TW
```

#### 2. Update Default Values in Code

**File**: `src/lib/supabase.js`

```javascript
// Change default region
const DEFAULT_REGION = 'tw'
const DEFAULT_COUNTRY = 'TW'
```

**File**: `src/contexts/AuthContext.jsx`

```javascript
// Update signup defaults
platform_region: metadata.platform_region || 'tw',
country_code: metadata.country_code || 'TW'
```

#### 3. Update Contact Email (if different)

**File**: `src/components/HomePageUS.jsx` → Rename to `HomePageTW.jsx`

```jsx
<Mail className="h-4 w-4 mr-2" />
support@cnec.tw  {/* or whatever Taiwan email */}
```

#### 4. Update Branding (Optional)

- Change "CNEC USA" to "CNEC Taiwan"
- Update logo if different
- Change currency display (USD → TWD)
- Update language (English → Traditional Chinese)

---

### Phase 5: Multi-language Support (Traditional Chinese)

#### 1. Update Language Context

**File**: `src/contexts/LanguageContext.jsx`

```javascript
const [language, setLanguage] = useState('zh-TW') // Default to Traditional Chinese
```

#### 2. Add Traditional Chinese Translations

Create translation files or update existing ones:

```javascript
const translations = {
  'zh-TW': {
    // Traditional Chinese
    'campaign.apply': '申請活動',
    'campaign.details': '活動詳情',
    // ... more translations
  },
  'en': {
    // English (for international users)
    'campaign.apply': 'Apply to Campaign',
    'campaign.details': 'Campaign Details',
    // ... more translations
  }
}
```

---

### Phase 6: Deploy Taiwan Version

#### 1. Build

```bash
npm run build
```

#### 2. Deploy to Netlify/Vercel

**Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

Set environment variables in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Custom Domain**: `cnec.tw` or `taiwan.cnec.com`

#### 3. Configure Google OAuth

In Taiwan Supabase project:
1. Go to **Authentication** → **Providers**
2. Enable Google
3. Add redirect URLs:
   - `https://cnec.tw/auth/callback`
   - `http://localhost:5173/auth/callback`

---

## Data Migration (If Needed)

### Scenario: Copy Some Data from US to Taiwan

If you want to copy campaigns or other data:

#### 1. Export from US Supabase

```sql
-- In US Supabase SQL Editor
COPY (
  SELECT * FROM campaigns 
  WHERE status = 'active'
) TO STDOUT WITH CSV HEADER;
```

Save the output.

#### 2. Import to Taiwan Supabase

```sql
-- In Taiwan Supabase SQL Editor
COPY campaigns FROM STDIN WITH CSV HEADER;
-- Paste the CSV data here
```

**Note**: Be careful with UUID conflicts. You may need to regenerate IDs.

---

## File Structure Comparison

### US Version
```
cnecus/
├── .env (US credentials)
├── src/
│   ├── components/
│   │   ├── HomePageUS.jsx
│   │   └── ...
│   └── lib/
│       └── supabase.js (US config)
└── package.json
```

### Taiwan Version
```
cnectw/
├── .env (TW credentials)
├── src/
│   ├── components/
│   │   ├── HomePageTW.jsx
│   │   └── ...
│   └── lib/
│       └── supabase.js (TW config)
└── package.json
```

---

## Configuration Checklist

### Database (Taiwan Supabase)
- [ ] Create new Supabase project (Singapore region)
- [ ] Run `COMPLETE_TW_SCHEMA.sql`
- [ ] Run `FIX_BOTH_TABLES.sql` (virtual selection)
- [ ] Create admin account
- [ ] Enable Google OAuth
- [ ] Set up email templates

### Frontend (Taiwan Code)
- [ ] Clone/branch from US version
- [ ] Update `.env` with Taiwan credentials
- [ ] Change default region to 'tw'
- [ ] Change default country to 'TW'
- [ ] Update contact email
- [ ] Update branding (CNEC Taiwan)
- [ ] Add Traditional Chinese translations
- [ ] Test build

### Deployment
- [ ] Build successfully
- [ ] Deploy to Netlify/Vercel
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Test OAuth flow
- [ ] Test email signup
- [ ] Test all features

---

## Key Differences: US vs Taiwan

| Aspect | US Version | Taiwan Version |
|--------|------------|----------------|
| Supabase Project | US region | Singapore region |
| Default Country | `US` | `TW` |
| Default Region | `us` | `tw` |
| Currency | USD | TWD (optional) |
| Language | English | Traditional Chinese |
| Domain | cnec-us.com | cnec.tw |
| Contact Email | mkt@cnecbiz.com | support@cnec.tw |

---

## Maintenance Strategy

### Option 1: Separate Codebases
- **Pros**: Complete independence, easy to customize
- **Cons**: Need to apply fixes to both

### Option 2: Shared Codebase with Config
- **Pros**: Single codebase, easier updates
- **Cons**: More complex configuration

**Recommendation**: Start with **Option 1** (separate), merge common code later if needed.

---

## Common Issues & Solutions

### Issue 1: OAuth Redirect Not Working
**Solution**: Add Taiwan domain to Google OAuth settings in both Google Cloud Console and Supabase.

### Issue 2: Virtual Selection Not Working
**Solution**: Run `FIX_BOTH_TABLES.sql` in Taiwan Supabase.

### Issue 3: Email Signup Fails
**Solution**: Check `AuthContext.jsx` has correct default region ('tw').

### Issue 4: Data Shows from Wrong Region
**Solution**: Verify RLS policies filter by `platform_region = 'tw'`.

---

## Next Steps

1. **Create Taiwan Supabase Project**
2. **Run the schema script** (we'll create `COMPLETE_TW_SCHEMA.sql`)
3. **Clone the code** and update configuration
4. **Test locally** with Taiwan Supabase
5. **Deploy** to production

---

## Files to Create

I'll create these files for you:
1. `COMPLETE_TW_SCHEMA.sql` - Taiwan database schema
2. `TAIWAN_ENV_TEMPLATE` - Environment variables template
3. `TAIWAN_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

---

**Ready to proceed?** Let me know and I'll create the Taiwan-specific SQL schema and configuration files!

