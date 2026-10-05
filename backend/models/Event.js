const supabase = require('../supabase');

class Event {
  static async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        creator_id: eventData.creator,
        tags: eventData.tags || [],
        flyer_url: eventData.flyerUrl,
        is_public: eventData.isPublic !== false,
        max_attendees: eventData.maxAttendees,
        is_virtual: eventData.isVirtual || false,
        price: eventData.price || 0,
        price_category: eventData.priceCategory || 'free',
        is_exclusive: eventData.is_exclusive || false,
        early_access_date: eventData.earlyAccessDate,
        rating: 0,
        rating_count: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!creator_id(*),
        attendees:event_attendees(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findNearby(latitude, longitude, radius = 50, filters = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:users!creator_id(*),
        attendees:event_attendees(*)
      `)
      .eq('status', 'approved');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.isVirtual) {
      query = query.eq('is_virtual', true);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filter by distance (simplified - in production use PostGIS)
    return data.filter(event => {
      if (event.is_virtual) return true;
      const distance = this.calculateDistance(
        latitude, longitude,
        event.location.latitude, event.location.longitude
      );
      return distance <= radius;
    });
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static async updateById(id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteById(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

module.exports = Event;