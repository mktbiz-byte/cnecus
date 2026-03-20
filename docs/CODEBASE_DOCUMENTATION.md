# CNEC US Campaign Platform - 전체 코드 문서

## 1. 프로젝트 개요

### 프로젝트명
`cnec-us-campaign-platform` — K-Beauty 브랜드와 숏폼 비디오 크리에이터를 연결하는 인플루언서 마케팅 플랫폼 (미국 버전)

### 핵심 목적
- **브랜드**: K-Beauty 제품 캠페인을 등록하고 크리에이터를 모집/관리
- **크리에이터**: 캠페인에 지원하고, 영상을 제작/업로드하여 보상(포인트)을 획득
- **관리자**: 캠페인 전체 프로세스를 관리 (크리에이터 선정, 배송, SNS 업로드 확인, 포인트/출금 관리)

### 다국가 지원
이 프로젝트는 US 버전이며, 동일한 구조로 JP(일본), TW(대만), KR(한국) 버전이 별도 존재합니다. `platform_region` 필드와 `regionHelper`를 통해 국가별 데이터를 구분합니다.

---

## 2. 기술 스택

| 분류 | 기술 | 용도 |
|------|------|------|
| **프레임워크** | React 19 + Vite 6 | SPA 프론트엔드 |
| **라우팅** | React Router DOM 7 | 클라이언트 사이드 라우팅 |
| **스타일링** | Tailwind CSS 4 | 유틸리티 기반 CSS |
| **UI 컴포넌트** | shadcn/ui (Radix UI + CVA) | 재사용 가능한 UI 컴포넌트 (New York 스타일) |
| **아이콘** | Lucide React | 아이콘 라이브러리 |
| **애니메이션** | Framer Motion | UI 애니메이션 |
| **백엔드/DB** | Supabase (PostgreSQL) | 인증, 데이터베이스, 스토리지, RLS |
| **서버리스** | Netlify Functions | Gmail SMTP 이메일 발송 |
| **배포** | Netlify | CDN, SPA 폴백, 서버리스 함수 |
| **차트** | Recharts | 대시보드 데이터 시각화 |
| **엑셀** | xlsx (SheetJS) | 리포트 엑셀 다운로드 |
| **폼** | React Hook Form + Zod | 폼 관리 및 유효성 검증 |
| **날짜** | date-fns | 날짜 처리 |
| **이메일** | Nodemailer (서버), EmailJS (클라이언트) | 이메일 발송 |
| **파일관리** | Google Drive API (googleapis) — **package.json 미등록** | 크리에이터별 폴더/슬라이드 자동 생성 (코드 존재하나 `googleapis` 패키지 미설치) |
| **패키지 매니저** | pnpm 10 | 의존성 관리 |

---

## 3. 프로젝트 구조

```
cnecus/
├── src/
│   ├── main.jsx                    # React 엔트리 포인트
│   ├── App.jsx                     # 라우트 정의 + 앱 레이아웃
│   ├── App.css                     # 글로벌 스타일 (Tailwind CSS 변수)
│   ├── index.css                   # Tailwind 기본 import
│   │
│   ├── contexts/                   # React Context (전역 상태)
│   │   ├── AuthContext.jsx         # 인증 상태 관리 (Supabase Auth)
│   │   └── LanguageContext.jsx     # 다국어 번역 상태
│   │
│   ├── lib/                        # 유틸리티 & 서비스 레이어
│   │   ├── supabase.js             # ★ 핵심: Supabase 클라이언트 + DB API 계층
│   │   ├── supabase_enhanced.js    # Supabase 확장 (추가 기능)
│   │   ├── i18n.js                 # 다국어 번역 데이터 (ko/ja/en)
│   │   ├── regionHelper.js         # 국가별 설정 (통화, 로케일, 시간대)
│   │   ├── emailService.js         # 이메일 템플릿 + 발송 서비스
│   │   ├── emailScheduler.js       # 캠페인 마감 리마인더 자동화
│   │   ├── emailTemplates.js       # 이메일 HTML 템플릿
│   │   ├── emailHelper.js          # 이메일 헬퍼 함수
│   │   ├── emailjs-dummy.js        # EmailJS 더미 (폴백)
│   │   ├── gmailEmailService.js    # Gmail SMTP 이메일 서비스
│   │   ├── simpleEmailService.js   # 간단 이메일 서비스
│   │   ├── googleDriveService.js   # Google Drive 폴더/슬라이드 자동 생성
│   │   ├── withdrawal_api.js       # 출금/포인트 API (withdrawals + user_points 테이블)
│   │   └── utils.js                # cn() 유틸리티 (clsx + tailwind-merge)
│   │
│   ├── hooks/                      # 커스텀 React 훅
│   │   └── use-mobile.js           # 모바일 감지 훅 (768px 기준)
│   │
│   ├── components/                 # React 컴포넌트
│   │   ├── ui/                     # shadcn/ui 기반 재사용 컴포넌트 (40+개)
│   │   ├── admin/                  # 관리자 전용 컴포넌트
│   │   ├── mypage/                 # 크리에이터 마이페이지 서브컴포넌트
│   │   └── *.jsx                   # 페이지 및 기능 컴포넌트
│   │
│   └── assets/                     # 정적 자산
│
├── netlify/
│   └── functions/                  # Netlify 서버리스 함수
│       ├── send-gmail.js           # Gmail SMTP 이메일 발송 API
│       ├── send-email.js           # 일반 이메일 발송 API
│       ├── package.json            # 서버리스 함수 의존성 (nodemailer)
│       └── package-lock.json
│
├── migrations/                     # DB 마이그레이션 SQL
│   ├── add_4week_per_week_guides.sql
│   ├── add_contact_fields.sql
│   ├── add_profile_missing_columns.sql
│   ├── add_shooting_guide.sql
│   ├── fix_all_missing_columns.sql
│   ├── fix_applications_video_columns.sql
│   ├── fix_status_check_constraint.sql
│   └── verify_schema_completeness.sql
│
├── *.sql                           # 다수의 DB 스키마/수정 SQL 파일
├── package.json                    # 프로젝트 의존성
├── pnpm-lock.yaml                  # pnpm 락 파일
├── vite.config.js                  # Vite 빌드 설정
├── netlify.toml                    # Netlify 배포 설정
├── components.json                 # shadcn/ui 설정
├── eslint.config.js                # ESLint 설정
├── jsconfig.json                   # JavaScript 경로 별칭
├── .env.example                    # 환경변수 템플릿
├── index.html                      # HTML 엔트리 (Vite SPA)
├── _headers                        # Netlify 보안 헤더
└── _redirects                      # Netlify SPA 리디렉트
```

---

## 4. 아키텍처

### 4.1 전체 구조

```
[사용자 브라우저]
    │
    ├─ React SPA (Vite)
    │   ├─ AuthContext (인증 상태)
    │   ├─ LanguageContext (번역)
    │   └─ Components (페이지/UI)
    │
    ├─ Supabase Client
    │   ├─ Auth (Google OAuth, Email/Password)
    │   ├─ Database (PostgreSQL + RLS)
    │   └─ Storage (campaign-images 버킷)
    │
    └─ Netlify Functions
        └─ Gmail SMTP (nodemailer)

[관리자 브라우저]
    │
    └─ 동일한 SPA, /dashboard 등 관리자 라우트
        └─ ProtectedRoute (requireAdmin=true)
```

### 4.2 인증 플로우

```
1. 사용자 → /login 또는 /signup
2. Google OAuth 또는 이메일/비밀번호 인증
3. Supabase Auth → 세션 발급
4. AuthContext → user 상태 + userProfile 로드
5. 최초 로그인 시 user_profiles 자동 생성
6. ProtectedRoute → user_profiles.role='admin' 또는 is_admin=true 확인
```

**인증 방법**:
- `signInWithGoogle()` — Google OAuth 2.0 (PKCE 플로우)
- `signInWithEmail(email, password)` — 이메일/비밀번호
- `signUpWithEmail(email, password, metadata)` — 회원가입 (이메일 확인 포함)
- 콜백 처리: `/auth/callback` → `AuthCallbackSafe` 컴포넌트

### 4.3 데이터 플로우 (캠페인 라이프사이클)

```
1. [관리자] 캠페인 생성 → campaigns 테이블
2. [크리에이터] 캠페인 목록 조회 → 홈페이지에 표시
3. [크리에이터] 캠페인 지원 → applications / campaign_applications 테이블
4. [관리자] 지원자 검토 → 가상 선정(virtual_selected) → 최종 승인(approved)
5. [관리자] 확정 크리에이터 배송 관리 → shipping_status 업데이트
6. [크리에이터] 촬영 가이드 확인 → 비디오 업로드
7. [관리자] SNS 업로드 확인 → 포인트 지급 → point_transactions 테이블
8. [크리에이터] 포인트 출금 요청 → withdrawal_requests 테이블 (PayPal)
9. [관리자] 출금 승인/거절 처리
```

---

## 5. 라우트 구조

### 5.1 공개 라우트 (인증 불필요, ProtectedRoute 미적용)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `HomePageUS` | 메인 홈페이지 (캠페인 목록, 통계) |
| `/login` | `LoginPageUS` | 로그인 (Google + Email) |
| `/signup` | `SignupPageUS` | 회원가입 |
| `/auth/callback` | `AuthCallbackSafe` | OAuth 콜백 처리 |
| `/terms` | `TermsPage` | 이용약관 |
| `/privacy` | `PrivacyPage` | 개인정보처리방침 |
| `/creator-guide` | `CreatorGuidePage` | 크리에이터 가이드 |
| `/secret-admin-login` | `SecretAdminLogin` | 관리자 비밀 로그인 (ProtectedRoute 없음) |
| `/test-admin-login` | `TestAdminLogin` | 테스트 관리자 로그인 (ProtectedRoute 없음) |

### 5.2 사용자 라우트 (ProtectedRoute 미적용, 컴포넌트 내부에서 인증 확인)

> **주의**: 아래 라우트들은 App.jsx에서 `ProtectedRoute`로 감싸지 않음. 각 컴포넌트 내부에서 `useAuth()` 훅을 통해 로그인 여부를 확인하며, 미로그인 시 리디렉션 또는 제한된 UI를 표시합니다.

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/campaign-application` | `CampaignApplicationUpdated` | 캠페인 지원 페이지 |
| `/mypage` | `MyPageWithWithdrawal` | 마이페이지 (캠페인 진행상황, 포인트, 출금) |
| `/profile` | `ProfileSettings` | 프로필 설정 |
| `/profile-settings` | `ProfileSettings` | 프로필 설정 (별칭) |
| `/paypal-withdrawal` | `PayPalWithdrawal` | PayPal 출금 요청 |
| `/company-report/:campaignId` | `CompanyReportNew` | 회사 캠페인 리포트 |
| `/creator-contact` | `CreatorContactForm` | 크리에이터 연락처 제출 |

### 5.3 관리자 라우트 (ProtectedRoute + requireAdmin=true 적용)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/dashboard` | `AdminDashboardSimple` | 관리자 대시보드 (통계 개요) |
| `/campaigns-manage` | `AdminCampaignsWithQuestions` | 캠페인 관리 (CRUD + 질문) |
| `/campaign-create` | `CampaignCreationWithTranslator` | 캠페인 생성 (다국어 번역 포함) |
| `/applications-manage` | `ApplicationsReportSimple` | 지원서 관리 (상태 변경, 검토) |
| `/applications-report` | `ApplicationsReportSimple` | 지원서 리포트 |
| `/confirmed-creators` | `AdminConfirmedCreators` | 확정 크리에이터 전체 목록 |
| `/confirmed-creators/:campaignId` | `ConfirmedCreatorsNew` | 캠페인별 확정 크리에이터 (배송 관리) |
| `/sns-uploads` | `SNSUploadNew` | SNS 업로드 전체 관리 |
| `/sns-uploads/:campaignId` | `SNSUploadNew` | 캠페인별 SNS 업로드 관리 |
| `/campaign-report/:campaignId` | `CampaignReportEnhanced` | 캠페인 상세 리포트 |
| `/email-templates` | `EmailTemplateManager` | 이메일 템플릿 관리 |
| `/users-manage` | `UserApprovalManagerEnhanced` | 사용자 승인/관리 |
| `/user-approval` | `UserApprovalManagerEnhanced` | 사용자 승인 (별칭) |
| `/withdrawals-manage` | `AdminWithdrawals` | 출금 요청 관리 |
| `/system-settings` | `SystemSettings` | 시스템 설정 |
| `/email-settings` | `EmailSettings` | 이메일 SMTP 설정 |

### 5.4 App.jsx에서 import 되었지만 라우트에 미사용 (Dead Import)

아래 컴포넌트들은 App.jsx에서 import 되어 있지만 실제 `<Route>`에 매핑되지 않은 상태입니다:
- `CampaignApplicationPage` (`./components/CampaignApplicationPage`) — `CampaignApplicationUpdated`로 대체됨
- `CompanyReport_multilingual` (`./components/admin/CompanyReport_multilingual`) — `CompanyReportNew`로 대체됨
- `JapanWithdrawalRequest` (`./components/JapanWithdrawalRequest`) — JP 버전용, US에서 미사용
- `ProfileManagement` (`./components/ProfileManagement`) — `ProfileSettings`로 대체됨
- `ConfirmedCreatorsReport_multilingual` (`./components/admin/ConfirmedCreatorsReport_multilingual`) — `ConfirmedCreatorsNew`/`AdminConfirmedCreators`로 대체됨
- `SNSUploadFinalReport_multilingual` (`./components/admin/SNSUploadFinalReport_multilingual`) — `SNSUploadNew`로 대체됨

---

## 6. 데이터베이스 스키마 (Supabase PostgreSQL)

### 6.1 핵심 테이블

#### `user_profiles`
사용자 프로필 (Supabase auth.users와 연계)
```
id              UUID (PK)
user_id         UUID (FK → auth.users)
email           VARCHAR
name            VARCHAR
age             INTEGER
region          TEXT
bio             TEXT
weight          DECIMAL(5,2)
height          DECIMAL(5,2)
has_children    BOOLEAN
is_married      BOOLEAN
skin_type       TEXT
instagram_url   TEXT
tiktok_url      TEXT
youtube_url     TEXT
other_sns_url   TEXT
instagram_followers  INTEGER
tiktok_followers     INTEGER
youtube_subscribers  INTEGER
address         TEXT
phone_number    TEXT
postal_code     TEXT
profile_photo_url TEXT
country_code    VARCHAR(2) — US/TW/JP/KR
platform_region VARCHAR(10) — us/tw/jp/kr
role            TEXT — 'creator' | 'admin'
is_admin        BOOLEAN
is_approved     BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `campaigns`
캠페인 정보
```
id              UUID (PK)
title           TEXT
brand           TEXT
description     TEXT
category        TEXT
status          TEXT — 'active'|'inactive'|'draft'|'completed'|'closed'
reward_amount   INTEGER
start_date      DATE
end_date        DATE (지원 마감일)
image_url       TEXT
requirements    TEXT
guidelines_url  TEXT
upload_folder   TEXT (Google Drive 폴더 링크)
max_participants INTEGER
campaign_type   TEXT — 'standard'|'4week_challenge' 등
target_country  VARCHAR(2) — US/TW/JP/KR
platform_region VARCHAR(10) — us/tw/jp/kr
shooting_guide_url TEXT
per_week_guides JSONB — 주차별 가이드 (4주 챌린지용)
partnership_code TEXT
clean_video_required BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `applications` / `campaign_applications`
캠페인 지원서 (두 테이블이 병존하며, 코드에서 fallback 패턴으로 둘 다 조회)
```
id              UUID (PK)
user_id         UUID (FK → auth.users)
campaign_id     UUID (FK → campaigns)
applicant_name  TEXT
status          TEXT — 'pending'|'virtual_selected'|'approved'|'rejected'|'completed'|'cancelled'
age             INTEGER
skin_type       TEXT
instagram_url   TEXT
tiktok_url      TEXT
youtube_url     TEXT
other_sns_url   TEXT
bio             TEXT
answers         JSONB (캠페인별 질문 응답)
video_url       TEXT (업로드된 비디오 URL)
sns_url         TEXT (SNS 게시물 URL)
submission_status TEXT
shipping_status TEXT — 'pending'|'shipped'|'delivered'
tracking_number TEXT
shipped_at      TIMESTAMPTZ
approved_at     TIMESTAMPTZ
completed_at    TIMESTAMPTZ
applicant_country VARCHAR(2)
platform_region VARCHAR(10)
points_requested BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `point_transactions`
포인트 거래 내역 (적립/차감)
```
id              UUID (PK)
user_id         UUID (FK → auth.users)
application_id  UUID (FK → campaign_applications)
campaign_id     UUID (FK → campaigns)
amount          INTEGER — 양수: 적립, 음수: 차감
transaction_type TEXT — 'earn'|'spend'|'bonus'|'admin_add'|'admin_subtract'|'campaign_reward'|'pending_reward'
description     TEXT
status          TEXT — 'pending'|'completed'|'cancelled'
platform_region VARCHAR(10)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `withdrawal_requests`
출금 요청 (PayPal) — `database.withdrawals`에서 사용
```
id              UUID (PK)
user_id         UUID (FK → auth.users)
amount          INTEGER
withdrawal_method TEXT — 코드에서 'paypal' 삽입 (SQL 스키마에는 미정의이나 코드에서 참조)
paypal_email    TEXT
paypal_name     TEXT
reason          TEXT
status          TEXT — 'pending'|'approved'|'rejected'|'completed'
admin_notes     TEXT
transaction_id  TEXT (PayPal 트랜잭션 ID)
platform_region VARCHAR(10)
processed_at    TIMESTAMPTZ
processed_by    UUID
notes           TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `withdrawals` (별도 테이블)
출금 요청 — `withdrawal_api.js`의 `withdrawalAPI`에서 사용
```
id, user_id, amount, bank_info (JSONB — paypal_email/paypal_name 포함)
status, notes, requested_at, processed_at, processed_by
updated_at
```

#### `user_points` (별도 테이블)
포인트 관리 — `withdrawal_api.js`의 `userPointsAPI`에서 사용
```
id, user_id, campaign_id, points (INTEGER)
reason, status ('approved' 등)
approved_at, created_at
```

### 6.2 부가 테이블

#### `creator_materials`
크리에이터 자료 관리 (Google Drive 연동)
```
id, campaign_id, creator_id, application_id
google_drive_url, google_slides_url
additional_notes, status ('pending'|'provided'|'accessed')
accessed_at, platform_region, created_at, updated_at
```

#### `creator_material_access_logs`
자료 접근 로그
```
id, material_id, creator_id, access_type, accessed_at, ip_address, user_agent
```

#### `email_templates`
이메일 템플릿
```
id, template_type (UNIQUE), subject_template, html_template
variables (JSONB), is_active, created_at, updated_at
```

#### `email_logs`
이메일 발송 이력
```
id, recipient_email, template_type, subject
data (JSONB), status, error_message, sent_at
platform_region, created_at, updated_at
```

#### `email_schedules`
예약 이메일
```
id, campaign_id, email_type, scheduled_at
status, completed_at, error_message, created_at, updated_at
```

#### `email_subscriptions`
이메일 수신 설정
```
id, user_id, ... (이메일 구독 관리)
```

---

## 7. 핵심 소스 파일 상세

### 7.1 `src/lib/supabase.js` — 데이터 접근 계층 (★ 가장 중요)

**역할**: Supabase 클라이언트 초기화 + 모든 DB 작업을 위한 API 계층

**내보내는 객체**:
- `supabase` — Supabase 클라이언트 인스턴스
- `auth` — 인증 관련 함수 (getCurrentUser, getSession, signIn*, signOut, onAuthStateChange)
- `database` — DB CRUD API 계층
  - `database.campaigns` — getAll, getActive, getById, create, update, delete
  - `database.applications` — getAll, getByUser, getByCampaign, getByUserAndCampaign, create, updateStatus, update, requestPoints
  - `database.userProfiles` — get, getById, getAll, upsert, update
  - `database.users` — getAll (userProfiles 별칭)
  - `database.emailTemplates` — getAll, getById, create, upsert, update, delete, getByCategory
  - `database.withdrawals` — getAll, getByUser, create, updateStatus
  - `database.bankTransfers` — getAll (US에서는 빈 배열 반환)
  - `database.userPoints` — getUserTotalPoints, getUserPoints, deductPoints
  - `database.supabase` — raw Supabase 클라이언트 접근
  - `database.safeQuery` — 재시도 로직 포함 안전한 쿼리 래퍼
- `storage` — uploadCampaignImage, deleteCampaignImage

**핵심 패턴**:
- `safeQuery(queryFn, retries=3)` — 자동 재시도 (1초, 2초, 3초 간격)
- **Dual Table Fallback**: `applications` 테이블 우선 조회 → 실패 시 `campaign_applications` 테이블로 폴백 (스키마 마이그레이션 과도기 대응)
- Storage 요청은 타임아웃 미적용 (대용량 파일 업로드 지원)

**주의 — `getByCampaign` 중복 정의 버그**:
`database.applications` 객체 내에 `getByCampaign` 메서드가 2번 정의되어 있음 (supabase.js 421행, 672행).
JavaScript 객체 특성상 **672행의 두 번째 정의가 421행을 오버라이드**함.
- 421행 (오버라이드됨): `applications` 테이블 우선 → `campaign_applications` 폴백 + user_profiles 병합
- 672행 (실제 사용됨): `campaign_applications` 테이블만 조회 + user_profiles 병합

### 7.2 `src/contexts/AuthContext.jsx` — 인증 컨텍스트

**제공하는 값**:
```javascript
{
  user,           // Supabase auth user 객체
  userProfile,    // user_profiles 테이블 데이터
  loading,        // 초기 로딩 상태
  signInWithEmail(email, password),
  signUpWithEmail(email, password, metadata),
  signInWithGoogle(),
  signOut(),
  updateProfile(profileData),
  loadUserProfile(userId)
}
```

**특징**:
- 로그인 시 `user_profiles` 자동 생성 (프로필이 없으면)
- 로그아웃 시 쿠키, localStorage, sessionStorage 전체 정리
- `onAuthStateChange` 리스너로 실시간 인증 상태 추적
- `loading`이 true여도 children 렌더링 (블로킹 방지)

### 7.3 `src/contexts/LanguageContext.jsx` — 다국어 컨텍스트

**지원 언어**: ko(한국어), ja(일본어), en(영어)
**US 버전 동작**: 영어 고정 (`setLanguage('en')`)

**제공하는 값**:
```javascript
{
  language,         // 현재 언어 코드
  changeLanguage(newLanguage),
  t(key),          // 번역 함수
  isKorean, isJapanese, isEnglish  // 언어 판별 플래그
}
```

### 7.4 `src/lib/i18n.js` — 번역 데이터 (상세)

`LanguageContext.jsx`의 간단한 번역 외에, 리포트/관리자 UI에서 사용하는 상세 번역을 담당합니다.

**번역 영역**:
- `common` — 공통 UI 텍스트
- `companyReport` — 회사 캠페인 리포트 텍스트
- `confirmedCreatorsReport` — 확정 크리에이터 리포트
- `snsUploadReport` — SNS 업로드 최종 보고서

**사용법**: `i18n.t('companyReport.metrics.totalApplications')` → "Total Applications"

### 7.5 `src/lib/regionHelper.js` — 지역별 설정

**주요 함수**:
- `getPlatformRegion()` → 'us' (환경변수에서)
- `getPlatformCountry()` → 'US'
- `addRegionToProfile(data)` → 프로필에 region 필드 추가
- `addRegionToCampaign(data)` → 캠페인에 region 필드 추가
- `filterByRegion(query)` → Supabase 쿼리에 region 필터 적용
- `getRegionConfig()` → { currency: 'USD', locale: 'en-US', timezone: 'America/New_York', ... }
- `formatCurrency(amount)` → "$1,000.00"
- `formatDate(date)`, `formatDateTime(datetime)` → 지역별 날짜 포맷
- `getRegionText(key)` → 지역별 텍스트 (US/TW/JP)

### 7.6 `src/lib/emailScheduler.js` — 캠페인 마감 리마인더

**기능**: 캠페인 마감 3일/2일/1일/당일에 자동 이메일 리마인더 발송
**동작**: App 마운트 시 시작, 24시간 간격으로 실행
**스킵 조건**: 비디오 이미 제출한 크리에이터, 오늘 이미 발송된 리마인더

### 7.7 `src/lib/emailService.js` — 이메일 템플릿/발송

**내보내는 함수**:
- `sendEmail(templateType, recipientEmail, data)` — 이메일 발송 (Supabase 로그 기록 + Gmail SMTP 전송)
- `scheduleReminderEmails(campaignId, deadline)` — 캠페인 마감 리마인더 예약
- `emailTriggers` — 이벤트별 이메일 트리거 함수 객체
- `EMAIL_TEMPLATES` — 이메일 HTML 템플릿 정의

**이메일 템플릿 유형** (EMAIL_TEMPLATES 객체의 실제 키):
1. `SIGNUP_COMPLETE` — 회원가입 완료 환영 메일
2. `APPLICATION_SUBMITTED` — 캠페인 지원 접수 확인
3. `APPLICATION_APPROVED` — 지원 승인 (크리에이터 확정 + Google Drive 링크)
4. `CONTACT_INFO_REQUEST` — 확정 크리에이터 배송지/연락처 수집 요청
5. `GUIDE_DELIVERED` — 캠페인 가이드/자료 전달 안내
6. `DEADLINE_TODAY` — 캠페인 마감 당일 리마인더
7. `POINT_REQUEST_SUBMITTED` — 포인트 출금 요청 접수 확인
8. `POINT_TRANSFER_COMPLETED` — 포인트 송금/입금 완료 통지

**이메일 트리거 함수** (emailTriggers):
- `onSignupComplete(user)` → SIGNUP_COMPLETE
- `onApplicationSubmitted(application, campaign, user)` → APPLICATION_SUBMITTED
- `onApplicationApproved(application, campaign, user)` → APPLICATION_APPROVED + 마감 리마인더 예약
- `onGuideDelivered(campaign, user)` → GUIDE_DELIVERED
- `onPointRequestSubmitted(pointRequest, user, bankInfo)` → POINT_REQUEST_SUBMITTED
- `onPointTransferCompleted(transfer, user, campaign)` → POINT_TRANSFER_COMPLETED

### 7.8 `src/lib/googleDriveService.js` — Google Drive 연동

**기능**: 확정 크리에이터에게 Google Drive 폴더와 가이드 슬라이드를 자동 생성
**API**: Google Drive API v3 + Google Slides API v1 (JWT 서비스 계정 인증)
**주의**: `googleapis` 패키지가 package.json에 등록되어 있지 않아 별도 설치 필요 (`pnpm add googleapis`)

**클래스**: `GoogleDriveService` (싱글톤 `googleDriveService`로 export)

**전체 메서드**:
- `initialize(credentials)` — JWT 서비스 계정으로 초기화 (Drive + Slides 클라이언트 생성)
- `isInitialized()` — 초기화 상태 확인
- `createFolder(folderName, parentFolderId)` — 폴더 생성
- `shareWithUser(fileId, emailAddress, role='writer')` — 파일/폴더 공유 권한 부여
- `createPresentation(title, parentFolderId)` — Google Slides 프레젠테이션 생성
- `createFolderStructureForUser(brandName, userName, userEmail)` — 브랜드 폴더 → 사용자 폴더 → 가이드 슬라이드 자동 생성
- `getFileInfo(fileId)` — 파일/폴더 정보 조회

### 7.9 `src/lib/withdrawal_api.js` — 출금/포인트 API (별도 테이블 사용)

> **주의 — 이중 테이블 시스템**: 이 파일은 `database.withdrawals`/`database.userPoints`와 **다른 테이블**을 사용합니다.
> - `withdrawal_api.js` → `withdrawals` 테이블, `user_points` 테이블
> - `supabase.js database.withdrawals` → `withdrawal_requests` 테이블
> - `supabase.js database.userPoints` → `point_transactions` 테이블
>
> 두 시스템이 병존하므로 사용 시 어느 테이블을 참조하는지 주의 필요.

**내보내는 객체**: `withdrawalAPI`, `userPointsAPI`

**withdrawalAPI** (`withdrawals` 테이블):
- `getAll()` — 전체 출금 요청 조회 (user_profiles JOIN)
- `getByUser(userId)` — 사용자별 출금 내역
- `create(withdrawalData)` — 출금 요청 생성 (bank_info JSONB에 PayPal 정보 저장)
- `updateStatus(id, status, processedBy, notes)` — 상태 업데이트
- `delete(id)` — 출금 요청 삭제

**userPointsAPI** (`user_points` 테이블):
- `getUserTotalPoints(userId)` — 총 포인트 합계 (status='approved'인 것만)
- `getUserPoints(userId)` — 포인트 내역 조회 (campaigns JOIN)
- `deductPoints(userId, amount, reason)` — 포인트 차감 (음수 points 삽입)

### 7.10 `src/components/ProtectedRoute.jsx` — 관리자 라우트 가드

**관리자 판별 로직** (순서대로 시도):
1. AuthContext의 `userProfile` 확인 (role='admin' 또는 is_admin=true)
2. Supabase 직접 쿼리 — `user_id`로 조회
3. Supabase 직접 쿼리 — `email`로 조회 (백업)
4. 모두 실패 시 Access Denied 표시

---

## 8. 주요 컴포넌트 설명

### 8.1 크리에이터용 (사용자)

| 컴포넌트 | 설명 |
|----------|------|
| `HomePageUS` | 미국 스타일 홈페이지. 캠페인 카드 목록, 통계, 히어로 섹션 |
| `LoginPageUS` | Google OAuth + 이메일 로그인 |
| `SignupPageUS` | 이메일 회원가입 (이름, 이메일, 비밀번호) |
| `CampaignApplicationUpdated` | 캠페인 지원서 작성 (질문 응답, SNS 정보 입력) |
| `MyPageWithWithdrawal` | 마이페이지 (캠페인 진행 상황 + 포인트 + 출금 기능 통합) |
| `ProfileSettings` | 프로필 편집 (사진 필수, SNS URL, 피부타입 등) |
| `PayPalWithdrawal` | PayPal 출금 요청 폼 |
| `CreatorContactForm` | 확정 크리에이터 연락처 수집 (주소, 전화번호) |
| `CreatorGuidePage` | 크리에이터 참여 가이드 |
| `SeollalPopup` | 설날 이벤트 팝업 (US 크리에이터용) |

### 8.2 마이페이지 서브컴포넌트 (`src/components/mypage/`)

| 컴포넌트 | 설명 |
|----------|------|
| `CampaignProgressCard` | 캠페인별 진행 상황 카드 |
| `CampaignWorkflowStepper` | 단계별 워크플로우 스테퍼 (지원→선정→배송→촬영→업로드→완료) |
| `ShootingGuideModal` | 촬영 가이드 모달 (주차별 가이드 포함) |
| `VideoUploadModal` | 비디오 업로드 모달 |
| `SNSSubmitModal` | SNS URL 제출 모달 |
| `RevisionRequestsModal` | 수정 요청 모달 |

### 8.3 관리자용 (`src/components/admin/`)

| 컴포넌트 | 설명 |
|----------|------|
| `AdminDashboardSimple` | 대시보드 (캠페인 수, 지원 수, 사용자 수, 보상 총액) |
| `AdminCampaignsWithQuestions` | 캠페인 CRUD + 커스텀 질문 관리 |
| `CampaignCreationWithTranslator` | 캠페인 생성 (자동 번역 기능 포함) |
| `ApplicationsReportSimple_final` | 지원서 관리 (상태 변경, 가상선정, 승인, 거절) |
| `AdminConfirmedCreators` | 전체 캠페인 확정 크리에이터 목록 |
| `ConfirmedCreatorsNew` | 캠페인별 확정 크리에이터 + 배송 관리 |
| `SNSUploadNew` | SNS 업로드 확인/관리 |
| `CampaignReportEnhanced` | 캠페인 상세 리포트 (차트 포함) |
| `EmailTemplateManager` | 이메일 템플릿 CRUD |
| `UserApprovalManagerEnhanced` | 사용자 승인/역할 관리 |
| `AdminWithdrawals` | 출금 요청 처리 (승인/거절) |
| `SystemSettings` | 시스템 설정 |
| `EmailSettings` | SMTP 이메일 설정 |
| `AdminHeader` | 관리자 헤더 |
| `AdminNavigation` | 관리자 사이드바 네비게이션 |
| `DriveModal` | Google Drive 폴더 열기 모달 |
| `CompanyReport_multilingual` | 다국어 회사 리포트 |
| `ConfirmedCreatorsReport_multilingual` | 다국어 확정 크리에이터 리포트 |
| `SNSUploadFinalReport_multilingual` | 다국어 SNS 업로드 최종 리포트 |
| `CreatorMaterialsManager` | 크리에이터 자료 (Google Drive) 관리 |
| `CampaignApplicationsReport` | 캠페인별 지원 리포트 |
| `AdminCompanyAccess` | 회사 접근 관리 |

### 8.4 UI 컴포넌트 (`src/components/ui/`)

shadcn/ui (New York 스타일) 기반, 총 40+ 컴포넌트:

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`

---

## 9. 환경변수 설정

### `.env` (`.env.example` 참고)

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 플랫폼 설정
VITE_PLATFORM_REGION=us          # us | tw | jp | kr
VITE_PLATFORM_COUNTRY=US         # US | TW | JP | KR
VITE_PLATFORM_NAME=CNEC United States

# 로케일
VITE_CURRENCY=USD
VITE_LOCALE=en-US
VITE_TIMEZONE=America/New_York

# 결제
VITE_PAYMENT_METHOD=paypal
VITE_MIN_WITHDRAWAL_AMOUNT=50

# 이메일
VITE_SUPPORT_EMAIL=support@cnec.us
VITE_CONTACT_EMAIL=contact@cnec.us

# 통계 표시 배수 (마케팅용)
VITE_STATS_CAMPAIGN_MULTIPLIER=50
VITE_STATS_CREATOR_MULTIPLIER=500
VITE_STATS_APPLICATION_MULTIPLIER=1000
VITE_STATS_REWARD_MULTIPLIER=100
```

---

## 10. 빌드 & 배포

### Vite 빌드 설정 (`vite.config.js`)

```javascript
// 코드 스플리팅 (수동 청크)
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  supabase: ['@supabase/supabase-js'],
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
  utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
  icons: ['lucide-react']
}

// 경로 별칭
alias: { "@": "./src" }
```

### Netlify 배포 (`netlify.toml`)

- **빌드 명령**: `npm run build`
- **출력 디렉토리**: `dist`
- **Node 버전**: 18
- **SPA 리디렉트**: `/* → /index.html (200)`
- **보안 헤더**: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, X-XSS-Protection
- **캐싱**: 정적 자산은 1년, HTML은 재검증 필수

### Netlify Functions

- `netlify/functions/send-gmail.js` — Gmail SMTP 이메일 발송 (nodemailer)
  - POST `/api/send-gmail`
  - Body: `{ emailSettings, testEmail, subject, message }`
  - CORS 지원
  - 상세 에러 핸들링 (EAUTH, ECONNECTION 등)

---

## 11. 캠페인 워크플로우 상세

### 11.1 캠페인 상태 (campaigns.status)
```
draft → active → completed/closed
```

### 11.2 지원 상태 (applications.status)
```
pending → virtual_selected → approved → completed
                            ↘ rejected
                            ↘ cancelled
```

### 11.3 배송 상태 (applications.shipping_status)
```
pending → shipped → delivered
```

### 11.4 캠페인 유형
- `standard` — 표준 캠페인 (1회 촬영/업로드)
- `4week_challenge` — 4주 챌린지 캠페인 (주차별 가이드, per_week_guides JSONB)

### 11.5 포인트 시스템
- **적립**: 캠페인 완료 시 `point_transactions`에 양수 금액 추가
- **차감**: 출금 요청 시 음수 금액으로 기록
- **총 포인트**: `SUM(amount)` from `point_transactions WHERE user_id = ?`

### 11.6 출금 플로우 (US: PayPal)
```
1. 크리에이터 → 출금 요청 (PayPal 이메일, 금액)
2. withdrawal_requests 테이블에 status='pending' 저장
3. 포인트 차감 (point_transactions에 음수 기록)
4. 관리자 → 승인/거절 처리
5. 승인 시 PayPal로 수동 송금 후 status='completed'
```

---

## 12. 주요 디자인 패턴

### 12.1 Dual Table Fallback (이중 테이블 조회)
`applications`와 `campaign_applications` 두 테이블이 병존하며, 코드에서 항상 `applications` 우선 조회 후 실패 시 `campaign_applications`로 폴백합니다. 이는 JP 버전에서 US 버전으로 마이그레이션하는 과도기적 패턴입니다.

### 12.2 safeQuery 재시도
모든 DB 쿼리는 `safeQuery`로 감싸져 최대 3회 재시도하며, 권한 오류(RLS) 시 빈 배열을 반환합니다.

### 12.3 Context + Hook 패턴
- `AuthContext` → `useAuth()`
- `LanguageContext` → `useLanguage()`

### 12.4 Singleton 서비스
- `emailScheduler` — EmailScheduler 싱글톤 인스턴스
- `googleDriveService` — GoogleDriveService 싱글톤 인스턴스

### 12.5 관리자 권한 검증 (다중 폴백)
AuthContext → Supabase user_id 쿼리 → Supabase email 쿼리 → Access Denied

---

## 13. Supabase 설정 요약

### Auth 설정
- **Provider**: Google OAuth, Email/Password
- **OAuth Redirect**: `{origin}/auth/callback`
- **Flow Type**: PKCE
- **Auto Refresh Token**: 활성화
- **Persist Session**: 활성화

### Storage
- **Bucket**: `campaign-images`
- **업로드 경로**: `campaigns/{timestamp}-{random}.{ext}`
- **접근**: Public URL

### RLS (Row Level Security)
활성화됨. 사용자는 자신의 데이터만 접근 가능, 관리자는 전체 접근 가능.

---

## 14. 다국어(i18n) 아키텍처

### 이중 번역 시스템
1. **LanguageContext.jsx** — 간단한 UI 텍스트 (loading, error, campaigns 등)
2. **i18n.js** — 상세 번역 (리포트, 보고서 관련 텍스트)

### 지원 언어 및 용도
| 코드 | 언어 | 용도 |
|------|------|------|
| `en` | English | US 플랫폼 기본 언어 |
| `ko` | 한국어 | 관리자 UI (한국인 관리자용) |
| `ja` | 日本語 | JP 플랫폼 호환 |

---

## 15. 파일 간 의존성 맵

```
main.jsx
 └─ App.jsx
     ├─ AuthContext.jsx ── supabase.js
     ├─ LanguageContext.jsx
     ├─ emailScheduler.js ── supabase.js (database)
     │
     ├─ [크리에이터 페이지]
     │   ├─ HomePageUS.jsx ── supabase.js, i18n.js
     │   ├─ LoginPageUS.jsx ── AuthContext
     │   ├─ SignupPageUS.jsx ── AuthContext
     │   ├─ CampaignApplicationUpdated.jsx ── supabase.js, AuthContext
     │   ├─ MyPageWithWithdrawal.jsx ── supabase.js, AuthContext
     │   │   └─ mypage/ (CampaignProgressCard, VideoUploadModal, ...)
     │   ├─ ProfileSettings.jsx ── supabase.js, AuthContext
     │   └─ PayPalWithdrawal.jsx ── supabase.js, withdrawal_api.js
     │
     ├─ [관리자 페이지] (ProtectedRoute 래핑)
     │   ├─ AdminDashboardSimple.jsx ── supabase.js
     │   ├─ AdminCampaignsWithQuestions.jsx ── supabase.js
     │   ├─ ApplicationsReportSimple_final.jsx ── supabase.js
     │   ├─ AdminWithdrawals.jsx ── supabase.js
     │   └─ ... (기타 관리자 컴포넌트)
     │
     └─ ProtectedRoute.jsx ── AuthContext, supabase.js

supabase.js (핵심 허브)
 ├─ @supabase/supabase-js
 ├─ auth (인증 API)
 ├─ database (DB CRUD API)
 └─ storage (파일 업로드 API)
```

---

## 16. 개발 명령어

```bash
# 개발 서버 실행
pnpm dev          # http://localhost:5173

# 프로덕션 빌드
pnpm build        # → dist/

# 빌드 미리보기
pnpm preview

# ESLint
pnpm lint
```

---

## 17. 보안 고려사항

- **RLS**: Supabase Row Level Security 활성화
- **관리자 라우트**: `/admin/` 경로 대신 난독화된 경로 사용 (`/dashboard`, `/campaigns-manage` 등)
- **비밀 관리자 로그인**: `/secret-admin-login` 별도 경로
- **보안 헤더**: X-Frame-Options: DENY, CSP, XSS Protection (Netlify)
- **환경변수**: 민감 정보는 `.env`에서 관리, `.gitignore` 처리
- **PKCE Flow**: OAuth 인증에 PKCE 사용
- **쿠키 정리**: 로그아웃 시 모든 쿠키/스토리지 완전 삭제

---

## 18. 알려진 기술적 특이사항 및 주의점

1. **applications vs campaign_applications (이중 테이블)**: 두 테이블이 병존하며 fallback 패턴 사용. `supabase.js`에서 `applications` 우선 조회 후 `campaign_applications`로 폴백. 향후 하나로 통합 필요.
2. **withdrawal_requests vs withdrawals (이중 출금 테이블)**: `supabase.js`의 `database.withdrawals`는 `withdrawal_requests` 테이블, `withdrawal_api.js`의 `withdrawalAPI`는 `withdrawals` 테이블을 각각 사용. 어떤 API를 호출하느냐에 따라 다른 테이블에 기록됨.
3. **point_transactions vs user_points (이중 포인트 테이블)**: `supabase.js`의 `database.userPoints`는 `point_transactions` 테이블, `withdrawal_api.js`의 `userPointsAPI`는 `user_points` 테이블을 각각 사용.
4. **`getByCampaign` 중복 정의 버그**: `database.applications` 객체에서 `getByCampaign` 메서드가 421행과 672행에서 2번 정의됨. 672행이 421행을 오버라이드하여 `campaign_applications` 테이블만 조회하는 버전이 실행됨.
5. **Dead Import 6개**: App.jsx에서 `CampaignApplicationPage`, `CompanyReport_multilingual`, `JapanWithdrawalRequest`, `ProfileManagement`, `ConfirmedCreatorsReport_multilingual`, `SNSUploadFinalReport_multilingual`이 import만 되고 라우트에 미사용.
6. **googleapis 미설치**: `googleDriveService.js`에서 `import { google } from 'googleapis'`를 사용하지만 package.json에 `googleapis` 패키지 미등록. 실행 시 에러 발생 가능.
7. **백업 파일 다수 존재**: `*_backup.jsx`, `*_fixed.jsx`, `*_old.jsx`, `*_complete.jsx` 등 과거 버전 파일이 다수 존재. 정리 필요.
8. **통계 표시 배수**: `VITE_STATS_*_MULTIPLIER` 환경변수로 홈페이지 통계를 실제 수치보다 크게 표시 (마케팅 목적).
9. **이메일 발송 이중 경로**: `emailService.js`의 `sendEmail()`은 localStorage에서 SMTP 설정을 읽어 `gmailEmailService.js`로 직접 발송 시도. SMTP 미설정 시 콘솔 로그만 출력. Netlify Function(`send-gmail.js`)은 별도 서버사이드 발송 경로.
10. **Supabase 키 하드코딩**: `supabase.js`에 fallback 값으로 Supabase URL과 anon key가 하드코딩됨. `.env` 미설정 시 이 값이 사용됨. 프로덕션에서는 반드시 `.env` 설정 필요.
11. **withdrawal_method 컬럼 불일치**: `supabase.js`의 `database.withdrawals.create()`에서 `withdrawal_method: 'paypal'`을 삽입하지만, `COMPLETE_US_SCHEMA.sql`의 `withdrawal_requests` 테이블 정의에 해당 컬럼이 없음. 실제 Supabase DB에 별도 추가되었을 수 있음.
