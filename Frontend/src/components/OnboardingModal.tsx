import React, { useState } from 'react';
import { API_URL } from '../config';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState('');
  const [location, setLocation] = useState('');

  const categories = ['Music', 'Technology', 'Art', 'Sports', 'Food', 'Business', 'Health', 'Education'];
  const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/users/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interests,
          age_group: ageGroup,
          location_preference: location
        })
      });
      
      onComplete();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      onComplete(); // Continue anyway
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#171717] rounded-3xl border border-[#FB8B24]/30 p-8 max-w-md w-full">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Euforia!</h2>
            <p className="text-white/70 mb-6">Let's personalize your experience. What interests you?</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleInterestToggle(category)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    interests.includes(category)
                      ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={interests.length === 0}
              className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Almost done!</h2>
            <p className="text-white/70 mb-6">Help us recommend better events for you.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white font-medium mb-2">Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-white"
                >
                  <option value="">Select age group</option>
                  {ageGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Preferred Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown, Brooklyn"
                  className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-white placeholder-white/50"
                />
              </div>
            </div>
            
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 rounded-xl font-semibold"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </div>
  );
}
