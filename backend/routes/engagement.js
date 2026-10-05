const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Track engagement signals
router.post('/track', auth, async (req, res) => {
  try {
    const { eventId, action, value, duration } = req.body;
    const supabase = req.app.locals.supabase;
    
    let score = 0;
    
    // Calculate engagement score based on action
    switch (action) {
      case 'interested': score = 5; break;
      case 'rating_5': score = 4; break;
      case 'rating_4': score = 2; break;
      case 'rating_3': score = 0; break;
      case 'rating_2': score = -2; break;
      case 'rating_1': score = -3; break;
      case 'positive_comment': score = 3; break;
      case 'negative_comment': score = -3; break;
      case 'view_time': score = duration > 30 ? 1 : 0; break;
      case 'share': score = 6; break;
    }

    // Store engagement signal
    await supabase
      .from('user_engagement')
      .insert({
        user_id: req.user.id,
        event_id: eventId,
        action,
        score,
        value,
        duration
      });

    res.json({ success: true, score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's engagement profile
router.get('/profile', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: engagement } = await supabase
      .from('user_engagement')
      .select('*, events(category)')
      .eq('user_id', req.user.id);

    // Calculate category preferences
    const categoryScores = {};
    engagement?.forEach(e => {
      const category = e.events?.category;
      if (category) {
        categoryScores[category] = (categoryScores[category] || 0) + e.score;
      }
    });

    const preferences = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, score]) => ({ category, score }));

    res.json({ preferences, totalEngagement: engagement?.length || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;