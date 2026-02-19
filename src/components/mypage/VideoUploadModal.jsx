import React, { useState, useEffect, useRef } from 'react'
import { X, Loader2, Upload, AlertCircle, Film, CheckCircle, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const VideoUploadModal = ({
  isOpen,
  onClose,
  application,
  campaign,
  onSubmit
}) => {
  const [videoFile, setVideoFile] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const videoInputRef = useRef(null)

  const is4Week = campaign?.campaign_type === '4week_challenge'

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVideoFile(null)
      setError('')
      setUploadProgress(0)
      // Find the first week without a video submission
      if (is4Week) {
        for (let i = 1; i <= 4; i++) {
          if (!application?.[`week${i}_url`]) {
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type (accept all video/* types)
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file')
      return
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 2GB')
      return
    }

    setError('')
    setVideoFile(file)
  }

  const uploadToSupabase = async (file, folder, version = 1) => {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const videoSlot = folder
    const fileName = `${videoSlot}_v${version}_${timestamp}.${fileExt}`
    const filePath = `${application.campaign_id}/${application.user_id}/${fileName}`

    const { data, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!videoFile) {
      setError('Please select a video file to upload')
      return
    }

    setLoading(true)
    setUploadProgress(10)

    try {
      // Determine version by checking existing submissions
      let version = 1
      try {
        let versionQuery = supabase
          .from('video_submissions')
          .select('version')
          .eq('application_id', application.id)
        if (is4Week) {
          versionQuery = versionQuery.eq('week_number', selectedWeek)
        } else {
          versionQuery = versionQuery.is('week_number', null)
        }
        const { data: existingSubs } = await versionQuery
          .order('version', { ascending: false })
          .limit(1)
        if (existingSubs && existingSubs.length > 0) {
          version = (existingSubs[0].version || 0) + 1
        }
      } catch (e) {
        console.warn('Could not fetch existing version:', e)
      }

      // Upload main video
      setUploadProgress(20)
      const videoSlot = is4Week ? `week${selectedWeek}` : 'main'
      const videoUrl = await uploadToSupabase(videoFile, videoSlot, version)
      setUploadProgress(90)

      setUploadProgress(100)

      await onSubmit({
        applicationId: application.id,
        campaignId: application.campaign_id,
        userId: application.user_id,
        videoUrl,
        cleanVideoUrl: null,
        videoFileName: videoFile.name,
        videoFileSize: videoFile.size,
        version,
        weekNumber: is4Week ? selectedWeek : null,
        is4Week
      })
      onClose()
    } catch (err) {
      console.error('Video upload error:', err)
      setError(err.message || 'Failed to upload video')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {application?.status === 'revision_requested' ? 'Re-upload Video' : 'Upload Video'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {is4Week ? '4-Week Challenge' : 'Standard Campaign'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Revision Alert */}
          {application?.status === 'revision_requested' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-800">Revision Requested</p>
                  <p className="text-xs text-red-600 mt-0.5 sm:mt-1">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(week => {
                  const existingVideo = application?.[`week${week}_url`]
                  const deadline = getWeekDeadline(week)
                  const isSelected = selectedWeek === week

                  return (
                    <button
                      key={week}
                      type="button"
                      onClick={() => setSelectedWeek(week)}
                      disabled={loading}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 text-center transition-all min-h-[44px] ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : existingVideo
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50`}
                    >
                      <div className="font-medium text-xs sm:text-sm">Week {week}</div>
                      {deadline && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(deadline)}
                        </div>
                      )}
                      {existingVideo && (
                        <div className="text-xs text-green-600 mt-1">Uploaded</div>
                      )}
                    </button>
                  )
                })}
              </div>
              {application?.[`week${selectedWeek}_url`] && (
                <p className="text-xs text-amber-600 mt-2">
                  Week {selectedWeek} already has a video. Uploading will replace it.
                </p>
              )}
            </div>
          )}

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File <span className="text-red-500">*</span>
            </label>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />

            {!videoFile ? (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={loading}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 hover:border-purple-400 hover:bg-purple-50 active:bg-purple-50 transition-all disabled:opacity-50 min-h-[100px]"
              >
                <div className="flex flex-col items-center">
                  <Film className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm font-medium text-gray-700">Tap to select video</p>
                  <p className="text-xs text-gray-500 mt-1">All video formats (max 2GB)</p>
                </div>
              </button>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(videoFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full disabled:opacity-50 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clean video info note (if campaign requires it) */}
          {campaign?.requires_clean_video && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Clean video (without BGM/subtitles) will be submitted together with your SNS post in the next step.
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-purple-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
            <h4 className="text-xs sm:text-sm font-medium text-amber-800 mb-1.5 sm:mb-2">Tips</h4>
            <ul className="text-xs text-amber-700 space-y-0.5 sm:space-y-1">
              <li>Upload video in the highest quality possible</li>
              <li>Supported formats: All video formats (MP4, MOV, AVI, WebM, etc.)</li>
              <li>Maximum file size: 2GB</li>
              <li>Use a stable internet connection for faster uploads</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !videoFile}
            className="w-full py-3 sm:py-3.5 bg-purple-600 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading to Server...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Video
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VideoUploadModal
