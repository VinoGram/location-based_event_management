const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Save onboarding preferences
router.post('/preferences', auth, async (req, res) => {
  try {
    const { categories, vibes, priceRange } = req.body;
    const supabase = req.app.locals.supabase;
    
    // Create initial engagement signals based on preferences
    const signals = [];
    
    categories?.forEach(category => {
      signals.push({
        user_id: req.user.id,
        event_id: null,
        action: 'onboarding_preference',
        score: 3,
        value: category,
        created_at: new Date().toISOString()
      });
    });
    
    vibes?.forEach(vibe => {
      signals.push({
        user_id: req.user.id,
        event_id: null,
        action: 'vibe_preference',
        score: 2,
        value: vibe,
        created_at: new Date().toISOString()
      });
    });

    if (signals.length > 0) {
      await supabase.from('user_engagement').insert(signals);
    }

    // Update user profile
    await supabase
      .from('users')
      .update({ 
        onboarded: true,
        preferred_categories: categories,
        preferred_vibes: vibes,
        price_range: priceRange
      })
      .eq('id', req.user.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending events for cold start
router.get('/trending', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Get events with most engagement this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: trending } = await supabase
      .from('user_engagement')
      .select('event_id, COUNT(*) as engagement_count')
      .gte('created_at', weekAgo.toISOString())
      .gte('score', 2)
      .group('event_id')
      .order('engagement_count', { ascending: false })
      .limit(10);

    const eventIds = trending?.map(t => t.event_id) || [];
    
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .eq('status', 'approved');
      
      res.json(events || []);
    } else {
      // Fallback to recent events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(10);
      
      res.json(events || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;