import React, { useState, useEffect, useRef } from 'react'
import { X, Loader2, Link, AlertCircle, ChevronDown, ChevronUp, Film, CheckCircle, Trash2, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const SNSSubmitModal = ({
  isOpen,
  onClose,
  application,
  campaign,
  onSubmit
}) => {
  const [snsUrl, setSnsUrl] = useState('')
  const [partnershipCode, setPartnershipCode] = useState('')
  const [cleanVideoFile, setCleanVideoFile] = useState(null)
  const [cleanVideoUploading, setCleanVideoUploading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const cleanVideoInputRef = useRef(null)

  const is4Week = campaign?.campaign_type === '4week_challenge'
  const requiresAdCode = campaign?.partnership_ad_code_required || campaign?.meta_ad_code_requested
  // Check if clean video is required and not yet submitted
  const requiresCleanVideo = campaign?.requires_clean_video && (
    is4Week
      ? !application?.[`week${selectedWeek}_clean_video_url`]
      : !application?.clean_video_url
  )

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSnsUrl('')
      setPartnershipCode('')
      setCleanVideoFile(null)
      setError('')
      // Find the first week without SNS submission
      if (is4Week) {
        for (let i = 1; i <= 4; i++) {
          if (application?.[`week${i}_url`] && !application?.[`week${i}_sns_url`]) {
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const handleCleanVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file')
      return
    }

    const maxSize = 2 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 2GB')
      return
    }

    setError('')
    setCleanVideoFile(file)
  }

  const uploadCleanVideoToSupabase = async (file) => {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const videoSlot = is4Week ? `week${selectedWeek}_clean` : 'clean'
    const fileName = `${videoSlot}_${timestamp}.${fileExt}`
    const filePath = `${application.campaign_id}/${application.user_id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Clean video upload failed: ${uploadError.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    return urlData.publicUrl
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

    if (requiresCleanVideo && !cleanVideoFile) {
      setError('Clean video file is required for this campaign')
      return
    }

    setLoading(true)

    try {
      // Upload clean video file if provided
      let cleanVideoUrl = null
      if (cleanVideoFile) {
        setCleanVideoUploading(true)
        cleanVideoUrl = await uploadCleanVideoToSupabase(cleanVideoFile)
        setCleanVideoUploading(false)
      }

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
      setCleanVideoUploading(false)
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
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Final Submission</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Submit your posted content{requiresCleanVideo ? ' + clean video' : ''}{requiresAdCode ? ' + ad code' : ''}
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
                  const hasVideo = application?.[`week${week}_url`]
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
                        <div className="text-[10px] sm:text-xs text-green-600 mt-1">Done</div>
                      )}
                      {hasVideo && !hasSns && application?.[`week${week}_clean_video_url`] && (
                        <div className="text-[10px] sm:text-xs text-blue-600 mt-1">Clean uploaded</div>
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
                <span className="text-[10px] sm:text-xs bg-pink-50 text-pink-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Instagram</span>
              )}
              {campaign?.target_platforms?.tiktok && (
                <span className="text-[10px] sm:text-xs bg-gray-50 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">TikTok</span>
              )}
              {campaign?.target_platforms?.youtube && (
                <span className="text-[10px] sm:text-xs bg-red-50 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">YouTube</span>
              )}
            </div>
          </div>

          {/* Clean Video File Upload (if required and not already submitted) */}
          {requiresCleanVideo && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Clean Video
                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-normal text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded">
                  Required
                </span>
              </label>

              <input
                ref={cleanVideoInputRef}
                type="file"
                accept="video/*"
                onChange={handleCleanVideoSelect}
                className="hidden"
                disabled={loading}
              />

              {!cleanVideoFile ? (
                <button
                  type="button"
                  onClick={() => cleanVideoInputRef.current?.click()}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-blue-300 rounded-xl p-3 sm:p-4 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-50 transition-all disabled:opacity-50 min-h-[80px]"
                >
                  <div className="flex flex-col items-center">
                    <Film className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-1.5 sm:mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Tap to select clean video</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Video without BGM & subtitles</p>
                  </div>
                </button>
              ) : (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-2.5 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {cleanVideoFile.name}
                        </p>
                        <p className="text-[10px] text-gray-500">{formatFileSize(cleanVideoFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCleanVideoFile(null)}
                      disabled={loading}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-full disabled:opacity-50 flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
                Same video but <strong>without background music and subtitles</strong>. Needed for ad usage.
              </p>
            </div>
          )}

          {/* Already submitted clean video indicator */}
          {campaign?.requires_clean_video && !requiresCleanVideo && (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">Clean video already uploaded</p>
            </div>
          )}

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
                <span>How to get your Partnership Code</span>
                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInstructions && (
                <div className="mt-2 p-2.5 sm:p-3 bg-purple-50 rounded-lg text-xs sm:text-sm">
                  <ol className="space-y-1.5 sm:space-y-2 text-gray-700">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">1.</span>
                      <span>Go to your Instagram Profile &rarr; "Professional Dashboard" &rarr; Enable "Branded Content"</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="font-bold text-purple-600">2.</span>
                      <span>On your posted Reel, tap <strong>"..."</strong> &rarr; Select <strong>"Partnership label and ads"</strong></span>
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
                    <strong>Important:</strong> Do NOT use Instagram's built-in music. Use royalty-free music edited externally.
                  </div>
                </div>
              )}
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
                <span>{cleanVideoUploading ? 'Uploading clean video...' : 'Submitting...'}</span>
              </>
            ) : (
              'Complete Submission'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SNSSubmitModal
