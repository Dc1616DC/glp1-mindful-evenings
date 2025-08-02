export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account Information:</strong> Email address, name (optional)</li>
                <li><strong>Check-in Data:</strong> Emotional states, hunger levels, activity choices, reflection notes</li>
                <li><strong>Usage Data:</strong> Check-in frequency, feature usage, session times</li>
                <li><strong>Payment Information:</strong> Processed securely by Stripe (we don't store card details)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide and personalize the Service</li>
                <li>Generate insights and patterns from your check-ins</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important service updates (not marketing)</li>
                <li>Improve and develop new features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
              <p className="font-medium mb-2">We NEVER sell, rent, or share your personal data.</p>
              <p>We may share information only:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>With service providers (Firebase for data storage, Stripe for payments)</li>
                <li>If required by law or legal process</li>
                <li>To protect rights, safety, or property</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Firebase</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data</li>
              </ul>
              <p className="mt-2 text-sm">However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Data Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Correct:</strong> Update inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
              <p>We retain your information:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Active account data: As long as your account is active</li>
                <li>Deleted account data: Removed within 90 days</li>
                <li>Anonymized analytics: May be retained indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
              <p>We use essential cookies for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Authentication and security</li>
                <li>Remembering your preferences</li>
                <li>Basic analytics (privacy-focused)</li>
              </ul>
              <p className="mt-2">We do NOT use third-party tracking or advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
              <p>The Service is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Privacy Policy</h2>
              <p>We may update this policy from time to time. We will notify you of significant changes via email or through the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p>For privacy-related questions or to exercise your data rights:</p>
              <p className="font-medium mt-2">Email: Dan@chase-wellness.com</p>
              <p className="mt-2">Response time: Within 72 hours</p>
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