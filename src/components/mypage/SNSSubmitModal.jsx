import React, { useState, useEffect } from 'react'
import { X, Loader2, Link, Instagram, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

const SNSSubmitModal = ({
  isOpen,
  onClose,
  application,
  campaign,
  onSubmit
}) => {
  const [snsUrl, setSnsUrl] = useState('')
  const [partnershipCode, setPartnershipCode] = useState('')
  const [cleanVideoUrl, setCleanVideoUrl] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const is4Week = campaign?.campaign_type === '4week_challenge'
  const requiresAdCode = campaign?.requires_ad_code || campaign?.meta_ad_code_requested
  const requiresCleanVideo = campaign?.requires_clean_video && !application?.clean_video_url

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSnsUrl('')
      setPartnershipCode('')
      setCleanVideoUrl('')
      setError('')
      // Find the first week without SNS submission
      if (is4Week) {
        for (let i = 1; i <= 4; i++) {
          if (application?.[`week${i}_video_url`] && !application?.[`week${i}_sns_url`]) {
            setSelectedWeek(i)
            break
          }
        }
      }
    }
  }, [isOpen, is4Week, application])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getWeekSnsDeadline = (week) => {
    const customKey = `week${week}_sns_deadline`
    return application?.custom_deadlines?.[customKey] || campaign?.[customKey]
  }

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!snsUrl.trim()) {
      setError('Please enter your SNS post URL')
      return
    }

    if (!isValidUrl(snsUrl)) {
      setError('Please enter a valid URL')
      return
    }

    if (requiresAdCode && !partnershipCode.trim()) {
      setError('Partnership code is required for this campaign')
      return
    }

    if (requiresCleanVideo && cleanVideoUrl && !isValidUrl(cleanVideoUrl)) {
      setError('Please enter a valid clean video URL')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        applicationId: application.id,
        snsUrl,
        partnershipCode: partnershipCode || null,
        cleanVideoUrl: cleanVideoUrl || null,
        weekNumber: is4Week ? selectedWeek : null,
        is4Week
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">📱 Final Submission</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Submit your posted content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Week Selection for 4-Week Challenge */}
          {is4Week && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Select Week <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(week => {
                  const hasVideo = application?.[`week${week}_video_url`]
                  const hasSns = application?.[`week${week}_sns_url`]
                  const deadline = getWeekSnsDeadline(week)
                  const isSelected = selectedWeek === week
                  const canSubmit = hasVideo && !hasSns

                  return (
                    <button
                      key={week}
                      type="button"
                      onClick={() => canSubmit && setSelectedWeek(week)}
                      disabled={!canSubmit}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all min-h-[44px] ${
                        isSelected && canSubmit
                          ? 'border-purple-500 bg-purple-50'
                          : hasSns
                          ? 'border-green-300 bg-green-50 opacity-60'
                          : !hasVideo
                          ? 'border-gray-200 bg-gray-50 opacity-40'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-xs sm:text-sm">Week {week}</div>
                      {deadline && (
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          {formatDate(deadline)}
                        </div>
                      )}
                      {hasSns && (
                        <div className="text-[10px] sm:text-xs text-green-600 mt-1">✓ Done</div>
                      )}
                      {!hasVideo && !hasSns && (
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1">No video</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SNS URL Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              SNS Post URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={snsUrl}
                onChange={(e) => setSnsUrl(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[44px]"
                placeholder="https://www.instagram.com/reel/..."
                required
              />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Paste the direct link to your posted content on Instagram, TikTok, or YouTube.
            </p>

            {/* Platform hints */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {campaign?.target_platforms?.instagram && (
                <span className="text-[10px] sm:text-xs bg-pink-50 text-pink-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">📸 Instagram</span>
              )}
              {campaign?.target_platforms?.tiktok && (
                <span className="text-[10px] sm:text-xs bg-gray-50 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">🎵 TikTok</span>
              )}
              {campaign?.target_platforms?.youtube && (
                <span className="text-[10px] sm:text-xs bg-red-50 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">📺 YouTube</span>
              )}
            </div>
          </div>

          {/* Partnership Code (if required) */}
          {requiresAdCode && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Meta Partnership Code
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-normal text-purple-600 bg-purple-100 px-1.5 sm:px-2 py-0.5 rounded">
                  Required
                </span>
              </label>
              <input
                type="text"
                value={partnershipCode}
                onChange={(e) => setPartnershipCode(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[44px]"
                placeholder="e.g., ABC123XYZ..."
              />

              {/* Instructions Accordion */}
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full mt-2 text-left text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center justify-between min-h-[44px]"
              >
                <span>📝 How to get your Partnership Code</span>
                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInstructions && (
                <div className="mt-2 p-2.5 sm:p-3 bg-purple-50 rounded-lg text-xs sm:text-sm">
                  <ol className="space-y-1.5 sm:space-y-2 text-gray-700">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">1.</span>
                      <span>Go to your Instagram Profile → "Professional Dashboard" → Enable "Branded Content"</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">2.</span>
                      <span>On your posted Reel, tap <strong>"..."</strong> → Select <strong>"Partnership label and ads"</strong></span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">3.</span>
                      <span>Toggle ON <strong>"Get partnership ad code"</strong></span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">4.</span>
                      <span>Tap <strong>"Copy"</strong> to copy the code and paste it here</span>
                    </li>
                  </ol>
                  <div className="mt-2 sm:mt-3 p-2 bg-amber-100 rounded text-amber-800 text-[10px] sm:text-xs">
                    ⚠️ <strong>Important:</strong> Do NOT use Instagram's built-in music. Use royalty-free music edited externally.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clean Video URL (if required and not already submitted) */}
          {requiresCleanVideo && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Clean Video URL
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-normal text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded">
                  Required
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={cleanVideoUrl}
                  onChange={(e) => setCleanVideoUrl(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[44px]"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Video without background music and subtitles for ad usage.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !snsUrl.trim()}
            className="w-full py-2.5 sm:py-3 bg-green-600 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                ✅ Complete Submission
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SNSSubmitModal
