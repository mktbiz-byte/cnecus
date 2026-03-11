import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MultiSelectField from '@/components/shared/MultiSelectField'
import {
  LANGUAGES, TARGET_GENDERS, TARGET_AGE_GROUPS, JOB_VISIBILITY_OPTIONS
} from './profileConstants'

const ProfileStepPersonalDetails = ({ data, onChange }) => {
  const update = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* Job */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Job / Occupation</Label>
          <Input
            value={data.job || ''}
            onChange={(e) => update('job', e.target.value)}
            placeholder="e.g. Student, Nurse, Full-time Creator"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Show job on profile?</Label>
          <Select value={data.job_visibility || ''} onValueChange={(val) => update('job_visibility', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {JOB_VISIBILITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Children */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Do you have children?</Label>
          <Select
            value={data.has_children === true ? 'yes' : data.has_children === false ? 'no' : ''}
            onValueChange={(val) => update('has_children', val === 'yes')}
          >
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.has_children && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Children can appear in content?</Label>
            <Select value={data.child_appearance || ''} onValueChange={(val) => update('child_appearance', val)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, they can appear</SelectItem>
                <SelectItem value="no">No, prefer not to</SelectItem>
                <SelectItem value="partial">Only partially (no face)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Family */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-700">Family members can appear in content?</Label>
        <Select value={data.family_appearance || ''} onValueChange={(val) => update('family_appearance', val)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes, they can appear</SelectItem>
            <SelectItem value="no">No, prefer not to</SelectItem>
            <SelectItem value="partial">Only partially (no face)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Languages */}
      <MultiSelectField
        label="Languages you speak"
        options={LANGUAGES}
        value={data.languages}
        onChange={(val) => update('languages', val)}
        columns={4}
      />

      {/* Target Audience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Target Audience Gender</Label>
          <Select value={data.target_gender || ''} onValueChange={(val) => update('target_gender', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {TARGET_GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Target Age Group</Label>
          <Select value={data.target_age_group || ''} onValueChange={(val) => update('target_age_group', val)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {TARGET_AGE_GROUPS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default ProfileStepPersonalDetails
