# CNEC US Platform - Netlify Deployment Guide

## Prerequisites

- GitHub repository: `mktbiz-byte/cnecus` ✅
- Supabase project created ✅
- Netlify account (free tier is sufficient)

## Step 1: Connect GitHub to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access your GitHub account
5. Select repository: `mktbiz-byte/cnecus`
6. Branch to deploy: `main`

## Step 2: Configure Build Settings

**Build command:**
```
npm run build
```

**Publish directory:**
```
dist
```

**Build settings are already configured in `netlify.toml`**

## Step 3: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=https://ybsibqlaipsbvbyqlcny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlic2licWxhaXBzYnZieXFsY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTM5OTYsImV4cCI6MjA3NjA4OTk5Nn0.PT3bcPuEvnuS2E_QTGa9wKEN43Qzx5t81POBZ29p9l0
VITE_PLATFORM_REGION=us
VITE_PLATFORM_COUNTRY=US
VITE_PLATFORM_NAME=CNEC United States
VITE_CURRENCY=USD
VITE_LOCALE=en-US
VITE_TIMEZONE=America/New_York
VITE_MIN_WITHDRAWAL_AMOUNT=50
VITE_SUPPORT_EMAIL=support@cnec.us
VITE_CONTACT_EMAIL=contact@cnec.us
NODE_ENV=production
```

## Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete (usually 2-3 minutes)
3. Your site will be live at: `https://[random-name].netlify.app`

## Step 5: Configure Custom Domain (Optional)

If you want to use a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `cnec.us` or `us.cnec.jp`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

## Step 6: Configure Supabase Authentication Redirect

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://[your-netlify-url].netlify.app`
3. Add Redirect URLs:
   - `https://[your-netlify-url].netlify.app/auth/callback`
   - `https://[your-netlify-url].netlify.app/**`

## Step 7: Set up Google OAuth (Required for Login)

### Create Google OAuth Credentials

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing one
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Name: "CNEC US Platform"
6. Authorized JavaScript origins:
   - `https://[your-netlify-url].netlify.app`
   - `https://ybsibqlaipsbvbyqlcny.supabase.co`
7. Authorized redirect URIs:
   - `https://ybsibqlaipsbvbyqlcny.supabase.co/auth/v1/callback`
8. Click "Create" and copy Client ID and Client Secret

### Configure in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Google" provider
3. Paste Client ID and Client Secret
4. Save

## Step 8: Test Deployment

1. Visit your Netlify URL
2. Check if homepage loads correctly
3. Test user registration (Google OAuth)
4. Test campaign application
5. Test admin login (if applicable)

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Solution: Check if all dependencies are in `package.json`
- Run: `npm install` locally to verify

**Error: "Build exceeded memory limit"**
- Solution: Increase Node memory in `netlify.toml`:
  ```toml
  [build.environment]
    NODE_OPTIONS = "--max_old_space_size=4096"
  ```

### Environment Variables Not Working

- Make sure variable names start with `VITE_`
- Redeploy after adding environment variables
- Clear deploy cache: Site settings → Build & deploy → Clear cache

### Google OAuth Not Working

- Check redirect URIs match exactly (no trailing slashes)
- Verify Supabase URL configuration
- Check browser console for errors

### 404 Errors on Refresh

- This should be handled by `netlify.toml` redirects
- If still occurring, check `netlify.toml` is in repository root

## Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update US platform"
git push origin main
```

Netlify will:
1. Detect the push
2. Start build automatically
3. Deploy to production
4. Update your live site

## Monitoring

- **Build logs**: Netlify Dashboard → Deploys → [Latest deploy]
- **Analytics**: Netlify Dashboard → Analytics (requires upgrade)
- **Error tracking**: Check browser console and Supabase logs

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure Google OAuth
4. ✅ Test user registration and login
5. ✅ Create test campaign
6. ✅ Test campaign application flow
7. ⏳ Monitor for errors
8. ⏳ Optimize performance

## Important URLs

- **GitHub Repo**: https://github.com/mktbiz-byte/cnecus
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ybsibqlaipsbvbyqlcny
- **Netlify Dashboard**: https://app.netlify.com
- **Google Cloud Console**: https://console.cloud.google.com

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check Supabase logs
3. Check browser console errors
4. Verify environment variables are set correctly

