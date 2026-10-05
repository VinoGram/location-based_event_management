const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const RecommendationEngine = require('../services/recommendationEngine');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

const upload = multer({ memory: true, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Specific routes MUST come before /:id wildcard ────────────────────────────

// Create event
router.post('/create', auth, upload.single('flyer'), async (req, res) => {
  try {
    const { title, description, category, date, time, location } = req.body;
    const supabase = req.app.get('supabase');
    
    const locationData = typeof location === 'string' ? JSON.parse(location) : location;
    
    let flyerUrl = null;
    
    // Handle flyer upload via Cloudinary
    if (req.file) {
      try {
        let quality = 80;
        let compressedBuffer;

        do {
          compressedBuffer = await sharp(req.file.buffer)
            .resize(800, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality })
            .toBuffer();
          quality -= 10;
        } while (compressedBuffer.length > 2097152 && quality > 10);

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'event-flyers', public_id: `flyer_${req.user.id}_${Date.now()}` },
            (error, result) => error ? reject(error) : resolve(result)
          );
          stream.end(compressedBuffer);
        });

        flyerUrl = uploadResult.secure_url;
      } catch (flyerError) {
        console.log('Flyer upload failed, continuing without it:', flyerError.message);
      }
    }
    
    // Check if user has auto-approval enabled
    const { data: userData } = await supabase
      .from('users')
      .select('auto_approve_next, approved_events_count')
      .eq('id', req.user.id)
      .single();

    const autoApprove = userData?.auto_approve_next > 0;
    const eventStatus = autoApprove ? 'approved' : 'pending';

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        category,
        date,
        time,
        location_name: locationData?.name || 'TBD',
        location_address: locationData?.address || 'TBD',
        creator_id: req.user.id,
        status: eventStatus,
        flyer_url: flyerUrl
      })
      .select()
      .single();

    // If auto-approved, decrement the counter
    if (autoApprove) {
      await supabase
        .from('users')
        .update({ auto_approve_next: userData.auto_approve_next - 1 })
        .eq('id', req.user.id);
    }

    if (error) throw error;
    res.json({ message: 'Event submitted for approval', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get events with premium filtering
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, category, radius, priceCategory, isVirtual, sortBy, dateFrom, dateTo } = req.query;
    const userRadius = parseInt(radius) || 50;
    const supabase = req.app.get('supabase');
    const token = req.headers.authorization?.replace('Bearer ', '');
    let currentUserId = null;
    
    // Get current user ID if authenticated
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        currentUserId = payload.id || payload.user_id || payload.userId;
        console.log('Current user ID:', currentUserId);
      } catch (error) {
        console.error('Token parsing error:', error);
      }
    }
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = Math.min(parseInt(radius) || 50, 500);

    // ── Resolve date preset → dateFrom / dateTo ──────────────────────────────
    const { datePreset } = req.query;
    let resolvedDateFrom = dateFrom || '';
    let resolvedDateTo   = dateTo   || '';
    if (datePreset && !resolvedDateFrom) {
      const now   = new Date();
      const today = now.toISOString().split('T')[0];
      const pad   = n => String(n).padStart(2, '0');
      const fmt   = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      if (datePreset === 'today') {
        resolvedDateFrom = resolvedDateTo = today;
      } else if (datePreset === 'tomorrow') {
        const t = new Date(now); t.setDate(t.getDate() + 1);
        resolvedDateFrom = resolvedDateTo = fmt(t);
      } else if (datePreset === 'this_weekend') {
        const day = now.getDay(); // 0=Sun
        const sat = new Date(now); sat.setDate(now.getDate() + ((6 - day + 7) % 7 || 7));
        const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
        resolvedDateFrom = fmt(sat); resolvedDateTo = fmt(sun);
      } else if (datePreset === 'next_week') {
        const mon = new Date(now); mon.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        resolvedDateFrom = fmt(mon); resolvedDateTo = fmt(sun);
      } else if (datePreset === 'this_month') {
        resolvedDateFrom = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;
        const last = new Date(now.getFullYear(), now.getMonth()+1, 0);
        resolvedDateTo = fmt(last);
      } else if (datePreset === 'next_month') {
        const nm = new Date(now.getFullYear(), now.getMonth()+1, 1);
        const last = new Date(now.getFullYear(), now.getMonth()+2, 0);
        resolvedDateFrom = fmt(nm); resolvedDateTo = fmt(last);
      }
    }

    // ── Haversine bounding box pre-filter (1 degree ≈ 111 km) ───────────────
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos(lat * Math.PI / 180));
    const minLat = lat - latDelta, maxLat = lat + latDelta;
    const minLng = lng - lngDelta, maxLng = lng + lngDelta;

    let query = supabase
      .from('events')
      .select(`*, users!creator_id(first_name,last_name), event_comments(id,comment,created_at,users!user_id(first_name,last_name,profile_picture))`)
      .eq('status', 'approved')
      .gte('latitude', minLat).lte('latitude', maxLat)
      .gte('longitude', minLng).lte('longitude', maxLng);

    if (category) query = query.in('category', category.split(','));
    if (resolvedDateFrom) query = query.gte('date', resolvedDateFrom);
    if (resolvedDateTo)   query = query.lte('date', resolvedDateTo);

    // Price category filter
    if (priceCategory) {
      const cats = priceCategory.split(',');
      // We'll filter in JS after fetch since price ranges depend on currency
      // but we can do a quick free/paid split in SQL
      if (cats.includes('free') && cats.length === 1) {
        query = query.eq('price', 0);
      } else if (!cats.includes('free') && cats.every(c => c.startsWith('under') || c.startsWith('over'))) {
        query = query.gt('price', 0);
      }
    }

    const { data: rawEvents, error } = await query.limit(500);

    // ── Exact Haversine distance filter ─────────────────────────────────────
    const toRad = d => d * Math.PI / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    let events = (rawEvents || []).filter(e => {
      if (e.latitude == null || e.longitude == null) return true;
      return haversine(lat, lng, parseFloat(e.latitude), parseFloat(e.longitude)) <= radiusKm;
    }).map(e => ({
      ...e,
      distance_km: e.latitude != null
        ? Math.round(haversine(lat, lng, parseFloat(e.latitude), parseFloat(e.longitude)) * 10) / 10
        : null
    }));

    // ── Price category JS filter (fine-grained) ──────────────────────────────
    if (priceCategory) {
      const cats = priceCategory.split(',');
      events = events.filter(e => {
        const p = parseFloat(e.price) || 0;
        return cats.some(c => {
          if (c === 'free')        return p === 0;
          if (c === 'under25')     return p > 0 && p < 25;
          if (c === 'under50')     return p > 0 && p < 50;
          if (c === 'over50')      return p >= 50;
          // dynamic labels like under30, over30 etc.
          const m = c.match(/^(under|over)(\d+)$/);
          if (m) return m[1] === 'under' ? (p > 0 && p < +m[2]) : p >= +m[2];
          return true;
        });
      });
    }

    // ── priceMin / priceMax filter ───────────────────────────────────────────
    const priceMin = parseFloat(req.query.priceMin);
    const priceMax = parseFloat(req.query.priceMax);
    if (!isNaN(priceMin) && priceMin > 0)
      events = events.filter(e => (parseFloat(e.price) || 0) >= priceMin);
    if (!isNaN(priceMax) && priceMax < 1000)
      events = events.filter(e => (parseFloat(e.price) || 0) <= priceMax);

    if (error) {
      console.error('Events query error:', error);
      return res.json([]);
    }

    // Fetch real counts for all events
    const eventIds = (events || []).map(e => e.id);
    let rsvpCounts = {}, viewCounts = {}, commentCounts = {};
    if (eventIds.length > 0) {
      const { pool } = require('../db');
      const [rsvpRes, viewRes, commentRes] = await Promise.all([
        pool.query('SELECT event_id, COUNT(*) as count FROM event_rsvps WHERE event_id = ANY($1) GROUP BY event_id', [eventIds]),
        pool.query('SELECT event_id, COUNT(*) as count FROM event_views WHERE event_id = ANY($1) GROUP BY event_id', [eventIds]),
        pool.query('SELECT event_id, COUNT(*) as count FROM event_comments WHERE event_id = ANY($1) GROUP BY event_id', [eventIds])
      ]);
      rsvpRes.rows.forEach(r => rsvpCounts[r.event_id] = parseInt(r.count));
      viewRes.rows.forEach(r => viewCounts[r.event_id] = parseInt(r.count));
      commentRes.rows.forEach(r => commentCounts[r.event_id] = parseInt(r.count));
    }
    const transformedEvents = (events || []).map(event => {
      const isOwner = currentUserId && (event.creator_id === currentUserId || event.creator_id === parseInt(currentUserId));
      const views = viewCounts[event.id] || 0;
      const rsvps = rsvpCounts[event.id] || 0;
      const cmts = commentCounts[event.id] || 0;
      return {
        ...event,
        isOwner,
        creatorName: `${event.users?.first_name || ''} ${event.users?.last_name || ''}`.trim() || 'Unknown',
        analytics: {
          views,
          rsvps,
          comments: cmts,
          engagement: views > 0 ? Math.round((rsvps / views) * 100) : 0,
          reach: views + rsvps * 3,
          shares: 0
        },
        comments: (event.event_comments || []).map(comment => ({
          user: `${comment.users?.first_name || 'User'} ${comment.users?.last_name || ''}`.trim(),
          text: comment.comment,
          date: comment.created_at,
          avatar: comment.users?.profile_picture
        }))
      };
    });

    // Sort by relevance: today/future first (ascending by date), then past events (descending)
    const today = new Date().toISOString().split('T')[0];
    transformedEvents.sort((a, b) => {
      const aIsFuture = a.date >= today;
      const bIsFuture = b.date >= today;
      if (aIsFuture && bIsFuture) return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      if (!aIsFuture && !bIsFuture) return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
      return aIsFuture ? -1 : 1;
    });

    res.json(transformedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get personalized recommendations — must be before /:id
router.get('/for-you', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    if (!supabase) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Get user's interaction history
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('events(category)')
      .eq('user_id', req.user.id);
    
    const { data: ratings } = await supabase
      .from('event_ratings')
      .select('events(category), rating')
      .eq('user_id', req.user.id);
    
    const { data: views } = await supabase
      .from('event_views')
      .select('events(category)')
      .eq('user_id', req.user.id);
    
    // Calculate preferences
    const categoryCount = {};
    [...(rsvps || []), ...(ratings || []), ...(views || [])].forEach(item => {
      if (item.events?.category) {
        categoryCount[item.events.category] = (categoryCount[item.events.category] || 0) + 1;
      }
    });
    
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
    
    // Get recommended events
    let query = supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0]);
    
    if (topCategories.length > 0) {
      query = query.in('category', topCategories);
    }
    
    const { data: events, error } = await query.limit(20);
    
    if (error) throw error;
    
    const preferences = {
      topCategories,
      eventsAttended: rsvps?.length || 0,
      matchScore: Math.min(95, (topCategories.length * 20) + (rsvps?.length || 0) * 5)
    };
    
    res.json({ events: events || [], preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's saved events — must be before /:id
router.get('/user/saved', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: savedEvents, error } = await supabase
      .from('saved_events')
      .select(`
        events (
          id,
          title,
          description,
          category,
          date,
          time,
          location_name,
          location_address,
          flyer_url,
          creator_id,
          status,
          created_at
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Saved events error:', error);
      return res.json([]);
    }

    const events = savedEvents?.map(item => item.events) || [];
    res.json(events);
  } catch (error) {
    console.error('Saved events catch error:', error);
    res.json([]);
  }
});

// Get events created by the authenticated user — must be before /:id
router.get('/user/my-events', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, description, category, date, time, location_name, location_address, flyer_url, status, created_at, price')
      .eq('creator_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(events || []);
  } catch (error) {
    console.error('My events fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an event created by the authenticated user — must be before /:id
router.delete('/user/my-events/:id', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('id, creator_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.creator_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete my event error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get friend activity — must be before /:id
router.get('/friend-activity', auth, async (req, res) => {
  try {
    res.json({ friendActivity: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Parameterized routes AFTER all specific routes ────────────────────────────

// Get real analytics for a single event (owner only)
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { pool } = require('../db');
    const eventId = req.params.id;

    // Verify ownership
    const ownerCheck = await pool.query(
      'SELECT creator_id FROM events WHERE id = $1',
      [eventId]
    );
    if (!ownerCheck.rows.length) return res.status(404).json({ message: 'Event not found' });
    if (String(ownerCheck.rows[0].creator_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [viewRes, rsvpRes, commentRes, saveRes, ratingRes] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM event_views    WHERE event_id = $1', [eventId]),
      pool.query('SELECT COUNT(*) AS count FROM event_rsvps    WHERE event_id = $1', [eventId]),
      pool.query('SELECT COUNT(*) AS count FROM event_comments WHERE event_id = $1', [eventId]),
      pool.query('SELECT COUNT(*) AS count FROM saved_events   WHERE event_id = $1', [eventId]),
      pool.query('SELECT AVG(rating)::numeric(3,1) AS avg, COUNT(*) AS count FROM event_ratings WHERE event_id = $1', [eventId]),
    ]);

    const views    = parseInt(viewRes.rows[0].count);
    const rsvps    = parseInt(rsvpRes.rows[0].count);
    const comments = parseInt(commentRes.rows[0].count);
    const saves    = parseInt(saveRes.rows[0].count);
    const avgRating = parseFloat(ratingRes.rows[0].avg) || 0;
    const ratingCount = parseInt(ratingRes.rows[0].count);

    res.json({
      views,
      rsvps,
      comments,
      saves,
      avgRating,
      ratingCount,
      engagement: views > 0 ? Math.round((rsvps / views) * 100) : 0,
      reach: views + rsvps * 3 + saves * 2,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get event details
router.get('/:id', async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RSVP to event
router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const supabase = req.app.get('supabase');
    
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: req.params.id,
        user_id: req.user.id,
        status: status,
        created_at: new Date().toISOString()
      }, { onConflict: 'event_id,user_id' });

    if (error) throw error;
    res.json({ message: 'RSVP updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save/unsave event
router.post('/:id/save', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { data: existing } = await supabase
      .from('saved_events')
      .select('id')
      .eq('event_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      await supabase
        .from('saved_events')
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase
        .from('saved_events')
        .insert({
          event_id: req.params.id,
          user_id: req.user.id
        });
    }

    res.json({ message: 'Event save status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate event
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const supabase = req.app.get('supabase');
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const { error } = await supabase
      .from('event_ratings')
      .upsert({
        event_id: req.params.id,
        user_id: req.user.id,
        rating: rating
      });

    if (error) throw error;
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const supabase = req.app.get('supabase');
    
    const { data: newComment, error } = await supabase
      .from('event_comments')
      .insert({
        event_id: parseInt(req.params.id),
        user_id: req.user.id,
        comment: comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      throw error;
    }
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new_comment', {
        eventId: req.params.id,
        comment: comment,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get comments for an event
router.get('/:id/comments', async (req, res) => {
  try {
    const { pool } = require('../db');
    const { rows } = await pool.query(
      `SELECT ec.id, ec.comment, ec.created_at,
              u.first_name, u.last_name, u.profile_picture
       FROM event_comments ec
       LEFT JOIN users u ON u.id = ec.user_id
       WHERE ec.event_id = $1
       ORDER BY ec.created_at DESC`,
      [req.params.id]
    );
    res.json(rows.map(r => ({
      id: r.id,
      comment: r.comment,
      created_at: r.created_at,
      users: {
        first_name: r.first_name,
        last_name: r.last_name,
        profile_picture: r.profile_picture || null
      }
    })));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Track event view
router.post('/:id/view', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    const { error } = await supabase
      .from('event_views')
      .insert({
        event_id: req.params.id,
        user_id: req.user.id,
        viewed_at: new Date().toISOString()
      });

    if (error) throw error;
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
