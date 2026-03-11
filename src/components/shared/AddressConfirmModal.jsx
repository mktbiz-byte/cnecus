import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { countryCodeToFlag, getCountryName, formatAddressForDisplay } from './countryData'

const AddressConfirmModal = ({ open, onClose, onConfirm, address = {} }) => {
  const country = address.shipping_country || 'US'
  const flag = countryCodeToFlag(country)
  const countryName = getCountryName(country)

  const formatted = formatAddressForDisplay({
    recipient_name: address.shipping_recipient_name,
    line1: address.shipping_address_line1 || address.shipping_address,
    line2: address.shipping_address_line2 || address.detail_address,
    city: address.shipping_city,
    state: address.shipping_state,
    zip: address.shipping_zip || address.postal_code,
    phone: address.shipping_phone,
  }, country)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Please confirm your shipping address</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Country Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{flag}</span>
            <span className="font-medium text-gray-800">{countryName}</span>
          </div>

          {/* Address Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {formatted}
            </pre>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Products will be shipped to this address. Please double-check before confirming.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Edit Address
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Confirm Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddressConfirmModal
