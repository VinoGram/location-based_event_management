import { API_URL } from '../config';

export class RecommendationService {
  static async trackInteraction(eventId: string | number, type: 'click' | 'save' | 'share' | 'purchase' | 'dismiss', metadata?: any) {
    const token = sessionStorage.getItem('token');
    if (!token || !eventId) return;
    try {
      await fetch(`${API_URL}/api/interactions/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ event_id: eventId, interaction_type: type, metadata: metadata || {} })
      });
      // Silently ignore failures — tracking is non-critical
    } catch {
      // network error, ignore
    }
  }

  static async getPersonalizedRecommendations(limit = 10) {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    try {
      const response = await fetch(`${API_URL}/api/interactions/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.events.slice(0, limit);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
    
    return [];
  }

  static async getTrendingEvents(limit = 20) {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/trending?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        // Viral events always come first (backend already orders by trend_score DESC,
        // but we pin is_viral=true to the very top client-side as a safety net)
        return data.sort((a: any, b: any) => {
          if (a.is_viral && !b.is_viral) return -1;
          if (!a.is_viral && b.is_viral) return 1;
          return 0;
        });
      }
    } catch (error) {
      console.error('Failed to get trending events:', error);
    }
    return [];
  }

  static async getContentBasedRecommendations(eventId: string, limit = 3) {
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`);
      if (!response.ok) return [];
      const event = await response.json();

      // Score by: same category (required) + proximity if coords exist
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams({ category: event.category });

      // Use event's own coords as the search centre so nearby same-category events surface
      const lat = event.latitude ?? event.location?.latitude;
      const lng = event.longitude ?? event.location?.longitude;
      if (lat != null && lng != null) {
        params.set('latitude', lat);
        params.set('longitude', lng);
        params.set('radius', '100');
      } else {
        // No coords — fall back to a wide global fetch filtered by category
        params.set('latitude', '0');
        params.set('longitude', '0');
        params.set('radius', '20000');
      }

      const simRes = await fetch(`${API_URL}/api/events/nearby?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!simRes.ok) return [];
      const similar = await simRes.json();
      return similar
        .filter((e: any) => String(e.id ?? e._id) !== String(eventId))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get content-based recommendations:', error);
    }
    return [];
  }
}