import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import { STEP_LABELS, STEP_MESSAGES } from './profileConstants'

const ProfileProgressBar = ({ currentStep, completedSteps, onStepClick }) => {
  const totalSteps = 6
  const completedCount = completedSteps.size
  const percentage = Math.round((completedCount / totalSteps) * 100)

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Profile Completion</h2>
          <p className="text-sm text-gray-500">{completedCount} of {totalSteps} steps completed</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${percentage === 100 ? 'text-purple-600' : 'text-gray-700'}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={percentage} className="h-3" />

      {/* Complete Banner */}
      {percentage === 100 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Your profile is complete! Brands can now find you easily.</span>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6].map((step) => {
          const isCompleted = completedSteps.has(step)
          const isCurrent = currentStep === step
          return (
            <button
              key={step}
              type="button"
              onClick={() => onStepClick(step)}
              className={`flex-1 min-w-0 px-2 py-2 rounded-lg text-center transition-all ${
                isCurrent
                  ? 'bg-purple-100 border-2 border-purple-400'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {isCompleted ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium ${
                    isCurrent ? 'bg-purple-600 text-white' : 'bg-gray-300 text-white'
                  }`}>
                    {step}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight block truncate ${
                isCurrent ? 'text-purple-700 font-medium' : 'text-gray-500'
              }`}>
                {STEP_LABELS[step]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Motivational Message */}
      {percentage < 100 && STEP_MESSAGES[currentStep] && (
        <p className="text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
          {STEP_MESSAGES[currentStep]}
        </p>
      )}
    </div>
  )
}

export default ProfileProgressBar
