const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Create event (requires approval)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, time, venue, category, latitude, longitude, price } = req.body;
    const supabase = req.app.locals.supabase;
    
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        date,
        time,
        venue,
        category,
        latitude,
        longitude,
        price: price || 0,
        creator_id: req.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Event submitted for approval', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;