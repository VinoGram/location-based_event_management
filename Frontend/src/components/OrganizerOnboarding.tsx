import React, { useState } from 'react';
import { toast } from 'sonner';

interface OrganizerOnboardingProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function OrganizerOnboarding({ onComplete, onClose }: OrganizerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    bankAccount: '',
    routingNumber: '',
    taxId: ''
  });

  const steps = [
    { title: 'Business Info', description: 'Tell us about your business' },
    { title: 'Get Paid', description: 'Set up your bank account' },
    { title: 'Verify Identity', description: 'Quick verification for security' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success('Setup complete! You can now start selling tickets.');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#171717] rounded-2xl border border-[#FB8B24]/30 w-full max-w-md p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#FB8B24] mb-2">Welcome, Event Organizer!</h2>
          <p className="text-[#FFFFFF]/70">Set up your payout method to start selling tickets</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index + 1 <= currentStep 
                    ? 'bg-[#FB8B24] text-black' 
                    : 'bg-[#171717] border border-[#FFFFFF]/30 text-[#FFFFFF]/50'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index + 1 < currentStep ? 'bg-[#FB8B24]' : 'bg-[#FFFFFF]/20'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-[#FFFFFF]/70 text-sm">
            Step {currentStep} of 3: {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-4 mb-6">
          {currentStep === 1 && (
            <>
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
                  placeholder="Your business or organization name"
                />
              </div>
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Business Type</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
                >
                  <option value="">Select type</option>
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="nonprofit">Non-profit</option>
                </select>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center text-green-400 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your financial information is secured and encrypted by our payment partners
                </div>
              </div>
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
                  placeholder="Enter your account number"
                />
              </div>
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Routing Number</label>
                <input
                  type="text"
                  value={formData.routingNumber}
                  onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
                  placeholder="9-digit routing number"
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-[#FB8B24]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#FB8B24]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-[#FFFFFF] font-semibold mb-2">Quick Identity Verification</h3>
                <p className="text-[#FFFFFF]/70 text-sm">This helps us keep your account secure and comply with financial regulations</p>
              </div>
              <div>
                <label className="block text-[#FFFFFF] text-sm font-medium mb-2">Tax ID / SSN (Last 4 digits)</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                  className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
                  placeholder="Last 4 digits only"
                  maxLength={4}
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-[#FFFFFF]/30 text-[#FFFFFF]/70 rounded-lg hover:bg-[#FFFFFF]/10 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black rounded-lg font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
          >
            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-[#FFFFFF]/50 text-xs">
            🔒 All data is encrypted and processed securely through our certified payment partners
          </p>
        </div>
      </div>
    </div>
  );
}