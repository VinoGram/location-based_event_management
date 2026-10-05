export default function TermsAndConditions({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDAA52]/20">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">Terms and Conditions</h2>
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
            These Terms and Conditions govern your use of <span className="text-[#DDAA52] font-semibold">Euforia</span>, a location-based event management platform. By creating an account or using our services, you agree to be bound by these terms. Please read them carefully.
          </p>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using Euforia, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be legally bound by them. If you do not agree, you must not use the platform.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">2. Your Account</h3>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must provide accurate and truthful information when registering</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>You must notify us immediately of any unauthorised use of your account</li>
              <li>You may not create multiple accounts or share your account with others</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">3. Event Creation and Submission</h3>
            <p className="mb-2">When you submit an event on Euforia, you agree that:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>All event information is accurate, truthful, and not misleading</li>
              <li>You have the right and authority to organise and promote the event</li>
              <li>The event does not violate any applicable laws or regulations</li>
              <li>Event content does not contain offensive, discriminatory, or harmful material</li>
              <li>All submitted events are subject to admin review and approval before being published</li>
              <li>Euforia reserves the right to reject or remove any event without notice</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">4. Prohibited Conduct</h3>
            <p className="mb-2">You must not use Euforia to:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>Post false, misleading, or fraudulent events or information</li>
              <li>Harass, threaten, or harm other users</li>
              <li>Promote illegal activities, violence, or hate speech</li>
              <li>Spam other users or send unsolicited communications</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Scrape, copy, or redistribute platform content without permission</li>
              <li>Impersonate another person or organisation</li>
              <li>Upload malicious code, viruses, or harmful content</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">5. User Content</h3>
            <p>
              By submitting content to Euforia (including event descriptions, images, comments, and profile information), you grant us a non-exclusive, royalty-free licence to display, distribute, and promote that content within the platform. You retain ownership of your content. We do not claim ownership over anything you post.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">6. Tickets and Payments</h3>
            <p>
              Euforia facilitates connections between event organisers and attendees. We are not a payment processor. Any ticket purchases made via USSD codes or external web links are transactions between you and the event organiser. Euforia is not responsible for payment disputes, refunds, or event cancellations. Always verify event details before making any payment.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">7. Intellectual Property</h3>
            <p>
              The Euforia name, logo, design, and platform code are the intellectual property of Euforia and its creators. You may not copy, reproduce, or use our branding or platform code without prior written permission.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">8. Disclaimers</h3>
            <p className="mb-2">Euforia is provided "as is" without warranties of any kind. We do not guarantee:</p>
            <ul className="list-disc list-inside space-y-1 text-[#FFFFFF]/70">
              <li>That the platform will be available at all times without interruption</li>
              <li>The accuracy or completeness of event information posted by users</li>
              <li>That events listed will take place as described</li>
              <li>The safety or quality of any event listed on the platform</li>
            </ul>
            <p className="mt-2">Attendance at any event is at your own risk. Always exercise personal safety and judgment.</p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">9. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, Euforia and its team shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to loss of data, personal injury at events, or financial loss from ticket purchases.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">10. Account Suspension and Termination</h3>
            <p>
              We reserve the right to suspend or permanently terminate your account at our discretion if you violate these Terms, engage in fraudulent activity, or cause harm to other users or the platform. You may delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">11. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email or an in-app notice. Continued use of Euforia after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">12. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of Euforia shall be resolved through good-faith negotiation, and if unresolved, through the appropriate legal channels.
            </p>
          </section>

          <section>
            <h3 className="text-[#DDAA52] font-semibold text-base mb-2">13. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at:<br />
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
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
