import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎬</span>
              <span className="font-bold text-xl">CNEC</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-8">Terms of Service</h1>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 space-y-6 sm:space-y-8">
          <p className="text-gray-600">
            Last updated: January 1, 2025
          </p>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using CNEC's platform ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, please do not use our Service. CNEC reserves the right to update these
              Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              CNEC provides a platform connecting K-Beauty brands with content creators for marketing collaborations.
              Our Service enables creators to discover campaigns, apply for opportunities, create content, and receive
              compensation for their work.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">3. User Eligibility</h2>
            <p className="text-gray-600 leading-relaxed">
              To use our Service, you must be at least 18 years old and capable of forming a binding contract.
              By using the Service, you represent and warrant that you meet these eligibility requirements.
              Users must provide accurate and complete information during registration.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">4. Creator Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Create original, authentic content as specified in campaign requirements</li>
              <li>Disclose sponsored content in accordance with FTC guidelines</li>
              <li>Meet all campaign deadlines and deliverables</li>
              <li>Maintain the confidentiality of brand information</li>
              <li>Not engage in fraudulent activities or misrepresent follower counts</li>
              <li>Comply with all applicable laws and platform guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">5. Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Creators will receive compensation as specified in each campaign. Payments are processed via PayPal
              within 30 days of content approval. CNEC reserves the right to withhold payment if:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Content does not meet campaign requirements</li>
              <li>Content is not delivered by the deadline</li>
              <li>Fraudulent activity is detected</li>
              <li>Content violates platform guidelines or applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              Creators retain ownership of their original content. By participating in campaigns, creators grant
              CNEC and partnering brands a non-exclusive, royalty-free license to use, reproduce, and distribute
              the content for marketing purposes as specified in each campaign agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">7. Account Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              CNEC reserves the right to suspend or terminate accounts that violate these Terms, engage in
              fraudulent activities, or act in ways detrimental to the platform or its users. Users may
              also request account deletion at any time by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              CNEC shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of your use of the Service. Our total liability shall not exceed the amounts paid to
              you through our platform in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">9. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of California,
              United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">10. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">CNEC Inc.</p>
              <p className="text-gray-600">Email: legal@cnec-us.com</p>
              <p className="text-gray-600">Los Angeles, California, USA</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 CNEC Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default TermsPage
