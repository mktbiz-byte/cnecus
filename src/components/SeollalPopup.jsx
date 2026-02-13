import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Mail, AlertTriangle, CheckCircle } from 'lucide-react'

const STORAGE_KEY = 'seollal-2026-popup-dismissed'

// Popup visible: Feb 13, 2026 00:00 UTC ~ Feb 19, 2026 00:00 UTC
const SHOW_FROM = new Date('2026-02-13T00:00:00Z')
const SHOW_UNTIL = new Date('2026-02-19T00:00:00Z')

const SeollalPopup = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const now = new Date()
    if (now < SHOW_FROM || now >= SHOW_UNTIL) return

    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-rose-600 to-red-500 px-6 pt-6 pb-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              Happy Seollal!
            </DialogTitle>
            <DialogDescription className="text-rose-100 text-sm mt-1">
              Korean Lunar New Year 2026
            </DialogDescription>
          </DialogHeader>
          <p className="text-rose-100 text-xs mt-3 leading-relaxed">
            Seollal is Korea's most important traditional holiday — similar to
            Thanksgiving and New Year's combined. Our Korea-based team will be
            taking a short break to celebrate with their families.
          </p>
        </div>

        {/* Info cards */}
        <div className="px-6 py-4 space-y-3">
          {/* Holiday Period */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <Calendar className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Holiday Period</p>
              <p className="text-sm text-muted-foreground">
                February 16 – 18, 2026 (Mon – Wed)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                National holiday in South Korea (3 days)
              </p>
            </div>
          </div>

          {/* Support Closure */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Customer Service Closure</p>
              <p className="text-sm text-muted-foreground">
                Feb 14 (Fri) – Feb 18 (Wed)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last support available: Thu Feb 12, 11:00 PM PST / Fri Feb 13, 2:00 AM EST
              </p>
            </div>
          </div>

          {/* We're Back */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
            <Mail className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">We're Back On</p>
              <p className="text-sm text-muted-foreground">
                Thursday, February 19, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                All inquiries will be responded to in order received
              </p>
            </div>
          </div>

          {/* Campaign operations continue */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Campaigns Continue as Scheduled</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Campaign applications and operations remain automated during the holiday.
                If you've been selected for a campaign, please continue your activities
                according to the campaign schedule.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Campaign reviews, payment processing, and support replies will be
              paused during the holiday. Thank you for your patience!
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-5">
          <Button onClick={handleClose} className="w-full">
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SeollalPopup
