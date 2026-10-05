import React, { useState } from 'react';
import { uploadToCloudinary } from '../services/cloudinaryService';

interface EventFlyerUploadProps {
  onFlyerUploaded: (url: string) => void;
  currentFlyer?: string;
}

const EventFlyerUpload: React.FC<EventFlyerUploadProps> = ({ onFlyerUploaded, currentFlyer }) => {
  const [uploading, setUploading] = useState(false);
  const [flyerUrl, setFlyerUrl] = useState(currentFlyer || '');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setFlyerUrl(imageUrl);
      onFlyerUploaded(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-white font-medium">Event Flyer</label>
      
      {flyerUrl ? (
        <div className="relative">
          <img src={flyerUrl} alt="Event flyer" className="w-full h-48 object-cover rounded-lg" />
          <label className="absolute top-2 right-2 bg-orange-500 rounded p-2 cursor-pointer">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-400">Click to upload flyer</p>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      )}
      
      {uploading && <p className="text-orange-500">Uploading flyer...</p>}
    </div>
  );
};

export default EventFlyerUpload;