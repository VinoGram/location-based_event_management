import { useState, useEffect } from "react";
import { toast } from "sonner";
import { currencyService } from '../services/currencyService';
import { API_URL } from '../config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  is_premium: boolean;
  avatarUrl?: string;
  location?: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  interests?: string[];
  premium_features?: {
    unlimited_radius: boolean;
    advanced_filters: boolean;
    priority_support: boolean;
    exclusive_events: boolean;
  };
}

interface PremiumUserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function PremiumUserProfile({ user, onLogout }: PremiumUserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<User>(user);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());
  const [stats, setStats] = useState({
    eventsAttended: 0,
    eventsSaved: 0,
    friendsConnected: 0,
    premiumSince: new Date().toISOString()
  });

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
    "Music", "Sports", "Food", "Art", "Business", "Technology", "Health", "Education", "Travel", "Gaming"
  ];

  useEffect(() => {
    fetchProfile();
    fetchStats();
    setCurrency(currencyService.getCurrentCurrency());
  }, []);

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

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
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
            ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
        toast.success('Premium profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.9;
        const compress = () => {
          canvas.toBlob((blob) => {
            if (blob && blob.size <= 99000) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else if (quality > 0.1) {
              quality -= 0.1;
              compress();
            } else {
              resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
            }
          }, 'image/jpeg', quality);
        };
        compress();
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const compressedFile = await compressImage(file);
      const uploadData = new FormData();
      uploadData.append('avatar', compressedFile);

      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
        toast.success('Profile picture updated!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Premium Profile</h2>
        <p className="text-white/70 text-lg">
          Manage your premium account and exclusive features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
            {!isEditing ? (
              <PremiumProfileView 
                profile={profile}
                stats={stats}
                onEdit={() => setIsEditing(true)}
                onLogout={onLogout}
                onImageUpload={handleImageUpload}
                uploadingImage={uploadingImage}
              />
            ) : (
              <PremiumProfileForm
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
        </div>

        {/* Premium Features Sidebar */}
        <div className="space-y-6">
          <PremiumFeatures />
          <PremiumStats stats={stats} currency={currency} />
        </div>
      </div>
    </div>
  );
}

function PremiumProfileView({ profile, stats, onEdit, onLogout, onImageUpload, uploadingImage }: {
  profile: User;
  stats: any;
  onEdit: () => void;
  onLogout: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center relative overflow-hidden">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              )}
              <div className="absolute -top-2 -right-2">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <label className="absolute -bottom-2 -right-2 bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-full cursor-pointer transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={onImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              {uploadingImage ? (
                <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-white/70">{profile.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium Member
              </span>
              {uploadingImage && (
                <span className="text-yellow-400 text-xs">Uploading...</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-2 px-6 rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            className="bg-white/10 text-white py-2 px-6 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            Logout
          </button>
        </div>
      </div>

      {profile.location && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Location</h4>
          <p className="text-white/80">{profile.location.city}, {profile.location.state}</p>
        </div>
      )}

      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 text-sm rounded-full border border-yellow-400/30"
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

function PremiumProfileForm({ formData, interestOptions, loading, onInputChange, onInterestToggle, onSubmit, onCancel }: {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">City</label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">State</label>
          <input
            type="text"
            name="location.state"
            value={formData.location.state}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-white/10 border border-yellow-400/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-3">Interests (Premium: Unlimited)</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => onInterestToggle(interest)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                formData.interests.includes(interest)
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 px-6 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Premium Profile"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PremiumFeatures() {
  return (
    <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 backdrop-blur-md rounded-2xl border border-yellow-400/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Premium Features
      </h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-white font-medium text-sm">Unlimited Radius</h4>
            <p className="text-white/60 text-xs">Find events anywhere</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-white font-medium text-sm">Advanced Filters</h4>
            <p className="text-white/60 text-xs">Price, date, size filters</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div>
            <h4 className="text-white font-medium text-sm">Exclusive Events</h4>
            <p className="text-white/60 text-xs">Premium-only access</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-white font-medium text-sm">AI Recommendations</h4>
            <p className="text-white/60 text-xs">Personalized suggestions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-white font-medium text-sm">Priority Support</h4>
            <p className="text-white/60 text-xs">24/7 premium help</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumStats({ stats, currency }: { stats: any; currency: any }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Events Attended</span>
          <span className="text-white font-bold">{stats.eventsAttended}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Events Saved</span>
          <span className="text-white font-bold">{stats.eventsSaved}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Friends Connected</span>
          <span className="text-white font-bold">{stats.friendsConnected}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Premium Since</span>
          <span className="text-white font-bold">
            {new Date(stats.premiumSince).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}