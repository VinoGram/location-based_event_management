import { useState, useEffect } from "react";
import { toast } from "sonner";
import { currencyService } from '../services/currencyService';
import { API_URL } from '../config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location?: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  interests?: string[];
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function FreeUserProfile({ user, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<User>(user);
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    location: {
      city: user.location?.city || "",
      state: user.location?.state || "",
      latitude: user.location?.latitude || 0,
      longitude: user.location?.longitude || 0
    },
    interests: user.interests || []
  });

  const interestOptions = [
    "Music", "Sports", "Food", "Art", "Business", "Technology", "Health", "Education"
  ];

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          location: data.location || { city: "", state: "", latitude: 0, longitude: 0 },
          interests: data.interests || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    setCurrency(currencyService.getCurrentCurrency());
  }, []);

  const getPremiumPricing = () => {
    const symbol = currency.symbol;
    const ranges = currency.priceRanges || { low: 25, medium: 50, high: 100 };
    const monthlyPrice = ranges.low * 0.4; // 40% of low range
    const yearlyPrice = monthlyPrice * 10; // 10 months price for yearly
    return {
      monthly: `${symbol}${monthlyPrice.toFixed(2)}`,
      yearly: `${symbol}${yearlyPrice.toFixed(2)}`
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: locationField === 'latitude' || locationField === 'longitude' 
            ? Number(value) 
            : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-black min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">My Profile</h2>
        <p className="text-white/70 text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-[#171717] backdrop-blur-md rounded-3xl border border-[#DDAA52]/30 p-8">
        {!isEditing ? (
          <ProfileView 
            profile={profile}
            onEdit={() => setIsEditing(true)}
            onLogout={onLogout}
          />
        ) : (
          <ProfileForm
            formData={formData}
            interestOptions={interestOptions}
            loading={loading}
            onInputChange={handleInputChange}
            onInterestToggle={handleInterestToggle}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>

      {/* Free Tier Info */}
      <div className="mt-8 bg-[#171717]/50 backdrop-blur-md rounded-2xl border border-[#DDAA52]/20 p-6">
        <h3 className="text-xl font-bold text-[#FFFFFF] mb-4">Free Account Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-[#FFFFFF] font-medium">50km Event Discovery</h4>
              <p className="text-[#FFFFFF]/60 text-sm">Find events within 50km radius</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-[#FFFFFF] font-medium">Basic Filtering</h4>
              <p className="text-[#FFFFFF]/60 text-sm">Filter by category</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-[#FFFFFF] font-medium">Simple RSVP</h4>
              <p className="text-[#FFFFFF]/60 text-sm">Going or Interested status</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <div>
              <h4 className="text-[#FFFFFF] font-medium">Social Sharing</h4>
              <p className="text-[#FFFFFF]/60 text-sm">Share events with friends</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-[#FFFFFF]/70 mb-4">Want more features?</p>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all relative flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Monthly - {getPremiumPricing().monthly}</span>
            </button>
            <button className="w-full bg-gradient-to-r from-[#A31818] to-[#CF0E0E] text-[#FFFFFF] py-3 px-6 rounded-xl font-semibold hover:from-[#CF0E0E] hover:to-[#A31818] transition-all relative flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Annual - {getPremiumPricing().yearly}</span>
              <span className="absolute -top-2 -right-2 bg-[#CF0E0E] text-[#FFFFFF] text-xs px-2 py-1 rounded-full">
                Save 17%!
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ 
  profile, 
  onEdit, 
  onLogout 
}: { 
  profile: User; 
  onEdit: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] flex items-center justify-center">
            <span className="text-3xl text-black font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </span>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-[#FFFFFF]">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-[#FFFFFF]/70">{profile.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-[#A31818] to-[#CF0E0E] text-[#FFFFFF] text-xs font-medium rounded-full">
              Free Account
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-2 px-6 rounded-xl font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            className="bg-[#171717] text-[#FFFFFF] py-2 px-6 rounded-xl font-medium hover:bg-[#171717]/80 transition-all border border-[#DDAA52]/30"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Location */}
      {profile.location && (
        <div>
          <h4 className="text-lg font-semibold text-[#FFFFFF] mb-2">Location</h4>
          <p className="text-[#FFFFFF]/80">
            {profile.location.city}, {profile.location.state}
          </p>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#FFFFFF] mb-3">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-[#171717] text-[#FFFFFF]/80 text-sm rounded-full border border-[#DDAA52]/20"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileForm({
  formData,
  interestOptions,
  loading,
  onInputChange,
  onInterestToggle,
  onSubmit,
  onCancel,
}: {
  formData: any;
  interestOptions: string[];
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInterestToggle: (interest: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[#FFFFFF] font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
          />
        </div>

        <div>
          <label className="block text-[#FFFFFF] font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[#FFFFFF] font-medium mb-2">City</label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
          />
        </div>

        <div>
          <label className="block text-[#FFFFFF] font-medium mb-2">State</label>
          <input
            type="text"
            name="location.state"
            value={formData.location.state}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
          />
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-[#FFFFFF] font-medium mb-3">Interests</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => onInterestToggle(interest)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                formData.interests.includes(interest)
                  ? "bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black"
                  : "bg-[#171717] text-[#FFFFFF]/70 hover:bg-[#171717]/80 border border-[#DDAA52]/30"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#171717] text-[#FFFFFF] py-3 px-6 rounded-xl font-semibold hover:bg-[#171717]/80 transition-all border border-[#DDAA52]/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}