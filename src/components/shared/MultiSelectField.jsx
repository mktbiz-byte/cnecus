import React from 'react'
import { Label } from '@/components/ui/label'

const MultiSelectField = ({ label, options, value = [], onChange, columns = 3 }) => {
  const selected = Array.isArray(value) ? value : []

  const toggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(v => v !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm text-gray-700">{label}</Label>}
      <div className={`grid gap-2 ${
        columns === 2 ? 'grid-cols-2' :
        columns === 4 ? 'grid-cols-2 sm:grid-cols-4' :
        'grid-cols-2 sm:grid-cols-3'
      }`}>
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                isSelected
                  ? 'bg-purple-100 border-purple-400 text-purple-700 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200 hover:bg-purple-50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MultiSelectField
