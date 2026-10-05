import { useState, useEffect } from 'react';
import { RecommendationService } from '../services/recommendationService';

export const useRecommendations = (isPremium: boolean) => {
  const [personalizedEvents, setPersonalizedEvents] = useState<any[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    if (!isPremium) return;
    
    setLoading(true);
    try {
      const [personalized, trending] = await Promise.all([
        RecommendationService.getPersonalizedRecommendations(12),
        RecommendationService.getTrendingEvents(8)
      ]);
      
      setPersonalizedEvents(personalized);
      setTrendingEvents(trending);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = (eventId: string, type: 'click' | 'save' | 'share' | 'purchase' | 'dismiss') => {
    RecommendationService.trackInteraction(eventId, type);
  };

  useEffect(() => {
    loadRecommendations();
  }, [isPremium]);

  return {
    personalizedEvents,
    trendingEvents,
    loading,
    trackInteraction,
    refreshRecommendations: loadRecommendations
  };
};