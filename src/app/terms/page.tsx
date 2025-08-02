export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using GLP-1 Mindful Evenings ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>GLP-1 Mindful Evenings provides:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Evening emotional check-in tools</li>
                <li>Mindful eating guidance and support</li>
                <li>Activity suggestions based on emotional states</li>
                <li>Progress tracking and insights</li>
                <li>AI-powered personalized recommendations (Premium)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Medical Disclaimer</h2>
              <p className="font-medium">The Service is NOT a substitute for professional medical advice, diagnosis, or treatment.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Always consult your healthcare provider regarding GLP-1 medications and dietary changes</li>
                <li>Never disregard professional medical advice or delay seeking it because of content in this app</li>
                <li>If you experience medical emergencies, contact emergency services immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Account Registration</h2>
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Subscription and Payments</h2>
              <p><strong>Free Tier:</strong> 3 check-ins per week at no cost</p>
              <p><strong>Premium Tier:</strong> $2.99/month for unlimited access and AI insights</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Payments are processed securely through Stripe</li>
                <li>Subscriptions automatically renew monthly unless cancelled</li>
                <li>You may cancel anytime through your account settings</li>
                <li>No refunds for partial months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. User Content and Privacy</h2>
              <p>Your check-in data and personal information are:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Stored securely and encrypted</li>
                <li>Never sold to third parties</li>
                <li>Used only to provide and improve the Service</li>
                <li>Deletable at any time through your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload malicious code or content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
              <p>All content, features, and functionality of the Service are owned by GLP-1 Mindful Evenings and protected by copyright, trademark, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
              <p>For questions about these Terms of Service, please contact us at:</p>
              <p className="font-medium mt-2">Dan@chase-wellness.com</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">← Back to Home</a>
          </div>
        </div>
      </div>
    </main>
  );
}