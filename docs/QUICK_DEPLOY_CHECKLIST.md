# Quick Deployment Checklist for CNEC US Platform

## Pre-Deployment Verification

The platform has been fully developed and tested. All build errors have been resolved, and the following features are confirmed working:

**Core Functionality**: The US version includes campaign management with image URLs and categories, user profiles with SNS integration, point-based reward system, withdrawal requests via PayPal, and admin dashboard with Korean/English language support.

**Recent Fixes**: We resolved the Japanese text error in MyPageWithWithdrawal.jsx that was causing build failures, implemented the image_url field for campaign thumbnails, added category dropdown with nine options (Beauty, Fitness, Food & Lifestyle, Fashion, Technology, Travel, Home & Living, Pet Care, Other), and verified the campaign status change functionality is working correctly.

**Build Status**: The production build completes successfully with no errors. All dependencies are installed using the --legacy-peer-deps flag to resolve date-fns version conflicts. The optimized bundle is ready for deployment.

## Deployment Steps

### Step 1: Supabase Database Setup

Create a new Supabase project in the US region. In the SQL Editor, run the complete schema file located at `/home/ubuntu/cnecus/COMPLETE_FIXES.sql`. This will create all necessary tables including profiles, campaigns, campaign_applications, point_transactions, withdrawal_requests, and account_deletions. The schema includes proper RLS policies and permissions for both users and admins.

Enable Google OAuth in Authentication settings. Add your production domain to the authorized redirect URLs (e.g., https://yourdomain.com/auth/callback). Copy your project URL and anon key from Settings > API for the next step.

### Step 2: Netlify Deployment

Connect your GitHub repository (cnecus) to Netlify. Configure the build settings with build command `npm run build`, publish directory `dist`, and Node version 22.x. If you encounter dependency issues, modify the build command to `npm install --legacy-peer-deps && npm run build`.

Add the following environment variables in Netlify dashboard: `VITE_SUPABASE_URL` (your Supabase project URL), `VITE_SUPABASE_ANON_KEY` (your Supabase anon key), and optionally `VITE_OPENAI_API_KEY` (for the campaign translator feature).

The netlify.toml file is already configured with proper redirects for React Router. Deploy the site and verify the build succeeds.

### Step 3: Domain and OAuth Configuration

Add your custom domain in Netlify settings and configure DNS records as instructed. Enable HTTPS (automatic with Netlify). Return to Supabase and update the OAuth redirect URLs to include your production domain: `https://yourdomain.com/auth/callback` and `https://yourdomain.com/**`.

Set up Google OAuth credentials for your production domain. In Google Cloud Console, create OAuth 2.0 credentials with authorized redirect URIs pointing to your Supabase project. Update the credentials in Supabase Authentication > Providers > Google.

### Step 4: Admin Account Setup

Register a new account through your deployed platform using the email you want to use as admin. Connect to your Supabase project and run the following SQL query to grant admin privileges:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

Log out and log back in to see the admin dashboard. Verify you can access `/campaigns-manage` and other admin routes.

### Step 5: Initial Content and Testing

Create your first campaign using the admin dashboard at `/campaign-create`. Include an image URL and select a category to test the new fields. Change the campaign status using the dropdown in the campaign list to verify status management works.

Test the complete user flow: register as a regular user, browse campaigns, submit an application with answers to custom questions, upload SNS content, request points, and submit a withdrawal request. As admin, approve the application, verify the point transaction, and process the withdrawal.

## Post-Deployment Verification

**User Features**: Confirm that users can register and login via Google OAuth, browse campaigns with category filtering, apply to campaigns and answer custom questions, view their profile and application history, upload SNS content and request points, and submit withdrawal requests with PayPal information.

**Admin Features**: Verify that admins can create and edit campaigns with image URLs and categories, change campaign status (active/inactive/completed/suspended), view and manage applications, approve or reject applicants, process withdrawal requests, and switch between Korean and English in the admin interface.

**Performance**: Check that page load times are acceptable, images load correctly, the database responds quickly, and the site works well on mobile devices.

## Important Notes

**Environment Variables**: All sensitive configuration is stored in environment variables. Never commit `.env` files to the repository. The `.env.example` file shows the required variables.

**Database Security**: Row Level Security (RLS) is enabled on all tables. Users can only access their own data. Admins have elevated permissions through the role field in profiles table.

**Stats Multiplier**: The platform includes a stats multiplier feature for better presentation of follower counts. This is configurable in the admin settings. See `STATS_MULTIPLIER_GUIDE.md` for details.

**Multi-language Support**: The frontend is English-only for regular users. Admin pages support Korean/English language switching via the LanguageContext. The MyPageWithWithdrawal component contains translation objects for potential future multi-language support, but this does not affect the current English-only user experience.

## Troubleshooting

**Build Failures**: If the build fails with dependency errors, ensure you're using `--legacy-peer-deps` flag. Check that Node version is 22.x in Netlify settings.

**OAuth Issues**: Verify redirect URLs match exactly in both Netlify and Supabase. Check that Google OAuth credentials are configured for the production domain. Clear browser cache and cookies if login doesn't work.

**Database Errors**: Check Supabase logs for detailed error messages. Verify RLS policies are enabled. Ensure the admin role is set correctly in the profiles table.

**Missing Features**: If campaign images don't appear, verify the image_url field exists in the campaigns table. If categories don't show, run `ADD_CATEGORY_COLUMN.sql` to add the column.

## Support Resources

The repository includes comprehensive documentation files:

- `DEPLOYMENT_READY_SUMMARY.md` - Detailed deployment information
- `SETUP_COMPLETE_SUMMARY.md` - Overall setup guide  
- `ADMIN_SETUP_GUIDE.md` - Admin features documentation
- `DOMAIN_OAUTH_SETUP.md` - OAuth configuration guide
- `NETLIFY_DEPLOYMENT_GUIDE.md` - Netlify-specific instructions
- `US_PLATFORM_SETUP_COMPLETE.md` - US version specifics

For additional help, check the browser console for frontend errors and Supabase dashboard for database logs.

## Success Criteria

Your deployment is successful when you can complete the following:

1. Access the homepage at your production domain
2. Register and login with Google OAuth
3. Browse campaigns with category filtering
4. Apply to a campaign as a user
5. Create a new campaign as an admin with image URL and category
6. Change campaign status from the admin dashboard
7. Approve an application and see points awarded
8. Submit and process a withdrawal request

**Deployment Status**: ✅ Ready for Production Launch

---

*Last Updated: October 16, 2025*
*Build Version: Production-ready*
*Platform: CNEC US Campaign Platform*

