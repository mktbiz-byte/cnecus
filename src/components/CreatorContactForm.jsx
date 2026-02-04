import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CreatorContactForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get('id');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [formData, setFormData] = useState({
    phone_number: '',
    postal_code: '',
    address: '',
    address_detail: ''
  });

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    } else {
      setError('Invalid link. Please check your email for the correct link.');
      setLoading(false);
    }
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);

      // 신청서 정보 로드
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns (
            id,
            title,
            brand,
            product_name,
            reward_amount
          )
        `)
        .eq('id', applicationId)
        .single();

      if (appError) {
        throw new Error('Application not found');
      }

      // 승인된 상태인지 확인
      if (!['approved', 'completed'].includes(appData.status)) {
        setError('This application has not been approved yet.');
        setLoading(false);
        return;
      }

      // 이미 연락처를 제출했는지 확인
      if (appData.contact_submitted || (appData.phone_number && appData.address)) {
        setAlreadySubmitted(true);
        setFormData({
          phone_number: appData.phone_number || '',
          postal_code: appData.postal_code || '',
          address: appData.address || '',
          address_detail: appData.address_detail || ''
        });
      }

      setApplication(appData);
      setCampaign(appData.campaigns);

    } catch (error) {
      console.error('Error loading application:', error);
      setError('Unable to load application. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.phone_number.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!formData.postal_code.trim()) {
      setError('Please enter your postal code.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please enter your address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 신청서에 연락처 정보 업데이트
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          phone_number: formData.phone_number.trim(),
          postal_code: formData.postal_code.trim(),
          address: formData.address.trim(),
          address_detail: formData.address_detail?.trim() || '',
          contact_submitted: true,
          contact_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setAlreadySubmitted(true);

    } catch (error) {
      console.error('Error submitting contact info:', error);
      setError('Failed to submit contact information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your contact information has been submitted successfully.<br />
            We will send the product to your address soon.
          </p>
          <div className="bg-purple-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-purple-800 mb-2">Submitted Information:</h3>
            <p className="text-sm text-gray-700">Phone: {formData.phone_number}</p>
            <p className="text-sm text-gray-700">Postal Code: {formData.postal_code}</p>
            <p className="text-sm text-gray-700">Address: {formData.address}</p>
            {formData.address_detail && (
              <p className="text-sm text-gray-700">Detail: {formData.address_detail}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-gray-600">You have been selected for the campaign!</p>
        </div>

        {/* 캠페인 정보 카드 */}
        {campaign && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Campaign Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Campaign:</span>
                <span className="font-medium text-gray-900">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium text-gray-900">{campaign.brand}</span>
              </div>
              {campaign.product_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium text-gray-900">{campaign.product_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 연락처 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {alreadySubmitted ? 'Your Contact Information' : 'Please Enter Your Contact Information'}
          </h2>

          {alreadySubmitted && !success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                You have already submitted your contact information. You can update it below if needed.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="e.g., +1-555-123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* 우편번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="e.g., 90210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, City, State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* 상세주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Detail (Apt, Suite, etc.)
              </label>
              <input
                type="text"
                name="address_detail"
                value={formData.address_detail}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, etc. (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                alreadySubmitted ? 'Update Information' : 'Submit Information'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            This information will only be used for product shipping.
          </p>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Questions? Contact us at <a href="mailto:support@cnec-us.com" className="text-purple-600 hover:underline">support@cnec-us.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorContactForm;
