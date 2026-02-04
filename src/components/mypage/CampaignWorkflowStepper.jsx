import React, { useState, useEffect } from 'react'
import {
  FileText, Video, Upload, ClipboardCheck, Send,
  ChevronDown, ChevronUp, Lock, CheckCircle2, Circle,
  AlertTriangle, Eye, ExternalLink, Calendar, ArrowRight,
  BookOpen, Play, UploadCloud, RefreshCw, Share2, Award,
  Clock, AlertCircle, Tv
} from 'lucide-react'

/**
 * CampaignWorkflowStepper (US Version)
 *
 * 4-step workflow:
 *   Step 1: Video Submit (영상 제출)
 *   Step 2: Revision Check (수정사항 확인)
 *   Step 3: SNS Upload + Clean Video URL + Ad Code (3개 동시 제출)
 *   Step 4: Complete (최종 완료)
 *
 * + Shooting Guide: Always accessible banner (가이드는 언제든 확인 가능)
 * + Deadline display: Video deadline + SNS deadline prominently shown
 */

const STEPS = [
  { id: 'video_submit', number: 1, label: 'Video Submit', icon: UploadCloud },
  { id: 'revision_check', number: 2, label: 'Revision Check', icon: ClipboardCheck },
  { id: 'sns_delivery', number: 3, label: 'SNS / Clean / Code', icon: Share2 },
  { id: 'complete', number: 4, label: 'Points', icon: Award },
]

// Compute step states from application status
const computeStepStates = (application) => {
  const status = application?.status || 'pending'

  // Complete
  if (status === 'completed') {
    return { video_submit: 'done', revision_check: 'done', sns_delivery: 'done', complete: 'done', current: 5 }
  }
  // SNS uploaded - waiting for final completion
  if (status === 'sns_uploaded') {
    return { video_submit: 'done', revision_check: 'done', sns_delivery: 'done', complete: 'active', current: 4 }
  }
  // Approved - ready for SNS/Clean/Code delivery
  if (status === 'approved') {
    return { video_submit: 'done', revision_check: 'done', sns_delivery: 'active', complete: 'locked', current: 3 }
  }
  // Revision requested - need to fix and reupload
  if (status === 'revision_requested') {
    return { video_submit: 'done', revision_check: 'revision', sns_delivery: 'locked', complete: 'locked', current: 2 }
  }
  // Video submitted - under review
  if (status === 'video_submitted') {
    return { video_submit: 'done', revision_check: 'reviewing', sns_delivery: 'locked', complete: 'locked', current: 2 }
  }
  // Selected / Filming - need to upload video
  if (['filming', 'selected'].includes(status)) {
    return { video_submit: 'active', revision_check: 'locked', sns_delivery: 'locked', complete: 'locked', current: 1 }
  }
  // Default
  return { video_submit: 'locked', revision_check: 'locked', sns_delivery: 'locked', complete: 'locked', current: 0 }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getDaysLeft = (dateString) => {
  if (!dateString) return null
  const diff = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

const formatCurrency = (amount) => `$${(amount || 0).toLocaleString()}`

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
  const status = application?.status || 'pending'
  const is4Week = campaign?.campaign_type === '4week_challenge'
  const stepStates = computeStepStates(application)

  const isActive = ['selected', 'filming', 'video_submitted', 'revision_requested', 'approved', 'sns_uploaded', 'completed'].includes(status)
  if (!isActive) return null

  const completedCount = Object.values(stepStates).filter(s => s === 'done').length
  const progressPercent = status === 'completed' ? 100 : Math.round((completedCount / 4) * 100)

  const videoDaysLeft = getDaysLeft(campaign?.video_deadline)
  const snsDaysLeft = getDaysLeft(campaign?.sns_deadline)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
      {/* ====== HEADER - Campaign Info + Progress ====== */}
      <div
        className="px-4 py-3 sm:px-5 sm:py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {campaign?.image_url ? (
            <img src={campaign.image_url} alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-lg flex-shrink-0">
              C
            </div>
          )}

          {/* Title area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                is4Week ? 'bg-orange-100 text-orange-700' : 'bg-violet-100 text-violet-700'
              }`}>
                {is4Week ? '4-WEEK' : 'STANDARD'}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {campaign?.title_en || campaign?.title}
            </h3>
            <p className="text-xs text-gray-500 truncate">{campaign?.brand_en || campaign?.brand}</p>
          </div>

          {/* Progress */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-lg sm:text-xl font-black text-violet-600">{progressPercent}%</span>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-0.5" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* ====== DEADLINES BAR ====== */}
          <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gray-50 flex gap-3 sm:gap-6 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Video className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium leading-none">Video Due</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {formatDate(campaign?.video_deadline)}
                </p>
              </div>
              {videoDaysLeft !== null && videoDaysLeft >= 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  videoDaysLeft <= 3 ? 'bg-red-100 text-red-700' : videoDaysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  D-{videoDaysLeft}
                </span>
              )}
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium leading-none">SNS Due</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {formatDate(campaign?.sns_deadline)}
                </p>
              </div>
              {snsDaysLeft !== null && snsDaysLeft >= 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  snsDaysLeft <= 3 ? 'bg-red-100 text-red-700' : snsDaysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  D-{snsDaysLeft}
                </span>
              )}
            </div>
          </div>

          {/* ====== HORIZONTAL STEP INDICATOR ====== */}
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <div className="flex items-center">
              {STEPS.map((step, idx) => {
                const state = stepStates[step.id]
                const StepIcon = step.icon
                const isDone = state === 'done'
                const isActiveStep = state === 'active' || state === 'revision' || state === 'reviewing'

                return (
                  <React.Fragment key={step.id}>
                    {/* Step circle */}
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: idx === 0 || idx === STEPS.length - 1 ? 'auto' : undefined }}>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : isActiveStep
                          ? 'bg-violet-600 text-white shadow-md ring-4 ring-violet-100'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold text-center leading-tight ${
                        isDone ? 'text-emerald-600' : isActiveStep ? 'text-violet-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {/* Connector line */}
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full ${
                        stepStates[STEPS[idx + 1].id] === 'done' || isDone && (stepStates[STEPS[idx + 1].id] !== 'locked')
                          ? 'bg-emerald-400'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* ====== SNS WARNING BANNER ====== */}
          {['selected', 'filming', 'video_submitted', 'revision_requested'].includes(status) && (
            <div className="mx-4 sm:mx-5 mt-2 mb-1 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                <span className="font-bold">Do NOT post on SNS</span> until your video is approved. Upload to SNS only after passing the revision check.
              </p>
            </div>
          )}

          {/* ====== ACTIVE STEP CONTENT ====== */}
          <div className="px-4 py-3 sm:px-5 sm:py-4">

            {/* === STEP 1: Video Submit === */}
            {stepStates.video_submit === 'active' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-bold text-gray-900">Upload Your Video</h4>
                </div>
                <p className="text-xs text-gray-500 ml-8">
                  Review the shooting guide, film your content, then upload. Make sure to follow all requirements before submitting.
                </p>

                {/* Video already uploaded info */}
                {application?.video_url && (
                  <div className="ml-8 bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-800">Previous video uploaded</p>
                      <a href={application.video_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline truncate block">{application.video_url}</a>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onUploadVideo?.(application, campaign)}
                  className="ml-8 w-auto inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Video
                </button>
              </div>
            )}

            {/* === STEP 2: Reviewing === */}
            {stepStates.revision_check === 'reviewing' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-bold text-gray-900">Under Review</h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">REVIEWING</span>
                </div>
                <div className="ml-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <ClipboardCheck className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm font-semibold text-amber-800">Your video is being reviewed</p>
                  <p className="text-xs text-amber-600 mt-1">You'll be notified once the review is complete.</p>
                </div>

                {/* Submitted video info */}
                {application?.video_url && (
                  <div className="ml-8 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">Submitted video:</p>
                      <p className="text-xs font-medium text-gray-700 truncate">{application.video_url?.split('/').pop() || 'video'}</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">v{application.revision_requests?.length ? application.revision_requests.length + 1 : 1}</span>
                  </div>
                )}
              </div>
            )}

            {/* === STEP 2: Revision Required === */}
            {stepStates.revision_check === 'revision' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-bold text-gray-900">Revision Required</h4>
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {application?.revision_requests?.length || 0} issue{(application?.revision_requests?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="ml-8 bg-red-50 border-2 border-red-200 rounded-xl p-3">
                  <p className="text-xs text-red-700 font-medium leading-relaxed">
                    Please review the feedback below and re-upload your video with all corrections applied.
                  </p>
                </div>

                <div className="ml-8 flex gap-2">
                  {application?.revision_requests?.length > 0 && (
                    <button
                      onClick={() => onViewRevisions?.(application)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  )}
                  <button
                    onClick={() => onUploadVideo?.(application, campaign)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Re-upload Video
                  </button>
                </div>
              </div>
            )}

            {/* === STEP 3: SNS / Clean / Ad Code === */}
            {stepStates.sns_delivery === 'active' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="text-sm font-bold text-gray-900">Final Submission</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">APPROVED</span>
                </div>

                <p className="text-xs text-gray-500 ml-8">
                  Your video was approved! Now submit all deliverables below.
                </p>

                {/* 3 deliverable cards */}
                <div className="ml-8 space-y-2">
                  {/* SNS Post URL */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    application?.sns_upload_url ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:border-violet-200'
                  }`}>
                    <div className="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">SNS Post URL</p>
                      <p className="text-[10px] text-gray-500">Instagram / TikTok / YouTube post link</p>
                    </div>
                    {application?.sns_upload_url ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex-shrink-0">Required</span>
                    )}
                  </div>

                  {/* Clean Video */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    !campaign?.requires_clean_video
                      ? 'border-gray-100 bg-gray-50 opacity-50'
                      : application?.clean_video_url
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-violet-200'
                  }`}>
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">Clean Video URL</p>
                      <p className="text-[10px] text-gray-500">No BGM, no subtitles version</p>
                    </div>
                    {!campaign?.requires_clean_video ? (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">N/A</span>
                    ) : application?.clean_video_url ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex-shrink-0">Required</span>
                    )}
                  </div>

                  {/* Ad Code */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    !(campaign?.requires_ad_code || campaign?.meta_ad_code_requested)
                      ? 'border-gray-100 bg-gray-50 opacity-50'
                      : application?.partnership_code
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-violet-200'
                  }`}>
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tv className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">Ad Partnership Code</p>
                      <p className="text-[10px] text-gray-500">Meta / YouTube / TikTok ad code</p>
                    </div>
                    {!(campaign?.requires_ad_code || campaign?.meta_ad_code_requested) ? (
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">N/A</span>
                    ) : application?.partnership_code ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex-shrink-0">Required</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSubmitSNS?.(application, campaign)}
                  className="ml-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Submit All Deliverables
                </button>
              </div>
            )}

            {/* === STEP 4: Complete === */}
            {stepStates.complete === 'active' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">All Submitted!</h4>
                <p className="text-xs text-gray-500">Points will be awarded once everything is confirmed.</p>
              </div>
            )}

            {stepStates.complete === 'done' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-base font-bold text-emerald-700 mb-1">Campaign Complete!</h4>
                <p className="text-xs text-gray-500">Thank you for your work. Points have been awarded.</p>
              </div>
            )}

            {/* === Locked state message === */}
            {stepStates.video_submit === 'locked' && (
              <div className="text-center py-6 text-gray-400">
                <Lock className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs">Waiting for campaign selection...</p>
              </div>
            )}

            {stepStates.video_submit === 'done' && stepStates.revision_check === 'locked' && (
              <div className="text-center py-4 text-gray-400">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs">Processing...</p>
              </div>
            )}
          </div>

          {/* ====== 4-WEEK CHALLENGE WEEKLY PROGRESS ====== */}
          {is4Week && (
            <div className="mx-4 sm:mx-5 mb-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <h4 className="text-[10px] font-bold text-orange-700 mb-2 uppercase tracking-wide">Weekly Progress</h4>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(week => {
                  const vid = !!application?.[`week${week}_video_url`]
                  const sns = !!application?.[`week${week}_sns_url`]
                  const done = vid && sns
                  return (
                    <div key={week} className={`p-2 rounded-lg text-center text-[10px] border ${
                      done ? 'bg-emerald-100 border-emerald-300' : vid ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}>
                      <div className="font-bold text-xs mb-0.5">W{week}</div>
                      <div className={vid ? 'text-emerald-600' : 'text-gray-300'}>{vid ? '✓' : '○'} Vid</div>
                      <div className={sns ? 'text-emerald-600' : 'text-gray-300'}>{sns ? '✓' : '○'} SNS</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ====== SHOOTING GUIDE BANNER - Always visible ====== */}
          <div className="px-4 pb-3 sm:px-5 sm:pb-4">
            <button
              onClick={() => onViewGuide?.(application, campaign)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl hover:border-violet-400 hover:from-violet-100 hover:to-purple-100 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <BookOpen className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-violet-800">View Shooting Guide</p>
                <p className="text-[10px] text-violet-500">Requirements, scenes, hashtags & deadlines</p>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignWorkflowStepper
