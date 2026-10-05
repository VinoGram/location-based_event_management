const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get friend activity
router.get('/friends/activity', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Get user's friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', req.user.id)
      .eq('status', 'accepted');

    if (!friendships || friendships.length === 0) {
      return res.json([]);
    }

    const friendIds = friendships.map(f => f.friend_id);

    // Get recent activity from friends
    const { data: activity, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        user:users(first_name, last_name),
        event:events(id, title, date, time)
      `)
      .in('user_id', friendIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Format activity
    const formattedActivity = activity?.map(item => ({
      user: item.user,
      event: item.event,
      action: item.status === 'going' ? 'is going to' : 'is interested in',
      timestamp: item.created_at
    })) || [];

    res.json(formattedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add friend
router.post('/friends/add', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const supabase = req.app.locals.supabase;
    
    // Find user by email
    const { data: friend } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (friend.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${req.user.id},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${req.user.id})`)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    // Create friendship
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: req.user.id,
        friend_id: friend.id,
        status: 'pending'
      });

    if (error) throw error;

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.post('/friends/accept/:id', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', req.params.id)
      .eq('friend_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;