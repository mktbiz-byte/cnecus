# Changelog

## [2026-02-04] - US Platform Overhaul

### Workflow Stepper Redesign
- Rebuilt `CampaignWorkflowStepper.jsx` to 4-step workflow (was 5-step)
- Steps: Video Submit → Revision Check → SNS/Clean/AdCode → Complete
- Shooting Guide is now always-visible banner (not a locked step)
- Added deadline bar with D-day countdown (Video Due + SNS Due)
- SNS warning banner: "Do NOT post until approved"
- Step 3 shows 3 deliverables: SNS URL + Clean Video + Ad Code (Meta/YouTube/TikTok)
- US-style clean design with violet/emerald color scheme

### Data Connection Fix
- Expanded campaigns join in MyPageWithWithdrawal to include all needed fields
- Previous: only `id, title, brand, reward_amount`
- Now includes: `video_deadline`, `sns_deadline`, `campaign_type`, `image_url`, `title_en`, `brand_en`, `requires_ad_code`, `requires_clean_video`, `shooting_guide`, `google_drive_url`, `google_slides_url`, week deadlines, etc.

### Supabase Schema Fixes
- Created `migrations/verify_schema_completeness.sql` (read-only check)
- Created `migrations/fix_all_missing_columns.sql` (safe ALTER TABLE)
- Fixed missing columns across 5 tables:
  - `user_profiles`: `other_sns_url`
  - `campaigns`: `video_guide_url`, `reference_video_url`
  - `campaign_applications`: 47 missing columns (applicant info, video workflow, SNS, 4-week fields, contact/shipping)
  - `withdrawal_requests`: `withdrawal_method`, `notes`, `bank_info`
  - `email_templates`: `subject`, `body`
- Created `point_transactions` and `email_templates` tables

### Mobile-First Responsive Design
- Applied deep mobile optimization to 10+ files
- Patterns applied:
  - Padding: `p-6` → `p-4 sm:p-6`
  - Text: `text-2xl` → `text-lg sm:text-2xl`
  - Grid: `grid-cols-3` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
  - Table cells: `px-6 py-4` → `px-3 sm:px-6 py-3 sm:py-4`
  - Buttons: mobile `w-full`, desktop `sm:w-auto`
  - Icons: `h-8 w-8` → `h-6 w-6 sm:h-8 sm:w-8`
- Files: MyPageWithWithdrawal, PayPalWithdrawal, ProfileSettings, CompanyReportNew, CreatorContactForm, CampaignWorkflowStepper, ShootingGuideModal, VideoUploadModal, SNSSubmitModal, RevisionRequestsModal

### ShootingGuideModal Upgrade
- Added `application` prop for `google_drive_url` and `google_slides_url`
- Card-based UI (not raw JSON)
- Distinct views for Standard and 4-Week Challenge campaigns
- Guide document links prominently displayed

### Profile Save Fix
- Fixed `address` field not saving (missing from editForm, profileData loading, updateData)
- Fixed `other_sns_url` column missing from Supabase

## [2025-09-30] - Initial Release

### Features
- Campaign management with custom questions
- Email/Google login, profile management
- 2-stage selection process (virtual → final)
- Point system with Japanese bank transfer
- 7-stage automatic email sending
- Admin dashboard with reports
