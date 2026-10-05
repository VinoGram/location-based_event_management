import { useCallback } from 'react';
import { API_URL } from '../config';

export function useEngagement() {
  const trackEngagement = useCallback(async (
    eventId: string, 
    action: string, 
    value?: any, 
    duration?: number
  ) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/engagement/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, action, value, duration })
      });
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }, []);

  const trackViewTime = useCallback((eventId: string, startTime: number) => {
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      trackEngagement(eventId, 'view_time', null, duration);
    };
  }, [trackEngagement]);

  const trackRating = useCallback((eventId: string, rating: number) => {
    trackEngagement(eventId, `rating_${rating}`, rating);
  }, [trackEngagement]);

  const trackInterested = useCallback(async (eventId: string) => {
    await trackEngagement(eventId, 'interested');
    // Send real-time feedback
    await sendFeedback(eventId, 'interested', 5);
  }, [trackEngagement]);

  const sendFeedback = useCallback(async (eventId: string, action: string, score: number) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/recommendations/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId, action, score })
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  }, []);

  return { trackEngagement, trackViewTime, trackRating, trackInterested, sendFeedback };
}