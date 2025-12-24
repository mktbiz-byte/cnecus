import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

const WithdrawalHistory = ({ userId }) => {
  const { language } = useLanguage()
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)

  // Multi-language texts
  const texts = {
    en: {
      loading: 'Loading withdrawal history...',
      noHistory: 'No withdrawal history found.',
      requestDate: 'Requested:',
      processedDate: 'Processed:',
      status: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        rejected: 'Rejected'
      }
    },
    ko: {
      loading: '출금 내역을 불러오는 중...',
      noHistory: '출금 신청 내역이 없습니다.',
      requestDate: '신청일:',
      processedDate: '처리일:',
      status: {
        pending: '처리 중',
        processing: '진행 중',
        completed: '완료됨',
        rejected: '거절됨'
      }
    },
    ja: {
      loading: '出金履歴を読み込み中...',
      noHistory: '出金申請履歴はありません。',
      requestDate: '申請日:',
      processedDate: '処理日:',
      status: {
        pending: '処理中',
        processing: '進行中',
        completed: '完了',
        rejected: '拒否'
      }
    }
  }

  const t = texts[language] || texts.en

  useEffect(() => {
    const loadWithdrawals = async () => {
      try {
        setLoading(true)
        const data = await database.withdrawals.getByUser(userId)
        setWithdrawals(data || [])
      } catch (error) {
        console.error('Withdrawal history load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWithdrawals()
  }, [userId])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t.status.pending },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: t.status.processing },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: t.status.completed },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: t.status.rejected }
    }

    const style = statusStyles[status] || statusStyles.pending

    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">{t.loading}</span>
      </div>
    )
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.noHistory}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => (
        <Card key={withdrawal.id} className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {formatCurrency(withdrawal.amount)}
                  </h4>
                  {getStatusBadge(withdrawal.status)}
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    {t.requestDate} {formatDate(withdrawal.requested_at)}
                  </p>
                  {withdrawal.processed_at && (
                    <p>
                      {t.processedDate} {formatDate(withdrawal.processed_at)}
                    </p>
                  )}
                  <p className="mt-1">
                    PayPal: {withdrawal.bank_info?.paypal_email}
                  </p>
                </div>

                {withdrawal.notes && (
                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                    {withdrawal.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default WithdrawalHistory
