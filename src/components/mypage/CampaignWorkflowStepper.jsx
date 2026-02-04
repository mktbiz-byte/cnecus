import React, { useState, useEffect } from 'react'
import {
  FileText, Video, Upload, ClipboardCheck, Send,
  ChevronDown, ChevronUp, Lock, CheckCircle2, Circle,
  AlertTriangle, Eye, ExternalLink, Calendar, ArrowRight,
  BookOpen, Play, UploadCloud, RefreshCw, Share2
} from 'lucide-react'

/**
 * CampaignWorkflowStepper
 *
 * Strict sequential workflow:
 *   Step 1: PDF / AI Guide 확인
 *   Step 2: 영상 가이드 확인
 *   Step 3: 영상 업로드  (수정사항 경고 포함)
 *   Step 4: 수정사항 체크
 *   Step 5: SNS 업로드 + 클린본 + 광고코드 전달 (3개 동시)
 */

// Workflow step definitions
const WORKFLOW_STEPS = [
  {
    id: 'guide_check',
    number: 1,
    label: 'PDF / AI Guide',
    shortLabel: 'Guide',
    icon: BookOpen,
    color: 'purple',
    description: 'Review the campaign shooting guide carefully'
  },
  {
    id: 'video_guide_check',
    number: 2,
    label: 'Video Guide',
    shortLabel: 'V-Guide',
    icon: Play,
    color: 'indigo',
    description: 'Watch the video guide for shooting instructions'
  },
  {
    id: 'video_upload',
    number: 3,
    label: 'Video Upload',
    shortLabel: 'Upload',
    icon: UploadCloud,
    color: 'blue',
    description: 'Upload your filmed content'
  },
  {
    id: 'revision_check',
    number: 4,
    label: 'Revision Check',
    shortLabel: 'Revision',
    icon: RefreshCw,
    color: 'amber',
    description: 'Review any modification requests'
  },
  {
    id: 'final_delivery',
    number: 5,
    label: 'Final Delivery',
    shortLabel: 'Deliver',
    icon: Share2,
    color: 'green',
    description: 'SNS Upload + Clean Video + Ad Code'
  }
]

// Compute the current workflow step from application status and local confirmations
const computeWorkflowState = (application, campaign, localState) => {
  const status = application?.status || 'pending'
  const {
    guideConfirmed = false,
    videoGuideConfirmed = false
  } = localState || {}

  // If completed or sns_uploaded, everything is done
  if (['completed', 'sns_uploaded'].includes(status)) {
    return {
      currentStep: 6, // all done
      steps: {
        guide_check: 'completed',
        video_guide_check: 'completed',
        video_upload: 'completed',
        revision_check: 'completed',
        final_delivery: status === 'completed' ? 'completed' : 'in_progress'
      }
    }
  }

  // If approved -> step 5 (final delivery)
  if (status === 'approved') {
    return {
      currentStep: 5,
      steps: {
        guide_check: 'completed',
        video_guide_check: 'completed',
        video_upload: 'completed',
        revision_check: 'completed',
        final_delivery: 'active'
      }
    }
  }

  // If revision_requested -> step 4 (revision check)
  if (status === 'revision_requested') {
    return {
      currentStep: 4,
      steps: {
        guide_check: 'completed',
        video_guide_check: 'completed',
        video_upload: 'completed',
        revision_check: 'active',
        final_delivery: 'locked'
      }
    }
  }

  // If video_submitted -> step 4 (waiting for review - revision check shows waiting)
  if (status === 'video_submitted') {
    return {
      currentStep: 4,
      steps: {
        guide_check: 'completed',
        video_guide_check: 'completed',
        video_upload: 'completed',
        revision_check: 'waiting',
        final_delivery: 'locked'
      }
    }
  }

  // If filming or selected -> step 1-3 depending on local confirmations
  if (['filming', 'selected'].includes(status)) {
    if (!guideConfirmed) {
      return {
        currentStep: 1,
        steps: {
          guide_check: 'active',
          video_guide_check: 'locked',
          video_upload: 'locked',
          revision_check: 'locked',
          final_delivery: 'locked'
        }
      }
    }
    if (!videoGuideConfirmed) {
      return {
        currentStep: 2,
        steps: {
          guide_check: 'completed',
          video_guide_check: 'active',
          video_upload: 'locked',
          revision_check: 'locked',
          final_delivery: 'locked'
        }
      }
    }
    return {
      currentStep: 3,
      steps: {
        guide_check: 'completed',
        video_guide_check: 'completed',
        video_upload: 'active',
        revision_check: 'locked',
        final_delivery: 'locked'
      }
    }
  }

  // Default: all locked
  return {
    currentStep: 0,
    steps: {
      guide_check: 'locked',
      video_guide_check: 'locked',
      video_upload: 'locked',
      revision_check: 'locked',
      final_delivery: 'locked'
    }
  }
}

// Color utility
const getStepColors = (stepState, colorName) => {
  const colorMap = {
    purple: {
      active: 'border-purple-500 bg-purple-50',
      activeBadge: 'bg-purple-600 text-white',
      activeText: 'text-purple-700',
      activeBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    indigo: {
      active: 'border-indigo-500 bg-indigo-50',
      activeBadge: 'bg-indigo-600 text-white',
      activeText: 'text-indigo-700',
      activeBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    blue: {
      active: 'border-blue-500 bg-blue-50',
      activeBadge: 'bg-blue-600 text-white',
      activeText: 'text-blue-700',
      activeBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    amber: {
      active: 'border-amber-500 bg-amber-50',
      activeBadge: 'bg-amber-600 text-white',
      activeText: 'text-amber-700',
      activeBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    green: {
      active: 'border-green-500 bg-green-50',
      activeBadge: 'bg-green-600 text-white',
      activeText: 'text-green-700',
      activeBtn: 'bg-green-600 hover:bg-green-700 text-white',
    }
  }

  if (stepState === 'completed') {
    return {
      border: 'border-green-300 bg-green-50/50',
      badge: 'bg-green-500 text-white',
      text: 'text-green-700',
      btn: 'bg-green-100 text-green-700'
    }
  }
  if (stepState === 'active') {
    const c = colorMap[colorName] || colorMap.blue
    return {
      border: c.active,
      badge: c.activeBadge,
      text: c.activeText,
      btn: c.activeBtn
    }
  }
  if (stepState === 'waiting') {
    return {
      border: 'border-yellow-300 bg-yellow-50/50',
      badge: 'bg-yellow-500 text-white',
      text: 'text-yellow-700',
      btn: 'bg-yellow-100 text-yellow-700'
    }
  }
  // locked
  return {
    border: 'border-gray-200 bg-gray-50/50',
    badge: 'bg-gray-300 text-gray-500',
    text: 'text-gray-400',
    btn: 'bg-gray-200 text-gray-400 cursor-not-allowed'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => `$${(amount || 0).toLocaleString()}`

// ==================== STEP CONTENT COMPONENTS ====================

// Step 1: PDF / AI Guide Check
const GuideCheckContent = ({ campaign, application, onViewGuide, onConfirm, isConfirmed, stepState }) => {
  const colors = getStepColors(stepState, 'purple')

  if (stepState === 'completed') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-green-700 font-medium">Guide reviewed and confirmed</span>
      </div>
    )
  }

  if (stepState === 'locked') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2 opacity-50">
        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-400">Complete previous steps first</span>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 sm:p-3">
        <p className="text-xs sm:text-sm text-purple-800 font-medium mb-1">
          Please review the campaign guide thoroughly before proceeding.
        </p>
        <p className="text-[10px] sm:text-xs text-purple-600">
          The guide contains shooting requirements, required scenes, hashtags, and deadlines.
        </p>
      </div>

      <button
        onClick={() => onViewGuide?.(application, campaign)}
        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors border border-purple-200 text-sm"
      >
        <Eye className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>Open Campaign Guide</span>
        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      </button>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] rounded-xl font-medium transition-all text-xs sm:text-sm ${colors.btn} shadow-sm`}
      >
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>I have reviewed the guide completely</span>
      </button>
    </div>
  )
}

// Step 2: Video Guide Check
const VideoGuideCheckContent = ({ campaign, application, onConfirm, stepState }) => {
  const colors = getStepColors(stepState, 'indigo')

  if (stepState === 'completed') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-green-700 font-medium">Video guide watched and confirmed</span>
      </div>
    )
  }

  if (stepState === 'locked') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2 opacity-50">
        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-400">Review the PDF guide first</span>
      </div>
    )
  }

  const videoGuideUrl = campaign?.video_guide_url || campaign?.reference_video_url

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 sm:p-3">
        <p className="text-xs sm:text-sm text-indigo-800 font-medium mb-1">
          Watch the video guide carefully before filming.
        </p>
        <p className="text-[10px] sm:text-xs text-indigo-600">
          This video shows you how to shoot your content for this campaign.
        </p>
      </div>

      {videoGuideUrl ? (
        <a
          href={videoGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-colors border border-indigo-200 text-sm"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>Watch Video Guide</span>
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        </a>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <Video className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-1.5 sm:mb-2" />
          <p className="text-xs sm:text-sm text-gray-500">No video guide available for this campaign.</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">You can proceed to filming.</p>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] rounded-xl font-medium transition-all text-xs sm:text-sm ${colors.btn} shadow-sm`}
      >
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>{videoGuideUrl ? 'I have watched the video guide' : 'Confirmed, proceed to upload'}</span>
      </button>
    </div>
  )
}

// Step 3: Video Upload
const VideoUploadContent = ({ campaign, application, onUploadVideo, stepState }) => {
  const hasRevisions = application?.revision_requests?.length > 0
  const isRevisionReupload = application?.status === 'revision_requested'

  if (stepState === 'completed') {
    return (
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2 py-1.5 sm:py-2">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-green-700 font-medium">Video uploaded successfully</span>
        </div>
        {application?.video_url && (
          <a
            href={application.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View uploaded video
          </a>
        )}
      </div>
    )
  }

  if (stepState === 'locked') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2 opacity-50">
        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-400">Complete the guide steps first</span>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* REVISION WARNING - Always visible above upload button */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-red-800">
              Revision Check Upload
            </p>
            <p className="text-[10px] sm:text-xs text-red-600 mt-1 leading-relaxed">
              Do NOT upload a video ahead of time. After your video is reviewed,
              you may need to make revisions. Please upload your final version only
              after confirming all requirements in the guide.
            </p>
            {isRevisionReupload && hasRevisions && (
              <div className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <p className="text-[10px] sm:text-xs font-semibold text-red-800">
                  You have {application.revision_requests.length} revision request(s).
                  Please fix all issues before re-uploading.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deadline info */}
      {campaign?.video_deadline && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-blue-50 border border-blue-200 rounded-lg p-2">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
          <span className="text-blue-700">
            Video Deadline: <strong>{formatDate(campaign.video_deadline)}</strong>
          </span>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={() => onUploadVideo?.(application, campaign)}
        className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] rounded-xl font-medium transition-all shadow-sm text-sm ${
          isRevisionReupload
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>{isRevisionReupload ? 'Re-upload Revised Video' : 'Upload Video'}</span>
      </button>
    </div>
  )
}

// Step 4: Revision Check
const RevisionCheckContent = ({ application, onViewRevisions, onUploadVideo, campaign, stepState }) => {
  const hasRevisions = application?.revision_requests?.length > 0
  const isRevisionRequested = application?.status === 'revision_requested'

  if (stepState === 'completed') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-green-700 font-medium">Video approved - No revisions needed</span>
      </div>
    )
  }

  if (stepState === 'locked') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2 opacity-50">
        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-400">Upload your video first</span>
      </div>
    )
  }

  // Waiting state - video submitted, waiting for admin review
  if (stepState === 'waiting') {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 sm:p-4 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-yellow-800">Under Review</p>
          <p className="text-[10px] sm:text-xs text-yellow-600 mt-1">
            Your video is being reviewed by the team. You'll be notified if revisions are needed.
          </p>
        </div>
      </div>
    )
  }

  // Active state - revision_requested
  return (
    <div className="space-y-2.5 sm:space-y-3">
      {isRevisionRequested && hasRevisions && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-red-800">
                Revision Required ({application.revision_requests.length} issue{application.revision_requests.length > 1 ? 's' : ''})
              </p>
              <p className="text-[10px] sm:text-xs text-red-600 mt-1">
                Please review the feedback carefully and re-upload your video with corrections.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {hasRevisions && (
          <button
            onClick={() => onViewRevisions?.(application)}
            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all shadow-sm text-xs sm:text-sm"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>View Revisions</span>
          </button>
        )}
        {isRevisionRequested && (
          <button
            onClick={() => onUploadVideo?.(application, campaign)}
            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[2.75rem] bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-sm text-xs sm:text-sm"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Re-upload</span>
          </button>
        )}
      </div>
    </div>
  )
}

// Step 5: Final Delivery (3 simultaneous)
const FinalDeliveryContent = ({ campaign, application, onSubmitSNS, stepState }) => {
  const requiresAdCode = campaign?.requires_ad_code || campaign?.meta_ad_code_requested
  const requiresCleanVideo = campaign?.requires_clean_video

  if (stepState === 'completed') {
    return (
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2 py-1.5 sm:py-2">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-green-700 font-medium">All deliverables submitted!</span>
        </div>
        {application?.sns_upload_url && (
          <a
            href={application.sns_upload_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View SNS Post
          </a>
        )}
      </div>
    )
  }

  if (stepState === 'locked') {
    return (
      <div className="flex items-center gap-2 py-1.5 sm:py-2 opacity-50">
        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-400">Video must be approved first</span>
      </div>
    )
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
        <p className="text-xs sm:text-sm text-green-800 font-medium mb-1">
          Submit all required deliverables at once
        </p>
        <p className="text-[10px] sm:text-xs text-green-600">
          Complete all three items below in a single submission.
        </p>
      </div>

      {/* Three deliverables visual */}
      <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
        {/* SNS Upload */}
        <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 ${
          application?.sns_upload_url
            ? 'border-green-300 bg-green-50'
            : 'border-green-200 bg-white'
        }`}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-800">SNS Post URL</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Instagram / TikTok / YouTube link</p>
          </div>
          {application?.sns_upload_url ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          ) : (
            <span className="text-[10px] sm:text-xs font-medium text-red-500 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">Required</span>
          )}
        </div>

        {/* Clean Video */}
        <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 ${
          !requiresCleanVideo
            ? 'border-gray-200 bg-gray-50 opacity-50'
            : application?.clean_video_url
              ? 'border-green-300 bg-green-50'
              : 'border-blue-200 bg-white'
        }`}>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            requiresCleanVideo ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Video className={`w-4 h-4 sm:w-5 sm:h-5 ${requiresCleanVideo ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-800">Clean Video</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">No BGM, no subtitles version</p>
          </div>
          {!requiresCleanVideo ? (
            <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">N/A</span>
          ) : application?.clean_video_url ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          ) : (
            <span className="text-[10px] sm:text-xs font-medium text-red-500 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">Required</span>
          )}
        </div>

        {/* Ad Code */}
        <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 ${
          !requiresAdCode
            ? 'border-gray-200 bg-gray-50 opacity-50'
            : application?.partnership_code
              ? 'border-green-300 bg-green-50'
              : 'border-purple-200 bg-white'
        }`}>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            requiresAdCode ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${requiresAdCode ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-800">Ad Code</p>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Meta partnership ad code</p>
          </div>
          {!requiresAdCode ? (
            <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">N/A</span>
          ) : application?.partnership_code ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          ) : (
            <span className="text-[10px] sm:text-xs font-medium text-red-500 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">Required</span>
          )}
        </div>
      </div>

      {/* SNS Deadline */}
      {campaign?.sns_deadline && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-green-50 border border-green-200 rounded-lg p-2">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700">
            SNS Deadline: <strong>{formatDate(campaign.sns_deadline)}</strong>
          </span>
        </div>
      )}

      {/* Submit all button */}
      <button
        onClick={() => onSubmitSNS?.(application, campaign)}
        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-4 min-h-[2.75rem] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>Submit All Deliverables</span>
      </button>
    </div>
  )
}


// ==================== MAIN COMPONENT ====================

const CampaignWorkflowStepper = ({
  application,
  campaign,
  onViewGuide,
  onUploadVideo,
  onSubmitSNS,
  onViewRevisions
}) => {
  const [expanded, setExpanded] = useState(true)
  const [expandedStep, setExpandedStep] = useState(null)

  // Local confirmation states (persisted in localStorage per application)
  const storageKey = `workflow_${application?.id}`
  const [guideConfirmed, setGuideConfirmed] = useState(false)
  const [videoGuideConfirmed, setVideoGuideConfirmed] = useState(false)

  // Load persisted state
  useEffect(() => {
    if (!application?.id) return
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setGuideConfirmed(saved.guideConfirmed || false)
      setVideoGuideConfirmed(saved.videoGuideConfirmed || false)
    } catch (e) {
      // ignore
    }
  }, [application?.id])

  // Save state
  const persist = (updates) => {
    const current = { guideConfirmed, videoGuideConfirmed, ...updates }
    localStorage.setItem(storageKey, JSON.stringify(current))
  }

  const handleGuideConfirm = () => {
    setGuideConfirmed(true)
    persist({ guideConfirmed: true })
  }

  const handleVideoGuideConfirm = () => {
    setVideoGuideConfirmed(true)
    persist({ videoGuideConfirmed: true })
  }

  const status = application?.status || 'pending'
  const is4Week = campaign?.campaign_type === '4week_challenge'

  const workflowState = computeWorkflowState(application, campaign, {
    guideConfirmed,
    videoGuideConfirmed
  })

  // Auto-expand the current active step
  useEffect(() => {
    const activeStep = WORKFLOW_STEPS.find(s => workflowState.steps[s.id] === 'active')
    const waitingStep = WORKFLOW_STEPS.find(s => workflowState.steps[s.id] === 'waiting')
    setExpandedStep(activeStep?.id || waitingStep?.id || null)
  }, [workflowState.currentStep])

  const isActive = ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(status)
  if (!isActive) return null

  // Calculate progress percentage
  const completedSteps = Object.values(workflowState.steps).filter(s => s === 'completed').length
  const progressPercent = Math.round((completedSteps / 5) * 100)

  return (
    <div className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden overflow-x-hidden bg-white shadow-sm mb-3 sm:mb-4">
      {/* Header */}
      <div
        className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2 sm:gap-3 min-w-0 flex-1">
            {campaign?.image_url ? (
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl sm:text-2xl shadow-sm flex-shrink-0">
                ✨
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 leading-tight text-sm sm:text-base truncate">
                {campaign?.title_en || campaign?.title}
              </h3>
              <p className="text-xs sm:text-sm text-purple-600 font-medium truncate">{campaign?.brand_en || campaign?.brand}</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-green-600">
                  {formatCurrency(campaign?.reward_amount)}
                </span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                  is4Week ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {is4Week ? '4-Week' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Progress badge */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-14 sm:w-20 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500">{progressPercent}%</span>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content - Workflow Steps */}
      {expanded && (
        <div className="p-3 sm:p-4 border-t border-gray-100">
          {/* Mini progress bar */}
          <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
            {WORKFLOW_STEPS.map((step, idx) => {
              const state = workflowState.steps[step.id]
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                      state === 'completed'
                        ? 'bg-green-500 text-white shadow-sm'
                        : state === 'active'
                        ? 'bg-blue-500 text-white shadow-md animate-pulse'
                        : state === 'waiting'
                        ? 'bg-yellow-400 text-white shadow-sm'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    title={step.label}
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedStep(expandedStep === step.id ? null : step.id)
                    }}
                  >
                    {state === 'completed' ? '✓' : step.number}
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 sm:h-1 rounded min-w-1 ${
                      workflowState.steps[WORKFLOW_STEPS[idx + 1]?.id] === 'completed' || state === 'completed'
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Step labels */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-0 sm:px-1">
            {WORKFLOW_STEPS.map(step => {
              const state = workflowState.steps[step.id]
              return (
                <span key={step.id} className={`text-[8px] sm:text-[10px] font-medium text-center leading-tight flex-1 ${
                  state === 'completed' ? 'text-green-600'
                  : state === 'active' ? 'text-blue-600 font-bold'
                  : state === 'waiting' ? 'text-yellow-600'
                  : 'text-gray-400'
                }`}>
                  {step.shortLabel}
                </span>
              )
            })}
          </div>

          {/* Step Detail Cards */}
          <div className="space-y-1.5 sm:space-y-2">
            {WORKFLOW_STEPS.map((step) => {
              const state = workflowState.steps[step.id]
              const colors = getStepColors(state, step.color)
              const StepIcon = step.icon
              const isExpanded = expandedStep === step.id

              return (
                <div
                  key={step.id}
                  className={`border-2 rounded-lg sm:rounded-xl overflow-hidden transition-all ${colors.border}`}
                >
                  {/* Step Header */}
                  <button
                    className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 text-left min-h-[2.75rem]"
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors.badge}`}>
                      {state === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : state === 'locked' ? (
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold ${colors.text}`}>
                          Step {step.number}: {step.label}
                        </span>
                        {state === 'active' && (
                          <span className="text-[8px] sm:text-[10px] font-bold text-white bg-blue-500 px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                            CURRENT
                          </span>
                        )}
                        {state === 'waiting' && (
                          <span className="text-[8px] sm:text-[10px] font-bold text-white bg-yellow-500 px-1.5 sm:px-2 py-0.5 rounded-full">
                            REVIEWING
                          </span>
                        )}
                        {state === 'completed' && (
                          <span className="text-[8px] sm:text-[10px] font-bold text-white bg-green-500 px-1.5 sm:px-2 py-0.5 rounded-full">
                            DONE
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-0.5 ${state === 'locked' ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>
                        {step.description}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                    )}
                  </button>

                  {/* Step Content */}
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 border-t border-gray-100 pt-2.5 sm:pt-3">
                      {step.id === 'guide_check' && (
                        <GuideCheckContent
                          campaign={campaign}
                          application={application}
                          onViewGuide={onViewGuide}
                          onConfirm={handleGuideConfirm}
                          isConfirmed={guideConfirmed}
                          stepState={state}
                        />
                      )}
                      {step.id === 'video_guide_check' && (
                        <VideoGuideCheckContent
                          campaign={campaign}
                          application={application}
                          onConfirm={handleVideoGuideConfirm}
                          stepState={state}
                        />
                      )}
                      {step.id === 'video_upload' && (
                        <VideoUploadContent
                          campaign={campaign}
                          application={application}
                          onUploadVideo={onUploadVideo}
                          stepState={state}
                        />
                      )}
                      {step.id === 'revision_check' && (
                        <RevisionCheckContent
                          application={application}
                          campaign={campaign}
                          onViewRevisions={onViewRevisions}
                          onUploadVideo={onUploadVideo}
                          stepState={state}
                        />
                      )}
                      {step.id === 'final_delivery' && (
                        <FinalDeliveryContent
                          campaign={campaign}
                          application={application}
                          onSubmitSNS={onSubmitSNS}
                          stepState={state}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Deadlines Summary */}
          {!is4Week && (campaign?.video_deadline || campaign?.sns_deadline) && (
            <div className="mt-3 sm:mt-4 bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
              <h4 className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1.5 sm:mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                DEADLINES
              </h4>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-[10px] sm:text-xs">
                {campaign?.video_deadline && (
                  <div>
                    <span className="text-gray-500">Video: </span>
                    <span className="font-semibold text-gray-700">{formatDate(campaign.video_deadline)}</span>
                  </div>
                )}
                {campaign?.sns_deadline && (
                  <div>
                    <span className="text-gray-500">SNS: </span>
                    <span className="font-semibold text-gray-700">{formatDate(campaign.sns_deadline)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4-Week Challenge - Weekly Status */}
          {is4Week && (
            <div className="mt-3 sm:mt-4 bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
              <h4 className="text-[10px] sm:text-xs font-bold text-orange-700 mb-1.5 sm:mb-2">WEEKLY PROGRESS</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4].map(week => {
                  const videoSubmitted = !!application[`week${week}_video_url`]
                  const snsSubmitted = !!application[`week${week}_sns_url`]
                  const isComplete = videoSubmitted && snsSubmitted

                  return (
                    <div
                      key={week}
                      className={`p-1.5 sm:p-2 rounded-lg text-center text-[10px] sm:text-xs ${
                        isComplete
                          ? 'bg-green-100 border border-green-300'
                          : videoSubmitted
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="font-bold mb-0.5 sm:mb-1">W{week}</div>
                      <div className={videoSubmitted ? 'text-green-600' : 'text-gray-400'}>
                        {videoSubmitted ? '✓' : '○'} Vid
                      </div>
                      <div className={snsSubmitted ? 'text-green-600' : 'text-gray-400'}>
                        {snsSubmitted ? '✓' : '○'} SNS
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CampaignWorkflowStepper
