# CNEC US - Domain & OAuth Setup Guide

## Issue: "requested path is invalid" after Google Login

This error occurs because the new domain `cnec-us.com` is not registered in:
1. Supabase redirect URLs
2. Google OAuth authorized domains

---

## Step 1: Update Supabase Redirect URLs

### Go to Supabase Auth Settings:
https://supabase.com/dashboard/project/ybsibqlaipsbvbyqlcny/auth/url-configuration

### Add these URLs to "Redirect URLs":

```
https://cnec-us.com/auth/callback
https://cnec-us.com/*
https://cnecus.netlify.app/auth/callback
https://cnecus.netlify.app/*
http://localhost:5173/auth/callback
http://localhost:5173/*
```

**Important:** Keep both cnec-us.com AND cnecus.netlify.app for backup access.

### Update "Site URL":
```
https://cnec-us.com
```

---

## Step 2: Update Google OAuth Settings

### Go to Google Cloud Console:
https://console.cloud.google.com/apis/credentials

### Find your OAuth 2.0 Client ID

### Update "Authorized JavaScript origins":
```
https://cnec-us.com
https://cnecus.netlify.app
http://localhost:5173
```

### Update "Authorized redirect URIs":
```
https://cnec-us.com/auth/callback
https://cnecus.netlify.app/auth/callback
http://localhost:5173/auth/callback
https://ybsibqlaipsbvbyqlcny.supabase.co/auth/v1/callback
```

**Save changes**

---

## Step 3: Verify Netlify Domain Setup

### Check Netlify Domain Settings:
https://app.netlify.com/sites/cnecus/settings/domain

### Ensure cnec-us.com is set as primary domain

### Check DNS Records:

In your domain registrar (where you bought cnec-us.com):

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: cnecus.netlify.app
```

**DNS propagation can take 24-48 hours**

---

## Step 4: Update Netlify Environment Variables

### Go to Netlify Environment Variables:
https://app.netlify.com/sites/cnecus/settings/env

### Add/Update:
```
VITE_SUPABASE_URL=https://ybsibqlaipsbvbyqlcny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlic2licWxhaXBzYnZieXFsY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMDc1NzksImV4cCI6MjA1MjU4MzU3OX0.cYlJe6jVLgqXxJLVFO_tUKPGVqJbT1jMJZvPxiOOQWo
VITE_SITE_URL=https://cnec-us.com
VITE_PLATFORM_REGION=us
```

### Redeploy after updating:
Click "Trigger deploy" → "Deploy site"

---

## Step 5: Test Login Flow

### After all updates:

1. Clear browser cache and cookies
2. Go to https://cnec-us.com
3. Click "Login"
4. Click "Sign in with Google"
5. Complete Google authentication
6. Should redirect to https://cnec-us.com/auth/callback
7. Should then redirect to home page or dashboard

---

## Troubleshooting

### Error: "requested path is invalid"

**Cause:** Domain not registered in Google OAuth or Supabase

**Solution:**
1. Double-check Step 1 and Step 2
2. Wait 5-10 minutes for changes to propagate
3. Clear browser cache
4. Try again

---

### Error: "redirect_uri_mismatch"

**Cause:** Exact redirect URI not in Google OAuth settings

**Solution:**
Check the error message for the exact URI being used, then add it to Google OAuth settings.

---

### Error: "Invalid redirect URL"

**Cause:** Redirect URL not in Supabase allowed list

**Solution:**
Add the exact URL to Supabase redirect URLs (Step 1)

---

### Still using cnecus.netlify.app?

**Temporary workaround:**
You can still use https://cnecus.netlify.app while DNS propagates.

**Check DNS propagation:**
https://www.whatsmydns.net/#A/cnec-us.com

---

## Quick Checklist

- [ ] Supabase redirect URLs updated (Step 1)
- [ ] Google OAuth origins updated (Step 2)
- [ ] Google OAuth redirect URIs updated (Step 2)
- [ ] Netlify domain configured (Step 3)
- [ ] DNS records set (Step 3)
- [ ] Netlify environment variables updated (Step 4)
- [ ] Site redeployed (Step 4)
- [ ] Browser cache cleared (Step 5)
- [ ] Login tested (Step 5)

---

## Important Notes

### Keep Both Domains Active

Keep both `cnec-us.com` and `cnecus.netlify.app` in all OAuth settings:
- Provides backup access
- Allows testing on both domains
- Prevents lockout during DNS changes

### DNS Propagation Time

- DNS changes can take 24-48 hours to fully propagate
- You may see inconsistent behavior during this time
- Use https://cnecus.netlify.app as backup during propagation

### OAuth Changes Take Effect Immediately

- Supabase redirect URL changes: Immediate
- Google OAuth changes: Immediate (but may need cache clear)

---

## Current Configuration

### Domain:
- Primary: https://cnec-us.com
- Backup: https://cnecus.netlify.app

### Supabase Project:
- URL: https://ybsibqlaipsbvbyqlcny.supabase.co
- Region: US
- Project ID: ybsibqlaipsbvbyqlcny

### Expected Redirect Flow:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User approves
4. Google redirects to: `https://cnec-us.com/auth/callback`
5. Supabase processes authentication
6. App redirects to home or dashboard

---

## Testing Commands

### Check if domain is resolving:
```bash
nslookup cnec-us.com
```

### Check if HTTPS is working:
```bash
curl -I https://cnec-us.com
```

### Check Netlify deployment:
```bash
curl -I https://cnecus.netlify.app
```

---

**Last Updated:** 2025-01-15
**Status:** Domain changed to cnec-us.com, OAuth setup required

