import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react'

const LoginPageExactReplica = () => {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 로그인 후 리다이렉트할 경로
  const from = location.state?.from?.pathname || '/'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください。')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      await signInWithEmail(formData.email, formData.password)
      
      // 로그인 성공 시 리다이렉트
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)
      
      // 에러 메시지 번역
      let errorMessage = error.message
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'メール認証が必要です。メールを確認してください。'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      await signInWithGoogle()
      // 구글 로그인은 리다이렉트되므로 여기서 navigate 하지 않음
    } catch (error) {
      console.error('Google login error:', error)
      setError('Googleログインに失敗しました。再度お試しください。')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 뒤로가기 버튼 - 참조 사이트와 동일한 스타일 */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 bg-green-100 border-green-300 hover:bg-green-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
        </div>

        {/* 로그인 카드 - 참조 사이트와 정확히 일치 */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="text-4xl mb-4">🎬</div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              ログイン
            </CardTitle>
            <CardDescription className="text-gray-600">
              CNEC Japanアカウントでログインしてください
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 구글 로그인 - 참조 사이트와 동일한 스타일 */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading || loading}
              className="w-full bg-blue-600 text-white border-0 hover:bg-blue-700 py-3"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Googleでログイン
            </Button>

            {/* 구분선 - 참조 사이트와 동일 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-orange-500 font-medium">
                  または
                </span>
              </div>
            </div>

            {/* 이메일 로그인 폼 - 참조 사이트와 정확히 일치 */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-orange-600 font-medium">
                  メールアドレス
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="メールアドレスを入力してください"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-600 font-medium">
                  パスワード
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="パスワードを入力してください"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                ログイン
              </Button>
            </form>

            {/* 회원가입 링크 - 참조 사이트와 동일 */}
            <div className="text-center text-sm">
              <span className="text-gray-600">
                アカウントをお持ちでないですか？
              </span>{' '}
              <Link to="/signup" className="text-red-600 hover:text-red-700 font-medium underline">
                新規登録
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPageExactReplica
