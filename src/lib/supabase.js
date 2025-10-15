import { createClient } from '@supabase/supabase-js'

// Supabase 설정 - 환경변수 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

// 현재 사이트 URL 감지
const getCurrentSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

// Supabase 클라이언트 생성 - 네트워크 안정성 개선
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${getCurrentSiteUrl()}/auth/callback`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-my-custom-header': 'cnec-platform',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    })
  }
})

// 인증 관련 함수들
export const auth = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('getCurrentUser 오류:', error)
      throw error
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('getSession 오류:', error)
      throw error
    }
  },

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getCurrentSiteUrl()}/auth/callback`
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Google 로그인 오류:', error)
      throw error
    }
  },

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('이메일 로그인 오류:', error)
      throw error
    }
  },

  async signUpWithEmail(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('이메일 회원가입 오류:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 재시도 로직이 포함된 안전한 쿼리 함수
const safeQuery = async (queryFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await queryFn()
      return result
    } catch (error) {
      console.warn(`쿼리 시도 ${i + 1}/${retries} 실패:`, error.message)
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.warn('권한 오류로 인해 빈 결과 반환')
        return []
      }
      
      if (i === retries - 1) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// 데이터베이스 관련 함수들
export const database = {
  // 캠페인 관련
  campaigns: {
    async getAll() {
      return safeQuery(async () => {
        console.log('Supabase campaigns.getAll() 호출')
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Campaigns getAll error:', error)
          throw error
        }
        
        console.log('Campaigns 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      })
    },

    async getActive() {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        if (error) throw error
        return data
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return data
      })
    },

    async create(campaignData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async update(id, updates) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async delete(id) {
      return safeQuery(async () => {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id)
        if (error) throw error
      })
    }
  },

  // 신청 관련 - campaign_applications 테이블 사용
  applications: {
    async getAll() {
      return safeQuery(async () => {
        console.log('Applications getAll() 호출 - applications 테이블 직접 조회')
        
        try {
          // applications 테이블에서 직접 데이터 조회
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (appsError) {
            console.error('Applications 테이블 조회 오류:', appsError)
            if (appsError.message.includes('permission denied')) {
              return []
            }
            throw appsError
          }
          
          if (!appsData || appsData.length === 0) {
            console.log('Applications 테이블에 데이터 없음')
            return []
          }
          
          console.log('Applications 데이터 로드 성공:', appsData.length, '개')
          
          // 사용자 프로필 정보 별도 조회
          const { data: userProfiles } = await supabase
            .from('user_profiles')
            .select('*')
          
          // 캠페인 정보 별도 조회
          const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, title')
          
          // 데이터 병합
          const enrichedData = appsData.map(application => {
            const userProfile = userProfiles?.find(up => up.user_id === application.user_id)
            const campaign = campaigns?.find(c => c.id === application.campaign_id)
            
            return {
              ...application,
              user_name: userProfile?.name || application.applicant_name || '-',
              user_email: userProfile?.email || '-',
              user_age: userProfile?.age || application.age || '-',
              user_skin_type: userProfile?.skin_type || application.skin_type || '-',
              user_instagram_url: userProfile?.instagram_url || application.instagram_url || '',
              user_tiktok_url: userProfile?.tiktok_url || application.tiktok_url || '',
              user_youtube_url: userProfile?.youtube_url || application.youtube_url || '',
              user_bio: userProfile?.bio || application.bio || '',
              campaign_title: campaign?.title || '캠페인 정보 없음'
            }
          })
          
          return enrichedData
        } catch (error) {
          console.error('Applications getAll 함수 오류:', error)
          return []
        }
      })
    },

    async getByUser(userId) {
      return safeQuery(async () => {
        console.log('getByUser 호출 - 사용자 ID:', userId)
        
        try {
          // 먼저 기존 applications 테이블 확인 (우선순위)
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          
          if (!appsError && appsData && appsData.length > 0) {
            console.log('Applications에서 사용자 데이터 발견:', appsData.length, '개')
            
            // 캠페인 정보도 함께 가져오기
            const campaignIds = [...new Set(appsData.map(app => app.campaign_id).filter(Boolean))]
            if (campaignIds.length > 0) {
              const { data: campaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('id, title')
                .in('id', campaignIds)

              if (!campaignsError && campaigns) {
                const applicationsWithCampaigns = appsData.map(app => {
                  const campaign = campaigns.find(c => c.id === app.campaign_id)
                  return {
                    ...app,
                    campaign_title: campaign ? campaign.title : 'Unknown Campaign'
                  }
                })
                return applicationsWithCampaigns
              }
            }
            
            return appsData
          }
          
          // applications 테이블이 비어있으면 campaign_applications 테이블 확인 (백업)
          console.log('Applications 테이블에서 사용자 데이터 없음, Campaign Applications 테이블 확인')
          try {
            const { data: campaignAppsData, error: campaignAppsError } = await supabase
              .from('campaign_applications')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
            
            if (!campaignAppsError && campaignAppsData && campaignAppsData.length > 0) {
              console.log('Campaign Applications에서 사용자 데이터 발견:', campaignAppsData.length, '개')
              const campaignIds = campaignAppsData.map(app => app.campaign_id)
              const { data: campaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('id, title')
                .in('id', campaignIds)

              if (campaignsError) {
                console.error('Error fetching campaigns:', campaignsError)
                return campaignAppsData // Return applications without campaign titles
              }

              const applicationsWithCampaigns = campaignAppsData.map(app => {
                const campaign = campaigns.find(c => c.id === app.campaign_id)
                return {
                  ...app,
                  campaign_title: campaign ? campaign.title : 'Unknown Campaign'
                }
              })
              return applicationsWithCampaigns
            }
          } catch (campaignError) {
            console.warn('Campaign Applications 테이블 접근 실패:', campaignError)
          }
          
          // 둘 다 실패하면 빈 배열 반환
          console.log('두 테이블 모두에서 사용자 데이터 없음')
          return []
          
        } catch (error) {
          console.error('getByUser 전체 오류:', error)
          return []
        }
      })
    },

    async getByCampaign(campaignId) {
      return safeQuery(async () => {
        console.log('getByCampaign 호출 - 캠페인 ID:', campaignId)
        
        try {
          // 먼저 applications 테이블 확인 (우선순위)
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
          
          if (!appsError && appsData && appsData.length > 0) {
            console.log('Applications에서 데이터 발견:', appsData.length, '개')
            
            // 사용자 프로필 정보 별도 조회
            const userIds = [...new Set(appsData.map(app => app.user_id).filter(Boolean))]
            let userProfiles = []
            
            if (userIds.length > 0) {
              const { data: profiles, error: profilesError } = await supabase
                .from('user_profiles')
                .select('*')
                .in('user_id', userIds)
              
              if (!profilesError && profiles) {
                userProfiles = profiles
              }
            }
            
            // 데이터 병합
            const enrichedData = appsData.map(application => {
              const userProfile = userProfiles.find(up => up.user_id === application.user_id)
              
              return {
                ...application,
                // 사용자 프로필 정보 우선, 없으면 application 데이터 사용
                applicant_name: userProfile?.name || application.applicant_name || '-',
                age: userProfile?.age || application.age || '-',
                skin_type: userProfile?.skin_type || application.skin_type || '-',
                instagram_url: userProfile?.instagram_url || application.instagram_url || '',
                tiktok_url: userProfile?.tiktok_url || application.tiktok_url || '',
                youtube_url: userProfile?.youtube_url || application.youtube_url || '',
                other_sns_url: userProfile?.other_sns_url || application.other_sns_url || '',
                // 사용자 프로필 정보 추가
                user_profiles: userProfile
              }
            })
            
            return enrichedData
          }
          
          // applications가 비어있으면 campaign_applications 테이블 확인 (백업)
          console.log('Applications 테이블에서 데이터 없음, Campaign Applications 테이블 확인')
          const { data: campaignAppsData, error: campaignAppsError } = await supabase
            .from('campaign_applications')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
          
          if (!campaignAppsError && campaignAppsData && campaignAppsData.length > 0) {
            console.log('Campaign Applications에서 데이터 발견:', campaignAppsData.length, '개')
            return campaignAppsData
          }
          
          // 둘 다 실패하면 오류 처리
          if (appsError && campaignAppsError) {
            console.error('두 테이블 모두 접근 실패:', { appsError, campaignAppsError })
            if (appsError.message.includes('permission denied') || campaignAppsError.message.includes('permission denied')) {
              return []
            }
            throw appsError
          }
          
          console.log('두 테이블 모두에서 데이터 없음')
          return []
        } catch (error) {
          console.error('getByCampaign 함수 오류:', error)
          return []
        }
      })
    },

    async getByUserAndCampaign(userId, campaignId) {
      return safeQuery(async () => {
        console.log('getByUserAndCampaign 호출 - applications 테이블 사용:', { userId, campaignId })
        
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .eq('campaign_id', campaignId)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('getByUserAndCampaign 오류:', error)
          return null
        }
        
        console.log('기존 신청서 조회 결과:', data)
        return data
      })
    },

    async create(applicationData) {
      return safeQuery(async () => {
        console.log('Application 생성 시작 - applications 테이블 사용:', applicationData)
        const { data, error } = await supabase
          .from('applications')
          .insert([applicationData])
          .select()
          .single()
        
        if (error) {
          console.error('Application 생성 오류:', error)
          throw error
        }
        
        console.log('Application 생성 성공:', data)
        return data
      })
    },

    async updateStatus(id, status) {
      return safeQuery(async () => {
        console.log('상태 업데이트 시작:', id, status)
        
        const updateData = { 
          status,
          updated_at: new Date().toISOString()
        }

        // 상태별 타임스탬프 추가 (컬럼이 존재하는 경우에만)
        if (status === 'virtual_selected') {
          updateData.virtual_selected_at = new Date().toISOString()
        } else if (status === 'approved') {
          updateData.approved_at = new Date().toISOString()
        } else if (status === 'rejected') {
          updateData.rejected_at = new Date().toISOString()
        } else if (status === 'pending') {
          // 가상선택 취소 시 타임스탬프 제거
          updateData.virtual_selected_at = null
          updateData.approved_at = null
          updateData.rejected_at = null
        }

        // applications 테이블을 우선 사용 (실제 데이터가 있는 테이블)
        let { data, error } = await supabase
          .from('applications')
          .update(updateData)
          .eq('id', id)
          .select()
        
        // applications 테이블에서 실패하면 campaign_applications 테이블 시도
        if (error || !data || data.length === 0) {
          console.log('applications 테이블 업데이트 실패, campaign_applications 테이블 시도')
          const result = await supabase
            .from('campaign_applications')
            .update(updateData)
            .eq('id', id)
            .select()
          
          data = result.data
          error = result.error
        }
        
        if (error) {
          console.error('상태 업데이트 오류:', error)
          throw error
        }
        
        console.log('상태 업데이트 성공:', data)
        return data && data.length > 0 ? data[0] : null
      })
    },

    async update(id, updateData) {
      return safeQuery(async () => {
        console.log('신청서 업데이트 시작:', id, updateData)
        
        // applications 테이블을 우선 사용 (실제 데이터가 있는 테이블)
        let { data, error } = await supabase
          .from('applications')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
        
        // applications 테이블에서 실패하면 campaign_applications 테이블 시도
        if (error || !data || data.length === 0) {
          console.log('applications 테이블 업데이트 실패, campaign_applications 테이블 시도')
          const result = await supabase
            .from('campaign_applications')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
          
          data = result.data
          error = result.error
        }
        
        if (error) {
          console.error('신청서 업데이트 오류:', error)
          throw error
        }
        
        console.log('신청서 업데이트 성공:', data)
        return data && data.length > 0 ? data[0] : null
      })
    },

    async requestPoints(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaign_applications')
          .update({ 
            points_requested: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
        if (error) throw error
        return data && data.length > 0 ? data[0] : null
      })
    },

    async getByCampaign(campaignId) {
      return safeQuery(async () => {
        console.log('캠페인별 신청서 조회:', campaignId)
        const { data, error } = await supabase
          .from('campaign_applications')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('캠페인별 신청서 조회 오류:', error)
          throw error
        }
        
        console.log('캠페인별 신청서 조회 성공:', data?.length || 0, '개')
        
        // 사용자 프로필 정보 별도 조회
        const { data: userProfiles } = await supabase
          .from('user_profiles')
          .select('*')
        
        // 사용자 프로필 정보를 신청서 데이터와 병합
        const enrichedData = (data || []).map(application => {
          const userProfile = userProfiles?.find(up => up.user_id === application.user_id)
          
          return {
            ...application,
            applicant_name: userProfile?.name || application.applicant_name || '-',
            age: userProfile?.age || application.age || '-',
            skin_type: userProfile?.skin_type || application.skin_type || '-',
            instagram_url: userProfile?.instagram_url || application.instagram_url || '',
            tiktok_url: userProfile?.tiktok_url || application.tiktok_url || '',
            youtube_url: userProfile?.youtube_url || application.youtube_url || '',
            other_sns_url: userProfile?.other_sns_url || application.other_sns_url || ''
          }
        })
        
        return enrichedData
      })
    }
  },

  // 사용자 프로필 관련
  userProfiles: {
    async get(userId) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        return data
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', id)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        return data
      })
    },

    async getAll() {
      return safeQuery(async () => {
        console.log('UserProfiles getAll() 호출')
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('UserProfiles getAll error:', error)
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            console.warn('권한 부족으로 인해 빈 배열 반환')
            return []
          }
          throw error
        }
        
        console.log('UserProfiles 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      })
    },

    async upsert(profileData) {
      return safeQuery(async () => {
        console.log('Upsert 시작:', profileData)
        
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', profileData.user_id)
          .single()
        
        if (existingProfile) {
          console.log('기존 프로필 업데이트:', existingProfile.id)
          const { data, error } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', profileData.user_id)
            .select()
            .single()
          
          if (error) throw error
          return data
        } else {
          console.log('새 프로필 생성')
          const { data, error } = await supabase
            .from('user_profiles')
            .insert([{
              ...profileData,
              email: profileData.email || 'unknown@example.com'
            }])
            .select()
            .single()
          
          if (error) throw error
          return data
        }
      })
    },

    async update(userId, updateData) {
      return safeQuery(async () => {
        console.log('사용자 프로필 업데이트:', { userId, updateData })
        
        // user_id로 먼저 시도
        let { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
        
        if (error || !data || data.length === 0) {
          console.log('user_id로 업데이트 실패, id로 재시도:', error)
          
          // id로 재시도
          const result = await supabase
            .from('user_profiles')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
          
          data = result.data
          error = result.error
        }
        
        if (error) {
          console.error('프로필 업데이트 최종 실패:', error)
          throw error
        }
        
        console.log('프로필 업데이트 성공:', data)
        return data && data.length > 0 ? data[0] : null
      })
    }
  },

  // 사용자 관련 (userProfiles 별칭)
  users: {
    async getAll() {
      console.log('Supabase users.getAll() 호출 (user_profiles 별칭)')
      return database.userProfiles.getAll()
    }
  },

  // 이메일 템플릿 관련
  emailTemplates: {
    async getAll() {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('template_type', { ascending: true })
        if (error) throw error
        return data || []
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return data
      })
    },

    async create(templateData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async upsert(templateData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .upsert([templateData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async update(id, updates) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async delete(id) {
      return safeQuery(async () => {
        const { error } = await supabase
          .from('email_templates')
          .delete()
          .eq('id', id)
        if (error) throw error
      })
    },

    async getByCategory(category) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('template_type', category)
        if (error) throw error
        return data || []
      })
    }
  },

  // 출금 관련 API
  withdrawals: {
    async getAll() {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select(`
            *,
            user_profiles!withdrawal_requests_user_id_fkey(name, email)
          `)
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      })
    },

    async getByUser(userId) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      })
    },

    async create(withdrawalData) {
      return safeQuery(async () => {
        console.log('출금 신청 데이터:', withdrawalData)
        
        // withdrawal_requests 테이블에 맞는 데이터 구조
        const insertData = {
          user_id: withdrawalData.user_id,
          amount: withdrawalData.amount,
          withdrawal_method: 'paypal',
          paypal_email: withdrawalData.paypal_email,
          paypal_name: withdrawalData.paypal_name,
          reason: withdrawalData.reason || 'ポイント出金申請',
          status: 'pending'
        }
        
        console.log('삽입할 데이터:', insertData)
        
        const { data, error } = await supabase
          .from('withdrawal_requests')
          .insert([insertData])
          .select()
          
        if (error) {
          console.error('출금 신청 삽입 오류:', error)
          throw error
        }
        
        console.log('출금 신청 성공:', data)
        return data && data.length > 0 ? data[0] : null
      })
    },

    async updateStatus(id, status, processedBy = null, notes = null) {
      return safeQuery(async () => {
        const updateData = {
          status,
          updated_at: new Date().toISOString()
        }
        
        if (status === 'completed' || status === 'rejected') {
          updateData.processed_at = new Date().toISOString()
          if (processedBy) updateData.processed_by = processedBy
        }
        
        if (notes) updateData.notes = notes

        const { data, error } = await supabase
          .from('withdrawal_requests')
          .update(updateData)
          .eq('id', id)
          .select()
        if (error) throw error
        return data && data.length > 0 ? data[0] : null
      })
    }
  },

  // 은행 이체 관련 API (US 버전에서는 사용하지 않음)
  bankTransfers: {
    async getAll() {
      return safeQuery(async () => {
        console.log('Bank transfers getAll() - US version does not use bank transfers')
        // US 버전에서는 PayPal만 사용하므로 빈 배열 반환
        return []
      })
    }
  },

  // 사용자 포인트 관련 API
  userPoints: {
    async getUserTotalPoints(userId) {
      return safeQuery(async () => {
        console.log('포인트 조회 시작 - 사용자 ID:', userId)
        
        // point_transactions 테이블에서 포인트 합계 계산
        const { data, error } = await supabase
          .from('point_transactions')
          .select('amount')
          .eq('user_id', userId)
        
        if (error) {
          console.error('포인트 조회 오류:', error)
          throw error
        }
        
        console.log('포인트 트랜잭션 데이터:', data)
        
        // 모든 트랜잭션의 합계 계산 (양수는 적립, 음수는 차감)
        const totalPoints = (data || []).reduce((sum, record) => sum + (record.amount || 0), 0)
        
        console.log('총 포인트:', totalPoints)
        return totalPoints
      })
    },

    async getUserPoints(userId) {
      return safeQuery(async () => {
        console.log('포인트 내역 조회 - 사용자 ID:', userId)
        
        // point_transactions 테이블에서 포인트 내역 조회
        const { data, error } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          
        if (error) {
          console.error('포인트 내역 조회 오류:', error)
          throw error
        }
        
        console.log('포인트 내역:', data)
        return data || []
      })
    },

    async deductPoints(userId, amount, reason = '出金申請') {
      return safeQuery(async () => {
        console.log('포인트 차감:', { userId, amount, reason })
        
        // point_transactions 테이블에 차감 기록 추가 (음수로 저장)
        const { data, error } = await supabase
          .from('point_transactions')
          .insert([{
            user_id: userId,
            amount: -amount, // 차감이므로 음수
            transaction_type: 'admin_add',
            description: reason,
            created_at: new Date().toISOString()
          }])
          .select()
          
        if (error) {
          console.error('포인트 차감 오류:', error)
          throw error
        }
        
        console.log('포인트 차감 완료:', data)
        return data && data.length > 0 ? data[0] : null
      })
    }
  }
}

export default supabase
