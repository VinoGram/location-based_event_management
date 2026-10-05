const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
  try {
    const { pin } = req.body;
    
    if (pin && pin === process.env.ADMIN_PIN) {
      const token = jwt.sign(
        { id: 'admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token, user: { role: 'admin' } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin middleware
const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.id !== 'admin' && decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get pending events
router.get('/events/pending', adminAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // First try with join, fallback to simple query
    let { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // If no events found, check for events without status (newly created)
    if (!events || events.length === 0) {
      const { data: newEvents } = await supabase
        .from('events')
        .select('*')
        .is('status', null)
        .order('created_at', { ascending: false });
      events = newEvents || [];
    }

    // Get user details for each event
    if (events && events.length > 0) {
      for (let event of events) {
        const { data: userArray } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', event.creator_id);
        event.users = userArray && userArray.length > 0 ? userArray[0] : null;
      }
    }

    if (error) throw error;
    res.json(events || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics data
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Get basic counts
    const [usersResult, eventsResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('events').select('id, status, category', { count: 'exact' })
    ]);
    
    // Try to get additional data, but don't fail if tables don't exist
    let totalRSVPs = 0, totalViews = 0, totalComments = 0, ratings = [];
    try {
      const rsvpsResult = await supabase.from('event_rsvps').select('id', { count: 'exact' });
      totalRSVPs = rsvpsResult.count || 0;
    } catch (e) {}
    
    try {
      const viewsResult = await supabase.from('event_views').select('id', { count: 'exact' });
      totalViews = viewsResult.count || 0;
    } catch (e) {}
    
    try {
      const commentsResult = await supabase.from('event_comments').select('id', { count: 'exact' });
      totalComments = commentsResult.count || 0;
    } catch (e) {
      console.log('Comments table query failed:', e.message);
      // Try to create the table if it doesn't exist
      try {
        await supabase.rpc('exec', {
          sql: `CREATE TABLE IF NOT EXISTS event_comments (
            id SERIAL PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            comment TEXT NOT NULL,
            sentiment VARCHAR(20) DEFAULT 'neutral',
            created_at TIMESTAMP DEFAULT NOW()
          )`
        });
      } catch (createError) {
        console.log('Failed to create comments table:', createError.message);
      }
      totalComments = 0;
    }
    
    try {
      const ratingsResult = await supabase.from('event_ratings').select('rating');
      ratings = ratingsResult.data || [];
    } catch (e) {}

    const totalUsers = usersResult.count || 0;
    const totalEvents = eventsResult.count || 0;
    const events = eventsResult.data || [];
    
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const approvedEvents = events.filter(e => e.status === 'approved').length;
    const rejectedEvents = events.filter(e => e.status === 'rejected').length;
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
    
    // Top categories
    const categoryCount = {};
    events.forEach(event => {
      if (event.category) {
        categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Recent activity - fetch real data
    let recentActivity = [];
    
    try {
      // Get recent comments
      const { data: recentComments, error: commentsError } = await supabase
        .from('event_comments')
        .select(`
          comment, 
          created_at,
          users!user_id(first_name, last_name),
          events!event_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('Comments query result:', { recentComments, commentsError });
      
      if (recentComments && recentComments.length > 0) {
        recentComments.forEach(comment => {
          const userName = comment.users?.first_name || 'User';
          const eventTitle = comment.events?.title || 'Event';
          recentActivity.push({
            type: 'comment',
            description: `${userName} commented: "${comment.comment.substring(0, 50)}${comment.comment.length > 50 ? '...' : ''}"`,
            timestamp: comment.created_at
          });
        });
      } else {
        console.log('No recent comments found');
      }
    } catch (e) {
      console.log('Failed to fetch recent comments:', e.message);
    }
    
    try {
      // Get recent events
      const { data: recentEvents } = await supabase
        .from('events')
        .select('title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentEvents) {
        recentEvents.forEach(event => {
          recentActivity.push({
            type: 'event',
            description: `Event "${event.title}" ${event.status === 'approved' ? 'approved' : 'submitted for approval'}`,
            timestamp: event.created_at
          });
        });
      }
    } catch (e) {
      console.log('Failed to fetch recent events:', e.message);
    }
    
    // Sort by timestamp and limit to 10 most recent
    recentActivity = recentActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    // Fallback if no activity found
    if (recentActivity.length === 0) {
      recentActivity = [
        { type: 'system', description: 'System initialized', timestamp: new Date().toISOString() }
      ];
    }
    
    res.json({
      totalUsers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      totalRSVPs,
      totalViews,
      totalComments,
      totalRatings,
      averageRating,
      topCategories,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, is_admin, is_suspended, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    // Get approved events count for each user
    const usersWithCounts = await Promise.all(
      (users || []).map(async (user) => {
        try {
          const { count } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', user.id)
            .eq('status', 'approved');
          
          return { ...user, approved_events_count: count || 0 };
        } catch (e) {
          return { ...user, approved_events_count: 0 };
        }
      })
    );
    
    res.json(usersWithCounts);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Suspend/unsuspend user
router.put('/users/:id/suspend', adminAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Get current suspension status
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('is_suspended')
      .eq('id', req.params.id);
    
    if (fetchError) throw fetchError;
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    const newStatus = !user?.is_suspended;
    
    const { error } = await supabase
      .from('users')
      .update({ is_suspended: newStatus })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: `User ${newStatus ? 'suspended' : 'unsuspended'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Delete related data first to avoid foreign key constraints
    await Promise.all([
      supabase.from('event_rsvps').delete().eq('user_id', req.params.id),
      supabase.from('event_ratings').delete().eq('user_id', req.params.id),
      supabase.from('event_comments').delete().eq('user_id', req.params.id),
      supabase.from('event_views').delete().eq('user_id', req.params.id),
      supabase.from('saved_events').delete().eq('user_id', req.params.id),
      supabase.from('group_members').delete().eq('user_id', req.params.id),
      supabase.from('group_messages').delete().eq('user_id', req.params.id)
    ]);
    
    // Delete user's events
    await supabase.from('events').delete().eq('creator_id', req.params.id);
    
    // Finally delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject event with auto-approval algorithm
router.put('/events/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const supabase = req.app.get('supabase');
    
    // Get event details
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('creator_id')
      .eq('id', req.params.id);

    if (eventError) throw eventError;
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];

    // Update event status
    const { error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', req.params.id);

    if (error) throw error;

    // Broadcast event approval to all connected clients
    if (status === 'approved') {
      const io = req.app.get('io');
      if (io) {
        io.emit('event_approved', { eventId: req.params.id });
      }
    }

    // If approved, update user's approved count and check for auto-approval
    if (status === 'approved') {
      // Get user's current approved count
      const { data: userDataArray, error: userError } = await supabase
        .from('users')
        .select('approved_events_count')
        .eq('id', event.creator_id);

      if (!userError && userDataArray && userDataArray.length > 0) {
        const userData = userDataArray[0];
        const currentCount = (userData?.approved_events_count || 0) + 1;
        
        // Update approved count
        await supabase
          .from('users')
          .update({ approved_events_count: currentCount })
          .eq('id', event.creator_id);

        // Auto-approval algorithm: after 5 approved events, next 3 are auto-approved
        if (currentCount >= 5 && (currentCount - 5) % 8 < 3) {
          // Enable auto-approval for this user's next events
          await supabase
            .from('users')
            .update({ auto_approve_next: 3 - ((currentCount - 5) % 8) })
            .eq('id', event.creator_id);
        }
      }
    }

    res.json({ message: `Event ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;