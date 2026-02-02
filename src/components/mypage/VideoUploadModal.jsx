import React, { useState, useEffect } from 'react'
import { X, Loader2, Upload, Link, AlertCircle } from 'lucide-react'

const VideoUploadModal = ({
  isOpen,
  onClose,
  application,
  campaign,
  onSubmit
}) => {
  const [videoUrl, setVideoUrl] = useState('')
  const [cleanVideoUrl, setCleanVideoUrl] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const is4Week = campaign?.campaign_type === '4week_challenge'
  const requiresCleanVideo = campaign?.requires_clean_video

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVideoUrl('')
      setCleanVideoUrl('')
      setError('')
      // Find the first week without a video submission
      if (is4Week) {
        for (let i = 1; i <= 4; i++) {
          if (!application?.[`week${i}_video_url`]) {
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

  const getWeekDeadline = (week) => {
    const customKey = `week${week}_deadline`
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

    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    if (!isValidUrl(videoUrl)) {
      setError('Please enter a valid URL')
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
        videoUrl,
        cleanVideoUrl: cleanVideoUrl || null,
        weekNumber: is4Week ? selectedWeek : null,
        is4Week
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit video')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              📤 {application?.status === 'revision_requested' ? 'Re-upload Video' : 'Upload Video'}
            </h2>
            <p className="text-sm text-gray-500">
              {is4Week ? '4-Week Challenge' : 'Standard Campaign'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Revision Alert */}
          {application?.status === 'revision_requested' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Revision Requested</p>
                  <p className="text-xs text-red-600 mt-1">
                    Please review the feedback and upload your revised video.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Week Selection for 4-Week Challenge */}
          {is4Week && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(week => {
                  const existingVideo = application?.[`week${week}_video_url`]
                  const deadline = getWeekDeadline(week)
                  const isSelected = selectedWeek === week

                  return (
                    <button
                      key={week}
                      type="button"
                      onClick={() => setSelectedWeek(week)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : existingVideo
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">Week {week}</div>
                      {deadline && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(deadline)}
                        </div>
                      )}
                      {existingVideo && (
                        <div className="text-xs text-green-600 mt-1">✓ Uploaded</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {application?.[`week${selectedWeek}_video_url`] && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Week {selectedWeek} already has a video. Uploading will replace it.
                </p>
              )}
            </div>
          )}

          {/* Video URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://drive.google.com/..."
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Accepted: Google Drive, YouTube, Dropbox, or any viewable link.
              Make sure the link is set to "Anyone with the link can view".
            </p>
          </div>

          {/* Clean Video URL (if required) */}
          {requiresCleanVideo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clean Video URL
                <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Required
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={cleanVideoUrl}
                  onChange={(e) => setCleanVideoUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 p-2 bg-blue-50 rounded">
                <strong>Clean video:</strong> Same video but WITHOUT background music and subtitles.
                This is needed for ad usage.
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-amber-800 mb-2">💡 Tips</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Make sure sharing permissions are set to "Anyone with the link"</li>
              <li>• Google Drive, YouTube unlisted, and Dropbox links work best</li>
              <li>• Video should be in the highest quality possible</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !videoUrl.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Submit Video
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VideoUploadModal
