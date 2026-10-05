import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

export const useNotifications = () => {
  useEffect(() => {
    // Notifications disabled for now
    console.log('Notifications system ready');
  }, []);

  const requestNotificationPermission = async () => {
    console.log('Notification permission requested');
  };

  return { requestNotificationPermission };
};