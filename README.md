# CNEC-US K-Beauty Creator Marketing Platform

US market K-Beauty influencer marketing platform. Built with React 19, Supabase, Tailwind CSS v4.

## Tech Stack

- **Frontend**: React 19 + Vite 6.3.5 + Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + Lucide React icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Routing**: React Router DOM v7
- **Deploy**: Netlify
- **Package Manager**: pnpm

## Creator Workflow

```
Selected → Video Submit → Revision Check → SNS/Clean/AdCode → Complete
```

### Steps

| Step | Creator Action | DB Column |
|------|---------------|-----------|
| 1. Video Submit | Upload filmed video | `video_url`, `video_submission_url`, `video_submitted_at`, status → `video_submitted` |
| 2. Revision Check | Admin reviews → approved or revision_requested | `revision_requests` (JSONB), `revision_notes` |
| 3. SNS + Clean + Ad Code | Submit all 3 deliverables | `sns_upload_url`, `clean_video_url`, `partnership_code`, status → `sns_uploaded` |
| 4. Complete | Admin confirms | status → `completed` |

### 4-Week Challenge

| Week | Video Column | SNS Column |
|------|-------------|------------|
| Week 1 | `week1_video_url` | `week1_sns_url` |
| Week 2 | `week2_video_url` | `week2_sns_url` |
| Week 3 | `week3_video_url` | `week3_sns_url` |
| Week 4 | `week4_video_url` | `week4_sns_url` |

## Database Tables

| Table | Purpose |
|-------|---------|
| `user_profiles` | Creator profile, SNS URLs, followers |
| `campaigns` | Campaign config, deadlines, requirements |
| `applications` / `campaign_applications` | Creator applications + submission data |
| `withdrawal_requests` | PayPal withdrawal requests |
| `point_transactions` | Point credit/debit history |
| `email_templates` | Email template storage |

## Key Files

### Pages (src/components/)
| File | Description |
|------|-------------|
| `HomePageUS.jsx` | Landing page with campaign list |
| `LoginPageUS.jsx` | Login (email + Google) |
| `SignupPageUS.jsx` | Registration |
| `CampaignApplicationUpdated.jsx` | Campaign application form |
| `MyPageWithWithdrawal.jsx` | Creator dashboard (2900+ lines) |
| `ProfileSettings.jsx` | Profile edit page |
| `PayPalWithdrawal.jsx` | PayPal withdrawal page |
| `CompanyReportNew.jsx` | Company report view |
| `CreatorContactForm.jsx` | Contact/shipping info form |
| `TermsPage.jsx` | Terms of service |
| `PrivacyPage.jsx` | Privacy policy |

### MyPage Components (src/components/mypage/)
| File | Description |
|------|-------------|
| `CampaignWorkflowStepper.jsx` | 4-step workflow: Video → Revision → SNS/Clean/Code → Complete |
| `ShootingGuideModal.jsx` | Campaign guide viewer (Standard + 4-Week) |
| `VideoUploadModal.jsx` | Video file upload modal |
| `SNSSubmitModal.jsx` | SNS URL + Clean Video + Ad Code submission |
| `RevisionRequestsModal.jsx` | Revision request viewer |

### Core (src/lib/)
| File | Description |
|------|-------------|
| `supabase.js` | Supabase client + database helper functions |

## Setup

```bash
pnpm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
pnpm dev
```

## Migrations

Run in Supabase SQL Editor:

1. `migrations/verify_schema_completeness.sql` — Check for missing columns (read-only)
2. `migrations/fix_all_missing_columns.sql` — Add missing columns (safe, uses IF NOT EXISTS)

## Deployment

Netlify auto-deploy from GitHub. Build command: `pnpm build`
