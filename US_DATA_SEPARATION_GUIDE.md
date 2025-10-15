# CNEC US Platform - 데이터 분리 설정 가이드

## 개요

CNEC US 플랫폼은 JP 버전과 **완전히 분리된 데이터베이스**를 사용하면서도, 필요시 **통합 관리**가 가능하도록 설계되었습니다.

## 데이터 분리 방식

### 방식 1: 물리적 분리 (현재 적용됨) ✅

**JP 버전:**
- Supabase 프로젝트: `psfwmzlnaboattocyupu`
- URL: https://psfwmzlnaboattocyupu.supabase.co
- 데이터: 일본 사용자, 일본 캠페인만 저장

**US 버전:**
- Supabase 프로젝트: `ybsibqlaipsbvbyqlcny`
- URL: https://ybsibqlaipsbvbyqlcny.supabase.co
- 데이터: 미국 사용자, 미국 캠페인만 저장

**장점:**
- ✅ 완전한 데이터 분리
- ✅ 각 지역별 독립적인 스케일링
- ✅ 보안성 강화 (JP 해킹되어도 US는 안전)
- ✅ 지역별 독립적인 백업/복구

**단점:**
- ❌ 통합 조회 시 두 DB 모두 접속 필요

---

### 방식 2: 논리적 분리 (추가 옵션)

하나의 Supabase 프로젝트에서 `platform_region` 필드로 구분

**구조:**
```sql
user_profiles:
- user_id: xxx-xxx
- name: John
- platform_region: 'us'  ← 이 필드로 구분

user_profiles:
- user_id: yyy-yyy
- name: 太郎
- platform_region: 'jp'  ← 이 필드로 구분
```

**장점:**
- ✅ 통합 조회 쉬움
- ✅ 하나의 대시보드에서 모든 데이터 관리

**단점:**
- ❌ 데이터가 물리적으로 분리되지 않음
- ❌ 쿼리 실수 시 다른 지역 데이터 노출 위험

---

## 현재 적용된 설정 (방식 1 + 논리적 구분)

현재 US 버전은 **물리적으로 분리된 DB**를 사용하면서도, 향후 통합 관리를 위해 **논리적 구분 필드**도 함께 적용했습니다.

### 1. 물리적 분리
```
JP: psfwmzlnaboattocyupu.supabase.co
US: ybsibqlaipsbvbyqlcny.supabase.co
```

### 2. 논리적 구분 필드 추가
모든 테이블에 `platform_region` 필드 추가:

```sql
-- user_profiles 테이블
platform_region VARCHAR(10) DEFAULT 'us'

-- campaigns 테이블  
platform_region VARCHAR(10) DEFAULT 'us'

-- campaign_applications 테이블
platform_region VARCHAR(10) DEFAULT 'us'

-- point_transactions 테이블
platform_region VARCHAR(10) DEFAULT 'us'

-- withdrawal_requests 테이블
platform_region VARCHAR(10) DEFAULT 'us'
```

### 3. 자동 Region 설정 트리거

사용자가 데이터를 생성할 때 자동으로 `platform_region = 'us'`가 설정됩니다:

```sql
-- 캠페인 신청 시 자동으로 region 설정
CREATE TRIGGER trigger_set_application_region
    BEFORE INSERT ON campaign_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_region();

-- 포인트 거래 시 자동으로 region 설정
CREATE TRIGGER trigger_set_point_transaction_region
    BEFORE INSERT ON point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_point_transaction_region();
```

---

## 통합 관리 방법

### 옵션 1: API를 통한 통합 조회

각 지역별 Supabase에서 데이터를 가져와서 합치기:

```javascript
// 통합 관리 대시보드 (별도 서버)
const jpSupabase = createClient(JP_URL, JP_KEY);
const usSupabase = createClient(US_URL, US_KEY);

// JP 크리에이터 조회
const jpCreators = await jpSupabase
  .from('user_profiles')
  .select('*')
  .eq('role', 'creator');

// US 크리에이터 조회
const usCreators = await usSupabase
  .from('user_profiles')
  .select('*')
  .eq('role', 'creator');

// 통합
const allCreators = [
  ...jpCreators.data.map(c => ({ ...c, region: 'jp' })),
  ...usCreators.data.map(c => ({ ...c, region: 'us' }))
];
```

### 옵션 2: 데이터 동기화 (선택사항)

주기적으로 US/JP 데이터를 중앙 DB로 동기화:

```
US Supabase → 중앙 통합 DB
JP Supabase → 중앙 통합 DB

통합 관리 대시보드 → 중앙 통합 DB 조회
```

### 옵션 3: Supabase Edge Functions

각 지역별 Supabase에 Edge Function을 만들어 데이터 제공:

```javascript
// US Supabase Edge Function
export async function handler(req) {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('platform_region', 'us');
  
  return new Response(JSON.stringify(data));
}
```

---

## 환경 변수 설정

### US 버전 (.env)
```bash
VITE_SUPABASE_URL=https://ybsibqlaipsbvbyqlcny.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PLATFORM_REGION=us
VITE_PLATFORM_COUNTRY=US
```

### JP 버전 (.env)
```bash
VITE_SUPABASE_URL=https://psfwmzlnaboattocyupu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PLATFORM_REGION=jp
VITE_PLATFORM_COUNTRY=JP
```

---

## 데이터 조회 예시

### US 데이터만 조회
```sql
-- US 크리에이터만 조회
SELECT * FROM user_profiles 
WHERE platform_region = 'us' AND role = 'creator';

-- 또는 뷰 사용
SELECT * FROM us_creators;
```

### JP 데이터만 조회 (JP Supabase에서)
```sql
-- JP 크리에이터만 조회
SELECT * FROM user_profiles 
WHERE platform_region = 'jp' AND role = 'creator';

-- 또는 뷰 사용
SELECT * FROM jp_creators;
```

### 통합 조회 (중앙 관리 시스템에서)
```sql
-- 두 DB에서 각각 조회 후 애플리케이션 레벨에서 합치기
-- US DB: SELECT * FROM us_creators;
-- JP DB: SELECT * FROM jp_creators;
-- 결과 합치기: [...usCreators, ...jpCreators]
```

---

## 보안 설정

### RLS (Row Level Security) 정책

US Supabase에는 US 사용자만 접근 가능:

```sql
-- US 사용자는 US 캠페인만 볼 수 있음
CREATE POLICY "Users can view campaigns from their region" ON campaigns
    FOR SELECT USING (
        platform_region = (
            SELECT platform_region FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );
```

---

## 마이그레이션 시나리오

### 시나리오 1: JP 사용자가 US로 이동
```sql
-- JP DB에서 사용자 데이터 추출
SELECT * FROM user_profiles WHERE user_id = 'xxx';

-- US DB에 삽입
INSERT INTO user_profiles (...) VALUES (...);

-- platform_region을 'us'로 변경
UPDATE user_profiles SET platform_region = 'us' WHERE user_id = 'xxx';
```

### 시나리오 2: 크로스 리전 캠페인
```sql
-- JP와 US 모두 참여 가능한 캠페인
-- 각 DB에 동일한 캠페인 생성
-- campaign_id는 다르지만 external_id로 연결
```

---

## 추천 설정

현재 상황에서는 **방식 1 (물리적 분리)**을 유지하는 것을 추천합니다:

✅ **장점:**
- 완전한 데이터 독립성
- 지역별 규제 준수 용이
- 장애 격리 (한쪽 문제가 다른쪽에 영향 없음)

📝 **통합 관리가 필요한 경우:**
- 별도의 관리자 대시보드 구축
- 각 Supabase API를 호출하여 데이터 통합
- 또는 주기적으로 중앙 DB에 동기화

---

## 요약

| 항목 | JP 버전 | US 버전 |
|------|---------|---------|
| Supabase 프로젝트 | psfwmzlnaboattocyupu | ybsibqlaipsbvbyqlcny |
| platform_region | 'jp' | 'us' |
| 사용자 인증 | 독립적 | 독립적 |
| 데이터 저장소 | 완전 분리 | 완전 분리 |
| 통합 관리 | API 호출로 가능 | API 호출로 가능 |

현재 설정으로 **JP와 US는 완전히 분리**되어 있으며, 필요시 **통합 관리 대시보드**를 별도로 구축하여 두 지역 데이터를 함께 볼 수 있습니다.

