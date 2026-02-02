import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

// Simple AI translation using browser's built-in or fallback
const translateToEnglish = async (koreanText) => {
  // For now, we'll just return the original text with a note
  // In production, you would integrate with Gemini or another translation API
  try {
    // Try using a translation API if available
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(koreanText)}`
    )
    const data = await response.json()
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('')
    }
    return koreanText
  } catch (error) {
    console.error('Translation error:', error)
    return koreanText
  }
}

// Single Revision Request Card
const RevisionCard = ({ request, index }) => {
  const [englishText, setEnglishText] = useState(request.comment_en || '')
  const [loading, setLoading] = useState(!request.comment_en && !!request.comment)

  useEffect(() => {
    if (!request.comment_en && request.comment) {
      setLoading(true)
      translateToEnglish(request.comment)
        .then(translated => {
          setEnglishText(translated)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [request])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
          Revision #{index + 1}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(request.created_at)}
        </span>
      </div>

      {/* English Translation (Primary) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🇺🇸</span>
          <span className="text-xs font-semibold text-gray-600">English</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Translating...
          </div>
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed">
            {englishText || request.comment_en || 'Translation not available'}
          </p>
        )}
      </div>

      <div className="border-t border-dashed border-amber-200 pt-3">
        {/* Korean Original */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🇰🇷</span>
          <span className="text-xs font-semibold text-gray-500">Original (Korean)</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {request.comment || 'No original text'}
        </p>
      </div>
    </div>
  )
}

// Main Modal Component
const RevisionRequestsModal = ({ isOpen, onClose, application, onReupload }) => {
  if (!isOpen) return null

  const revisions = application?.revision_requests || []
  const hasRevisions = revisions.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📝 Revision Requests</h2>
            <p className="text-sm text-gray-500">
              {hasRevisions ? `${revisions.length} revision(s) requested` : 'No revisions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {hasRevisions ? (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">
                  <strong>⚠️ Action Required:</strong> Please review the feedback below and re-upload your video with the necessary changes.
                </p>
              </div>

              {revisions.map((request, index) => (
                <RevisionCard key={index} request={request} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-600">No revision requests at this time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
          {hasRevisions && (
            <button
              onClick={() => {
                onClose()
                onReupload?.()
              }}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              🔄 Re-upload Video
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RevisionRequestsModal
