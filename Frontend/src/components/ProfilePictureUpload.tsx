import React, { useState } from 'react';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { supabase } from '../lib/supabase';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdated: (url: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentImageUrl, onImageUpdated }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      
      // Save URL to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.user.id,
            email: user.user.email,
            profile_picture_url: imageUrl 
          });
        
        if (!error) onImageUpdated(imageUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <img 
          src={currentImageUrl || '/default-avatar.png'} 
          alt="Profile" 
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
        />
        <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {uploading && <p className="text-orange-500 text-sm">Uploading...</p>}
    </div>
  );
};

export default ProfilePictureUpload;