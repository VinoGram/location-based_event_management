const express = require('express');
const router = express.Router();

// Intent recognition patterns
const intentPatterns = {
  time: {
    'friday': { type: 'intent', text: 'Friday events', description: 'Events happening on Friday', filter: { dayOfWeek: 5 } },
    'weekend': { type: 'intent', text: 'Weekend events', description: 'Saturday & Sunday events', filter: { weekend: true } },
    'tonight': { type: 'intent', text: 'Tonight', description: 'Events happening today', filter: { today: true } },
    'tomorrow': { type: 'intent', text: 'Tomorrow', description: 'Events happening tomorrow', filter: { tomorrow: true } }
  },
  mood: {
    'chill': { type: 'intent', text: 'Chill vibes', description: 'Relaxed, low-key events', filter: { vibe: 'chill' } },
    'fun': { type: 'intent', text: 'Fun events', description: 'Entertaining and lively events', filter: { vibe: 'fun' } },
    'romantic': { type: 'intent', text: 'Date night', description: 'Perfect for couples', filter: { vibe: 'romantic' } },
    'networking': { type: 'intent', text: 'Networking', description: 'Professional meetups', filter: { vibe: 'networking' } }
  },
  categories: {
    'concert': { type: 'category', text: 'Music concerts', description: 'Live music performances', filter: { category: 'Music' } },
    'comedy': { type: 'category', text: 'Comedy shows', description: 'Stand-up and comedy events', filter: { category: 'Comedy' } },
    'food': { type: 'category', text: 'Food events', description: 'Restaurants, food trucks, tastings', filter: { category: 'Food' } },
    'sports': { type: 'category', text: 'Sports events', description: 'Games, matches, fitness', filter: { category: 'Sports' } }
  },
  locations: {
    'accra': { type: 'location', text: 'Accra events', description: 'Events in Accra', filter: { location: 'Accra' } },
    'kumasi': { type: 'location', text: 'Kumasi events', description: 'Events in Kumasi', filter: { location: 'Kumasi' } },
    'tamale': { type: 'location', text: 'Tamale events', description: 'Events in Tamale', filter: { location: 'Tamale' } }
  }
};

// Real-time intent recognition
router.get('/intent', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const suggestions = [];

    // Check all pattern categories
    Object.values(intentPatterns).forEach(category => {
      Object.entries(category).forEach(([key, pattern]) => {
        if (key.includes(query) || query.includes(key)) {
          suggestions.push(pattern);
        }
      });
    });

    // Add fuzzy matches for event titles
    if (query.length > 2) {
      const supabase = req.app.get('supabase');
      const { data: events } = await supabase
        .from('events')
        .select('title, category, venue')
        .ilike('title', `%${query}%`)
        .eq('status', 'approved')
        .limit(3);

      events?.forEach(event => {
        suggestions.push({
          type: 'event',
          text: event.title,
          description: `${event.category} at ${event.venue}`,
          filter: { eventTitle: event.title }
        });
      });
    }

    res.json({ suggestions: suggestions.slice(0, 8) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search events with intent
router.get('/events', async (req, res) => {
  try {
    const { q, category, vibe, location, dayOfWeek, today, tomorrow, weekend } = req.query;
    const supabase = req.app.get('supabase');

    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .gte('date', new Date().toISOString().split('T')[0]);

    // Apply filters based on intent
    if (category) query = query.eq('category', category);
    if (vibe) query = query.eq('vibe', vibe);
    if (location) query = query.ilike('venue', `%${location}%`);
    
    // Date filters
    if (today) {
      query = query.eq('date', new Date().toISOString().split('T')[0]);
    }
    if (tomorrow) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query = query.eq('date', tomorrow.toISOString().split('T')[0]);
    }
    if (weekend) {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      query = query.or(`date.eq.${saturday.toISOString().split('T')[0]},date.eq.${sunday.toISOString().split('T')[0]}`);
    }

    // Text search
    if (q && !category && !vibe && !location) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,venue.ilike.%${q}%`);
    }

    const { data: events, error } = await query.limit(20);
    
    if (error) throw error;
    res.json(events || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze comment sentiment
router.post('/analyze-comment', async (req, res) => {
  try {
    const { comment, eventId } = req.body;
    
    // Simple sentiment analysis
    const positiveWords = ['great', 'amazing', 'awesome', 'fantastic', 'love', 'perfect', 'excellent', 'fun', 'enjoyed'];
    const negativeWords = ['bad', 'terrible', 'boring', 'expensive', 'disappointing', 'waste', 'awful', 'hate'];
    
    const words = comment.toLowerCase().split(' ');
    let sentiment = 'neutral';
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    if (score > 0) sentiment = 'positive';
    if (score < 0) sentiment = 'negative';
    
    // Extract keywords for event tagging
    const keywords = words.filter(word => 
      ['funny', 'hilarious', 'energetic', 'chill', 'romantic', 'professional', 'educational'].includes(word)
    );

    res.json({ sentiment, score, keywords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;