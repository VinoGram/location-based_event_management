export default function CookiePolicy({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDAA52]/20">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Cookie Policy</h2>
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
            This Cookie Policy explains how <span className="text-[#DDAA52] font-semibold">Euforia</span> uses cookies and similar storage technologies when you use our platform. By continuing to use Euforia, you agree to the use of these technologies as described below.
          </p>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">1. What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device by your browser. They allow websites to remember information about your visit — such as your login state or preferences — so you don't have to re-enter them each time. Euforia also uses browser-native storage mechanisms (localStorage and sessionStorage) which serve a similar purpose.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">2. How We Use Storage Technologies</h3>
            <p className="mb-2">Euforia uses the following types of storage:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li><span className="text-[#FFFFFF]">Authentication tokens</span> — stored in localStorage or sessionStorage to keep you logged in across sessions</li>
              <li><span className="text-[#FFFFFF]">User preferences</span> — such as language settings and notification choices, saved locally so they persist between visits</li>
              <li><span className="text-[#FFFFFF]">Session state</span> — temporary data used during your active session (e.g. form state, navigation history) that is cleared when you close the browser</li>
              <li><span className="text-[#FFFFFF]">Cached profile data</span> — your profile information is cached locally to reduce load times and enable offline access</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">3. Essential vs. Non-Essential</h3>
            <p className="mb-2">All storage used by Euforia is <span className="text-[#FFFFFF] font-medium">essential</span> to the functioning of the platform:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>We do not use advertising cookies or tracking pixels</li>
              <li>We do not use third-party analytics cookies (e.g. Google Analytics)</li>
              <li>We do not share cookie data with advertisers or data brokers</li>
              <li>No cross-site tracking is performed</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">4. Third-Party Services</h3>
            <p className="mb-2">Some third-party services integrated into Euforia may set their own storage entries:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li><span className="text-[#FFFFFF]">Cloudinary</span> — used for image uploads; may store upload session tokens temporarily</li>
              <li><span className="text-[#FFFFFF]">Neon (PostgreSQL)</span> — server-side database; does not set client-side cookies</li>
              <li><span className="text-[#FFFFFF]">OAuth providers</span> — if you sign in via Google or another provider, they may set their own cookies governed by their respective privacy policies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">5. Managing Your Storage</h3>
            <p className="mb-2">You can control and clear stored data at any time:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>Clear localStorage and sessionStorage via your browser's developer tools or settings</li>
              <li>Logging out of Euforia will clear your authentication token from storage</li>
              <li>Deleting your account will remove all server-side data associated with your profile</li>
            </ul>
            <p className="mt-2">Note: clearing storage will log you out and reset any saved preferences.</p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">6. Data Retention</h3>
            <p>
              Authentication tokens expire after a set period (typically 7 days for "remember me" sessions, or at browser close for session-only logins). Cached profile data is refreshed on each login. No storage data is retained after account deletion.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">7. Changes to This Policy</h3>
            <p>
              We may update this Cookie Policy as our platform evolves. Any significant changes will be communicated via an in-app notice or email. Continued use of Euforia after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">8. Contact Us</h3>
            <p>
              If you have questions about how we use cookies or storage, contact us at:<br />
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
