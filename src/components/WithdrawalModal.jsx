import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const WithdrawalModal = ({ isOpen, onClose, userId, availablePoints, onSuccess }) => {
  const { language } = useLanguage()
  const [amount, setAmount] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [paypalName, setPaypalName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Multi-language texts
  const texts = {
    en: {
      title: 'Withdrawal Request',
      description: 'Withdraw your points via PayPal. Please enter accurate information.',
      availablePoints: 'Available Points',
      points: 'points',
      withdrawAmount: 'Withdrawal Amount',
      paypalEmail: 'PayPal Email',
      paypalName: 'PayPal Account Name',
      enterName: 'Enter your PayPal account name',
      nameNote: 'Please enter the name exactly as registered on PayPal.',
      pointConversion: '1 Point = $1.00 USD',
      enterAmount: 'Enter amount to withdraw',
      cancel: 'Cancel',
      submit: 'Submit Request',
      processing: 'Processing...',
      errors: {
        invalidAmount: 'Please enter a valid amount.',
        exceedsPoints: 'You cannot withdraw more than your available points.',
        emailRequired: 'Please enter your PayPal email.',
        nameRequired: 'Please enter your PayPal account name.',
        submitError: 'An error occurred while submitting. Please try again.'
      }
    },
    ko: {
      title: '출금 신청',
      description: 'PayPal을 통해 포인트를 출금합니다. 정확한 정보를 입력해주세요.',
      availablePoints: '보유 포인트',
      points: '포인트',
      withdrawAmount: '출금 금액',
      paypalEmail: 'PayPal 이메일',
      paypalName: 'PayPal 계정 이름',
      enterName: '계정 이름을 입력하세요',
      nameNote: 'PayPal에 등록된 이름을 정확히 입력해주세요.',
      pointConversion: '1포인트 = 1엔으로 환산됩니다.',
      enterAmount: '출금할 금액을 입력하세요',
      cancel: '취소',
      submit: '출금 신청',
      processing: '처리 중...',
      errors: {
        invalidAmount: '유효한 금액을 입력하세요.',
        exceedsPoints: '보유 포인트보다 많은 금액을 출금할 수 없습니다.',
        emailRequired: 'PayPal 이메일을 입력하세요.',
        nameRequired: 'PayPal 계정 이름을 입력하세요.',
        submitError: '출금 신청 중 오류가 발생했습니다. 다시 시도해주세요.'
      }
    },
    ja: {
      title: '出金申請',
      description: 'PayPalを通じてポイントを出金します。正確な情報を入力してください。',
      availablePoints: '保有ポイント',
      points: 'ポイント',
      withdrawAmount: '出金金額',
      paypalEmail: 'PayPalメールアドレス',
      paypalName: 'PayPalアカウント名',
      enterName: 'アカウント名を入力してください',
      nameNote: 'PayPalに登録されている名前を正確に入力してください。',
      pointConversion: '1ポイント = 1円で換算されます。',
      enterAmount: '出金する金額を入力してください',
      cancel: 'キャンセル',
      submit: '出金申請',
      processing: '処理中...',
      errors: {
        invalidAmount: '有効な金額を入力してください。',
        exceedsPoints: '保有ポイント以上の金額を出金することはできません。',
        emailRequired: 'PayPalメールアドレスを入力してください。',
        nameRequired: 'PayPalアカウント名を入力してください。',
        submitError: '出金申請中にエラーが発生しました。もう一度お試しください。'
      }
    }
  }

  const t = texts[language] || texts.en

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Input validation
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      setError(t.errors.invalidAmount)
      return
    }

    if (parseInt(amount) > availablePoints) {
      setError(t.errors.exceedsPoints)
      return
    }

    if (!paypalEmail) {
      setError(t.errors.emailRequired)
      return
    }

    if (!paypalName) {
      setError(t.errors.nameRequired)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create withdrawal request
      await database.withdrawals.create({
        user_id: userId,
        amount: parseInt(amount),
        paypal_email: paypalEmail,
        paypal_name: paypalName
      })

      // Success handling
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Withdrawal request error:', error)
      setError(t.errors.submitError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="available-points">{t.availablePoints}</Label>
            <div className="p-2 bg-gray-50 rounded-md text-gray-700 font-medium">
              {availablePoints.toLocaleString()} {t.points}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t.withdrawAmount} *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={availablePoints}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.enterAmount}
              required
            />
            <p className="text-xs text-gray-500">{t.pointConversion}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-email">{t.paypalEmail} *</Label>
            <Input
              id="paypal-email"
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your-paypal@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-name">{t.paypalName} *</Label>
            <Input
              id="paypal-name"
              value={paypalName}
              onChange={(e) => setPaypalName(e.target.value)}
              placeholder={t.enterName}
              required
            />
            <p className="text-xs text-gray-500">{t.nameNote}</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.processing}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default WithdrawalModal
