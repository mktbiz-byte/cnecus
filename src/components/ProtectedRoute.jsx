import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { database } from '../lib/supabase'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      if (!requireAdmin) {
        setLoading(false)
        return
      }

      // 재시도 로직 추가
      let retries = 3
      let profile = null
      
      while (retries > 0 && !profile) {
        try {
          console.log(`관리자 권한 확인 시도 (${4 - retries}/3)...`)
          // 사용자 프로필에서 관리자 권한 확인
          profile = await database.userProfiles.get(user.id)
          
          if (profile) {
            console.log('프로필 로드 성공:', profile)
            if (profile.role === 'admin' || profile.is_admin === true) {
              setIsAdmin(true)
            } else {
              console.log('관리자 권한 없음:', profile.role)
              setIsAdmin(false)
            }
            break
          }
        } catch (error) {
          console.error(`관리자 권한 확인 오류 (시도 ${4 - retries}/3):`, error)
          retries--
          
          if (retries > 0) {
            // 재시도 전 대기
            await new Promise(resolve => setTimeout(resolve, 500))
          } else {
            // 모든 재시도 실패
            console.error('모든 재시도 실패. Access Denied 표시.')
            setIsAdmin(false)
          }
        }
      }
      
      setLoading(false)
    }

    checkAdminStatus()
  }, [user, requireAdmin])

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 관리자 권한이 필요한데 관리자가 아닌 경우
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. This page is only available to administrators.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // 권한이 있는 경우 자식 컴포넌트 렌더링
  return children
}

export default ProtectedRoute

