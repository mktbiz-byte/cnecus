# CNEC US Platform - Supabase Setup Guide

## Supabase Project Information

- **Project URL**: https://ybsibqlaipsbvbyqlcny.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlic2licWxhaXBzYnZieXFsY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTM5OTYsImV4cCI6MjA3NjA4OTk5Nn0.PT3bcPuEvnuS2E_QTGa9wKEN43Qzx5t81POBZ29p9l0

## Database Schema Setup Steps

### Step 1: Run Base Schema Scripts

Execute these SQL scripts in order in Supabase SQL Editor:

1. **database_schema_fix.sql** - Creates base tables (user_profiles, campaigns, applications, etc.)
2. **database_creator_materials.sql** - Creates creator materials management tables
3. **database_schema_with_email.sql** - Creates email system tables
4. **database_schema_us_with_region.sql** - Adds region-based data separation

### Step 2: Verify Tables Created

After running all scripts, verify these tables exist:
- user_profiles
- campaigns
- campaign_applications
- point_transactions
- withdrawal_requests
- creator_materials
- creator_material_access_logs
- email_logs
- email_schedules
- email_templates
- email_subscriptions

### Step 3: Check Region Columns

Verify these columns were added:
- user_profiles: `platform_region`, `country_code`
- campaigns: `platform_region`, `target_country`
- campaign_applications: `platform_region`, `applicant_country`
- point_transactions: `platform_region`
- withdrawal_requests: `platform_region`

### Step 4: Test Region-Based Queries

Run these test queries:

```sql
-- Test US creators view
SELECT * FROM us_creators LIMIT 5;

-- Test US campaigns view
SELECT * FROM us_campaigns LIMIT 5;

-- Test region statistics
SELECT * FROM region_statistics;
```

## Authentication Setup

### Google OAuth Configuration

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Create new Google OAuth credentials:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://ybsibqlaipsbvbyqlcny.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### Email Authentication (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Configure email templates for US market

## Environment Variables for Netlify

Set these environment variables in Netlify:

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
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with these policies:
- Users can only see their own data
- Admins can see all data
- Region-based filtering is automatic

## Cross-Region Data Management

Use these views and functions to pull US-specific data:

```sql
-- Get all US creators
SELECT * FROM get_creators_by_region('us');

-- Get all US campaigns
SELECT * FROM get_campaigns_by_region('us');

-- Export US data as JSON
SELECT get_us_platform_data_json();
```

## Next Steps

1. ✅ Supabase project created
2. ⏳ Run database schema scripts
3. ⏳ Configure Google OAuth
4. ⏳ Deploy to Netlify
5. ⏳ Test authentication and data flow
6. ⏳ Configure domain (when ready)

## Important Notes

- **Data Separation**: US and JP data are completely separated by `platform_region` field
- **Centralized Management**: Use cross_region_queries.sql to pull data from both platforms
- **Authentication**: Each platform has separate user accounts (US users ≠ JP users)
- **Google OAuth**: Requires separate OAuth credentials for US platform

