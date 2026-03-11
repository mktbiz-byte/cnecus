import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../contexts/LanguageContext'
import AdminNavigation from './AdminNavigation'
import {
  Search, RefreshCw, Check, X, Calendar, DollarSign,
  CreditCard, AlertCircle, CheckCircle, Clock, Filter
} from 'lucide-react'

// 날짜 유틸: YYYY-MM-DD 포맷
const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 기본 날짜 범위: 최근 2주 (하우랩 1개월 제한 대응)
const getDefaultDateRange = () => {
  const today = new Date()
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(today.getDate() - 14)
  return {
    startDate: formatDate(twoWeeksAgo),
    endDate: formatDate(today)
  }
}

// 날짜 범위 유효성 검증: 최대 31일
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 0) {
    return { valid: false, message: '시작일이 종료일보다 이후입니다.' }
  }
  if (diffDays > 31) {
    return { valid: false, message: '조회 기간은 최대 31일까지 가능합니다. (하우랩 API 제한)' }
  }
  return { valid: true, message: '' }
}

const AdminPointsCharge = () => {
  const { language } = useLanguage()

  // 날짜 필터 상태 - 매번 현재 시간 기준으로 초기화
  const [dateRange, setDateRange] = useState(getDefaultDateRange)
  const [dateError, setDateError] = useState('')

  // 데이터 상태
  const [chargeRequests, setChargeRequests] = useState([])
  const [bankTransactions, setBankTransactions] = useState([])
  const [paymentAccount, setPaymentAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bankLoading, setBankLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // 탭 상태
  const [selectedTab, setSelectedTab] = useState('charge-requests')

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((field, value) => {
    setDateRange(prev => {
      const newRange = { ...prev, [field]: value }
      const validation = validateDateRange(newRange.startDate, newRange.endDate)
      setDateError(validation.valid ? '' : validation.message)
      return newRange
    })
  }, [])

  // 빠른 날짜 설정
  const setQuickDateRange = useCallback((days) => {
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - days)
    const newRange = {
      startDate: formatDate(start),
      endDate: formatDate(today)
    }
    setDateRange(newRange)
    setDateError('')
  }, [])

  // 포인트 충전 요청 로드
  const loadChargeRequests = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('points_charge_requests')
        .select(`
          *,
          companies:company_id(id, company_name)
        `)
        .order('created_at', { ascending: false })

      if (queryError) {
        console.error('충전 요청 로드 오류:', queryError)
        // companies 조인 실패 시 단순 쿼리로 재시도
        const { data: simpleData, error: simpleError } = await supabase
          .from('points_charge_requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (simpleError) throw simpleError
        setChargeRequests(simpleData || [])
      } else {
        setChargeRequests(data || [])
      }

      // 결제 계좌 정보 로드
      const { data: accountData } = await supabase
        .from('payment_accounts')
        .select('*')
        .limit(1)
        .single()

      if (accountData) {
        setPaymentAccount(accountData)
      }

    } catch (err) {
      console.error('데이터 로드 오류:', err)
      setError(`데이터 로드 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 계좌 거래내역 조회 (날짜 필터 적용)
  const loadBankTransactions = async () => {
    const validation = validateDateRange(dateRange.startDate, dateRange.endDate)
    if (!validation.valid) {
      setDateError(validation.message)
      return
    }

    try {
      setBankLoading(true)
      setError('')
      setDateError('')

      console.log('계좌 거래내역 조회:', dateRange.startDate, '~', dateRange.endDate)

      // point_transactions에서 입금(양수) 거래내역 조회 - 날짜 필터 적용
      const startDateTime = `${dateRange.startDate}T00:00:00.000Z`
      const endDateTime = `${dateRange.endDate}T23:59:59.999Z`

      const { data, error: queryError } = await supabase
        .from('point_transactions')
        .select('*')
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError

      setBankTransactions(data || [])
      console.log('거래내역 로드 성공:', (data || []).length, '건')

    } catch (err) {
      console.error('거래내역 조회 오류:', err)
      setError(`거래내역 조회 실패: ${err.message}`)
    } finally {
      setBankLoading(false)
    }
  }

  // 입금 확인 처리
  const confirmDeposit = async (requestId, depositorName = '') => {
    try {
      setError('')
      setSuccess('')

      const { error: updateError } = await supabase
        .from('points_charge_requests')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          depositor_name: depositorName || '확인됨',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      setSuccess('입금이 확인되었습니다.')
      await loadChargeRequests()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('입금 확인 오류:', err)
      setError(`입금 확인 실패: ${err.message}`)
    }
  }

  // 요청 거부 처리
  const rejectRequest = async (requestId) => {
    try {
      setError('')
      setSuccess('')

      const { error: updateError } = await supabase
        .from('points_charge_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      setSuccess('요청이 거부되었습니다.')
      await loadChargeRequests()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('요청 거부 오류:', err)
      setError(`요청 거부 실패: ${err.message}`)
    }
  }

  // 필터링된 충전 요청
  const filteredRequests = chargeRequests.filter(req => {
    const matchesStatus = !statusFilter || req.status === statusFilter
    const matchesSearch = !searchTerm ||
      req.depositor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.bank_transfer_info?.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // 상태별 카운트
  const statusCounts = {
    total: chargeRequests.length,
    pending: chargeRequests.filter(r => r.status === 'pending').length,
    confirmed: chargeRequests.filter(r => r.status === 'confirmed').length,
    rejected: chargeRequests.filter(r => r.status === 'rejected').length
  }

  // 상태 배지 스타일
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '대기중', icon: Clock }
      case 'confirmed':
        return { bg: 'bg-green-100', text: 'text-green-800', label: '입금확인', icon: CheckCircle }
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', label: '거부됨', icon: X }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: AlertCircle }
    }
  }

  useEffect(() => {
    loadChargeRequests()
  }, [])

  // 탭 변경 시 거래내역 자동 로드
  useEffect(() => {
    if (selectedTab === 'bank-transactions') {
      loadBankTransactions()
    }
  }, [selectedTab])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 로드하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="p-6 max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">포인트 충전 관리</h1>
          <p className="text-gray-600">포인트 충전 요청 및 계좌 거래내역을 관리합니다</p>
        </div>

        {/* 결제 계좌 정보 */}
        {paymentAccount && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">입금 계좌 정보</span>
            </div>
            <p className="text-blue-700">
              {paymentAccount.bank_name} {paymentAccount.account_number} ({paymentAccount.account_holder})
            </p>
          </div>
        )}

        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('charge-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'charge-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                충전 요청 ({statusCounts.total})
              </button>
              <button
                onClick={() => setSelectedTab('bank-transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'bank-transactions'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                계좌 거래내역
              </button>
            </nav>
          </div>
        </div>

        {/* 충전 요청 탭 */}
        {selectedTab === 'charge-requests' && (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">전체 요청</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">대기중</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">입금확인</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.confirmed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">거부됨</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 필터 */}
            <div className="bg-white p-4 rounded-lg shadow border mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">모든 상태</option>
                      <option value="pending">대기중</option>
                      <option value="confirmed">입금확인</option>
                      <option value="rejected">거부됨</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="입금자명, 캠페인명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={loadChargeRequests}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>

            {/* 충전 요청 테이블 */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회사/캠페인</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입금자명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제방법</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => {
                      const badge = getStatusBadge(request.status)
                      const BadgeIcon = badge.icon
                      const campaignTitle = request.bank_transfer_info?.campaign_title || '-'

                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.companies?.company_name || '-'}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {campaignTitle}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₩{request.amount?.toLocaleString()}
                            </div>
                            {request.discount_rate > 0 && (
                              <div className="text-xs text-green-600">
                                할인 {request.discount_rate}% (원래 ₩{request.original_amount?.toLocaleString()})
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {request.depositor_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.payment_method === 'bank_transfer' ? '계좌이체' : request.payment_method || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {request.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => confirmDeposit(request.id, request.depositor_name)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  입금확인
                                </button>
                                <button
                                  onClick={() => rejectRequest(request.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                >
                                  거부
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">충전 요청이 없습니다</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* 계좌 거래내역 탭 */}
        {selectedTab === 'bank-transactions' && (
          <>
            {/* 날짜 필터 - 핵심 수정 부분 */}
            <div className="bg-white p-4 rounded-lg shadow border mb-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">조회기간</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={loadBankTransactions}
                      disabled={bankLoading || !!dateError}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Search className={`h-4 w-4 ${bankLoading ? 'animate-spin' : ''}`} />
                      조회
                    </button>
                    <button
                      onClick={loadBankTransactions}
                      disabled={bankLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${bankLoading ? 'animate-spin' : ''}`} />
                      새로고침
                    </button>
                  </div>
                </div>

                {/* 빠른 날짜 선택 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">빠른 선택:</span>
                  <button
                    onClick={() => setQuickDateRange(7)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    최근 1주일
                  </button>
                  <button
                    onClick={() => setQuickDateRange(14)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    최근 2주일
                  </button>
                  <button
                    onClick={() => setQuickDateRange(30)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    최근 1개월
                  </button>
                </div>

                {/* 날짜 유효성 오류 메시지 */}
                {dateError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{dateError}</span>
                  </div>
                )}

                {/* 조회 기간 안내 */}
                <p className="text-xs text-gray-400">
                  * 조회 기간은 최대 31일까지 설정 가능합니다. 기본값: 최근 2주
                </p>
              </div>
            </div>

            {/* 거래내역 테이블 */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              {bankLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">거래내역을 조회하고 있습니다...</p>
                </div>
              ) : (
                <>
                  <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      조회 결과: {bankTransactions.length}건
                    </span>
                    <span className="text-xs text-gray-500">
                      {dateRange.startDate} ~ {dateRange.endDate}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래일시</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래유형</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bankTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(tx.created_at).toLocaleString('ko-KR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {tx.transaction_type || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                              {tx.description || '-'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                              tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.amount >= 0 ? '+' : ''}{tx.amount?.toLocaleString()}P
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {tx.status || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bankTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">해당 기간의 거래내역이 없습니다</p>
                      <p className="text-gray-400 text-sm mt-1">날짜 범위를 확인하고 다시 조회해주세요</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPointsCharge
