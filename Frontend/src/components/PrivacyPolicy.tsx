export default function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDAA52]/20">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Privacy Policy</h2>
          <button onClick={onClose} className="text-[#FFFFFF]/50 hover:text-[#FFFFFF] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-[#FFFFFF]/80 text-sm leading-relaxed">
          <p className="text-[#FFFFFF]/50 text-xs">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <p>
            Welcome to <span className="text-[#DDAA52] font-semibold">Euforia</span>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">1. Information We Collect</h3>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>Name, email address, and password when you register</li>
              <li>Profile information such as bio, interests, and profile picture</li>
              <li>Event data you submit including titles, descriptions, and location</li>
              <li>Communications you send us via support or feedback channels</li>
            </ul>
            <p className="mt-2">We also collect information automatically when you use Euforia:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70 mt-1">
              <li>Device information (browser type, operating system)</li>
              <li>Location data (only when you grant permission)</li>
              <li>Usage data such as events viewed, RSVPs, and interactions</li>
              <li>Log data including IP address and access times</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>To create and manage your account</li>
              <li>To show you events near your location</li>
              <li>To personalise event recommendations based on your interests</li>
              <li>To send you event reminders and platform notifications</li>
              <li>To process event submissions and approvals</li>
              <li>To improve our platform and develop new features</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">3. Location Data</h3>
            <p>
              Euforia uses your device location solely to show you events near you. We do not sell or share your precise location with third parties. Location access is optional — you can use the platform without granting location permission, though event discovery will be limited.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">4. Sharing Your Information</h3>
            <p className="mb-2">We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li><span className="text-[#FFFFFF]">Service providers</span> — such as cloud hosting (Neon), image storage (Cloudinary), and email delivery, who process data on our behalf</li>
              <li><span className="text-[#FFFFFF]">Other users</span> — your public profile name and event RSVPs may be visible to other users</li>
              <li><span className="text-[#FFFFFF]">Legal authorities</span> — when required by law or to protect the rights and safety of our users</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">5. Data Retention</h3>
            <p>
              We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">6. Your Rights</h3>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for location access at any time via your device settings</li>
              <li>Object to processing of your data for marketing purposes</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <span className="text-[#DDAA52]">eventseuforia0@gmail.com</span>.</p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">7. Cookies and Tracking</h3>
            <p>
              Euforia uses browser local storage and session storage to keep you logged in and remember your preferences. We do not use third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">8. Security</h3>
            <p>
              We implement industry-standard security measures including password hashing (bcrypt), JWT-based authentication, and encrypted database connections (SSL/TLS). However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">9. Children's Privacy</h3>
            <p>
              Euforia is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">10. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform or sending an email. Continued use of Euforia after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">11. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <span className="text-[#DDAA52]">eventseuforia0@gmail.com</span>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#DDAA52]/20">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black font-semibold rounded-xl hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
