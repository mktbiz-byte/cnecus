import React from 'react'
import AddressForm from '@/components/shared/AddressForm'

const ProfileStepShippingAddress = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        This address will be used for product shipments when you're selected for campaigns.
        You can also update it when applying to individual campaigns.
      </p>
      <AddressForm
        value={data}
        onChange={onChange}
        showRecipientName={true}
      />
    </div>
  )
}

export default ProfileStepShippingAddress
