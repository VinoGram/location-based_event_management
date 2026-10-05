import React from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';

export default function UpdateNotification() {
  const { updateAvailable, updateApp } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-pink-400 to-rose-500 text-white p-4 rounded-xl shadow-lg z-50 max-w-sm">
      <div className="flex items-center space-x-3">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="font-medium">New version available!</p>
          <p className="text-sm opacity-90">Click to update</p>
        </div>
        <button
          onClick={updateApp}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
}