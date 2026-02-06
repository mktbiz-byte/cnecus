import React, { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'

// Status configuration
const STATUS_CONFIG = {
  'pending': { label: 'Applied', icon: '⏳', color: 'bg-gray-100 text-gray-800', step: 0 },
  'selected': { label: 'Reviewing Guide', icon: '📋', color: 'bg-purple-100 text-purple-800', step: 1 },
  'filming': { label: 'Filming', icon: '🎬', color: 'bg-amber-100 text-amber-800', step: 2 },
  'video_submitted': { label: 'Video Submitted', icon: '📤', color: 'bg-blue-100 text-blue-800', step: 3 },
  'revision_requested': { label: 'Revision Requested', icon: '⚠️', color: 'bg-red-100 text-red-800', step: 3 },
  'approved': { label: 'Approved', icon: '✅', color: 'bg-green-100 text-green-800', step: 4 },
  'sns_uploaded': { label: 'SNS Posted', icon: '📱', color: 'bg-teal-100 text-teal-800', step: 5 },
  'completed': { label: 'Completed', icon: '🎉', color: 'bg-emerald-100 text-emerald-800', step: 6 }
}

const PROGRESS_STEPS = [
  { key: 'selected', label: 'Guide' },
  { key: 'filming', label: 'Film' },
  { key: 'video_submitted', label: 'Submit' },
  { key: 'approved', label: 'Approve' },
  { key: 'sns_uploaded', label: 'SNS' },
  { key: 'completed', label: 'Done' }
]

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return `$${(amount || 0).toLocaleString()}`
}

// Progress Stepper Component
const ProgressStepper = ({ currentStatus }) => {
  const currentStep = STATUS_CONFIG[currentStatus]?.step || 0

  return (
    <div className="flex items-center justify-between py-4 px-2">
      {PROGRESS_STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = currentStep > stepNumber
        const isCurrent = currentStep === stepNumber
        const isRevision = currentStatus === 'revision_requested' && step.key === 'video_submitted'

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? isRevision
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : isRevision ? '!' : stepNumber}
              </div>
              <span className={`text-xs mt-1 ${isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {index < PROGRESS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 rounded ${
                  currentStep > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Deadlines Section Component
const DeadlinesSection = ({ campaign, application }) => {
  const is4Week = campaign?.campaign_type === '4week_challenge'
  const customDeadlines = application?.custom_deadlines || {}

  const getEffectiveDeadline = (weekNum, type) => {
    const customKey = `week${weekNum}_${type}`
    return customDeadlines[customKey] || campaign?.[customKey]
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-purple-600" />
        Important Deadlines
      </h4>

      {is4Week ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(week => {
            const videoDeadline = getEffectiveDeadline(week, 'deadline')
            const snsDeadline = getEffectiveDeadline(week, 'sns_deadline')
            if (!videoDeadline && !snsDeadline) return null

            return (
              <div key={week} className="bg-white p-2 rounded border text-xs">
                <div className="font-medium text-orange-600 mb-1">Week {week}</div>
                {videoDeadline && (
                  <div className="text-gray-600">🎬 {formatDate(videoDeadline)}</div>
                )}
                {snsDeadline && (
                  <div className="text-gray-600">📱 {formatDate(snsDeadline)}</div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          {campaign?.video_deadline && (
            <div className="flex justify-between">
              <span className="text-gray-600">🎬 Video Deadline:</span>
              <span className="font-medium">{formatDate(campaign.video_deadline)}</span>
            </div>
          )}
          {campaign?.sns_deadline && (
            <div className="flex justify-between">
              <span className="text-gray-600">📱 SNS Deadline:</span>
              <span className="font-medium">{formatDate(campaign.sns_deadline)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Weekly Submission Status for 4-Week Challenge
const WeeklySubmissionStatus = ({ application, campaign }) => {
  if (campaign?.campaign_type !== '4week_challenge') return null

  const requiresCleanVideo = campaign?.requires_clean_video
  const requiresAdCode = campaign?.requires_ad_code || campaign?.meta_ad_code_requested

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
      <h4 className="text-sm font-semibold text-orange-700 mb-2">📅 Weekly Progress</h4>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(week => {
          const hasGuide = !!(application[`week${week}_guide_drive_url`] || application[`week${week}_guide_slides_url`])
          const videoSubmitted = !!application[`week${week}_video_url`]
          const cleanVideoSubmitted = !!application[`week${week}_clean_video_url`]
          const snsSubmitted = !!application[`week${week}_sns_url`]
          const hasPartnershipCode = !!application[`week${week}_partnership_code`]
          const isComplete = videoSubmitted && snsSubmitted

          return (
            <div
              key={week}
              className={`p-2 rounded text-center text-xs ${
                isComplete
                  ? 'bg-green-100 border-green-300'
                  : videoSubmitted
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-white border-gray-200'
              } border`}
            >
              <div className="font-medium mb-1">W{week}</div>
              <div className={hasGuide ? 'text-purple-600' : 'text-gray-400'}>
                {hasGuide ? '📋' : '⬜'} Guide
              </div>
              <div className={videoSubmitted ? 'text-green-600' : 'text-gray-400'}>
                {videoSubmitted ? '✅' : '⬜'} Vid
              </div>
              {requiresCleanVideo && (
                <div className={cleanVideoSubmitted ? 'text-blue-600' : 'text-gray-400'}>
                  {cleanVideoSubmitted ? '✅' : '⬜'} Clean
                </div>
              )}
              <div className={snsSubmitted ? 'text-green-600' : 'text-gray-400'}>
                {snsSubmitted ? '✅' : '⬜'} SNS
              </div>
              {requiresAdCode && (
                <div className={hasPartnershipCode ? 'text-purple-600' : 'text-gray-400'}>
                  {hasPartnershipCode ? '✅' : '⬜'} Code
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Campaign Progress Card Component
const CampaignProgressCard = ({
  application,
  campaign,
  onViewGuide,
  onUploadVideo,
  onSubmitSNS,
  onViewRevisions
}) => {
  const [expanded, setExpanded] = useState(true)
  const status = application?.status || 'pending'
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['pending']
  const is4Week = campaign?.campaign_type === '4week_challenge'
  const hasRevisions = application?.revision_requests?.length > 0

  // Only show for active campaigns (not pending)
  const isActive = ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(status)

  if (!isActive) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-4">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {campaign?.image_url ? (
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl">
                ✨
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {campaign?.title_en || campaign?.title}
              </h3>
              <p className="text-sm text-purple-600">{campaign?.brand_en || campaign?.brand}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(campaign?.reward_amount)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  is4Week ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {is4Week ? '4-Week' : 'Standard'}
                </span>
              </div>
              {application?.main_channel && (
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    application.main_channel === 'instagram'
                      ? 'bg-pink-100 text-pink-700 border border-pink-200'
                      : application.main_channel === 'youtube'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {application.main_channel === 'instagram' ? '📸 Instagram'
                      : application.main_channel === 'youtube' ? '📺 YouTube'
                      : '🎵 TikTok'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 mt-2" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 mt-2" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-gray-100">
          {/* Progress Stepper */}
          <ProgressStepper currentStatus={status} />

          {/* Revision Alert */}
          {status === 'revision_requested' && hasRevisions && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">Revision Requested</p>
                <p className="text-xs text-red-600 mt-1">
                  Please review the feedback and re-upload your video.
                </p>
                <button
                  onClick={() => onViewRevisions?.(application)}
                  className="text-xs text-red-700 underline mt-1"
                >
                  View {application.revision_requests.length} revision request(s)
                </button>
              </div>
            </div>
          )}

          {/* 4-Week Challenge Progress */}
          {is4Week && <WeeklySubmissionStatus application={application} campaign={campaign} />}

          {/* Deadlines */}
          <DeadlinesSection campaign={campaign} application={application} />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* View Guide - Always available */}
            <button
              onClick={() => onViewGuide?.(application, campaign)}
              className="px-3 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              📋 View Guide
            </button>

            {/* Upload Video - filming or revision_requested */}
            {['filming', 'revision_requested', 'selected'].includes(status) && (
              <button
                onClick={() => onUploadVideo?.(application, campaign)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  status === 'revision_requested'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {status === 'revision_requested' ? '🔄 Re-upload Video' : '📤 Upload Video'}
              </button>
            )}

            {/* Submit SNS - approved or video_submitted */}
            {['approved', 'video_submitted'].includes(status) && (
              <button
                onClick={() => onSubmitSNS?.(application, campaign)}
                className="px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                📱 Submit SNS Link
              </button>
            )}

            {/* View Submitted Content */}
            {application.video_url && (
              <a
                href={application.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔗 View Video
              </a>
            )}

            {application.sns_upload_url && (
              <a
                href={application.sns_upload_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
              >
                📱 View SNS Post
              </a>
            )}
          </div>

          {/* Special Requirements */}
          {(campaign?.requires_ad_code || campaign?.meta_ad_code_requested || campaign?.requires_clean_video) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(campaign.requires_ad_code || campaign.meta_ad_code_requested) && (
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">
                  📱 Ad Code Required
                </span>
              )}
              {campaign.requires_clean_video && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  🎞️ Clean Video Required
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CampaignProgressCard
