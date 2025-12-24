import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

const PrivacyPage = () => {
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
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center mb-8">
          <Shield className="h-10 w-10 text-green-600 mr-4" />
          <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <p className="text-gray-600">
            Last updated: January 1, 2025
          </p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Your Privacy Matters:</strong> CNEC is committed to protecting your personal information.
              This policy explains how we collect, use, and safeguard your data.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Social media account information</li>
              <li>PayPal email for payment processing</li>
              <li>Shipping address for product deliveries</li>
              <li>Phone number (optional)</li>
            </ul>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Campaign applications and history</li>
              <li>Content submissions</li>
              <li>Platform interaction data</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>To provide and improve our Service</li>
              <li>To match you with relevant brand campaigns</li>
              <li>To process payments and manage transactions</li>
              <li>To communicate with you about campaigns and updates</li>
              <li>To ensure platform security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Brand Partners:</strong> Your profile information for campaign selection</li>
              <li><strong>Payment Processors:</strong> PayPal for payment processing</li>
              <li><strong>Service Providers:</strong> Third parties who help operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights (CCPA Compliance)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              California residents have the following rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Right to Know:</strong> Request information about data we collect</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@cnec-us.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and
              improve our Service. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as necessary to provide our Service and
              fulfill the purposes described in this policy. You may request deletion of your account
              and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place for such transfers in compliance with
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Service is not intended for users under 18 years of age. We do not knowingly collect
              personal information from children. If we learn that we have collected such information,
              we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-medium">CNEC Inc. - Privacy Team</p>
              <p className="text-gray-600">Email: privacy@cnec-us.com</p>
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

export default PrivacyPage
