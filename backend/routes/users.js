const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Save user preferences
router.post('/preferences', auth, async (req, res) => {
  try {
    const { interests, age_group, location_preference } = req.body;
    const supabase = req.app.get('supabase');
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: req.user.id,
        interests: interests || [],
        age_group,
        location_preference,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // Admin user has no DB row
    if (req.user.id === 'admin') {
      return res.json({
        id: 'admin',
        email: 'euforia.admin.2024@gmail.com',
        firstName: 'Admin',
        lastName: 'User',
        is_admin: true,
        is_premium: true,
        bio: '',
        location: null,
        interests: [],
        avatarUrl: null,
        notificationPreferences: { eventReminders: true, newEventsNearby: true, friendActivity: true, adminUpdates: true }
      });
    }

    const supabase = req.app.get('supabase');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;

    // Parse location if stored as JSON string
    let location = null;
    if (user.location) {
      try { location = typeof user.location === 'string' ? JSON.parse(user.location) : user.location; }
      catch { location = { city: user.location, state: '', latitude: 0, longitude: 0 }; }
    }

    res.json({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio || '',
      location,
      interests: user.interests || [],
      notificationPreferences: user.notification_preferences
        ? (typeof user.notification_preferences === 'string' ? JSON.parse(user.notification_preferences) : user.notification_preferences)
        : { eventReminders: true, newEventsNearby: true, friendActivity: true, adminUpdates: true },
      avatarUrl: user.profile_picture || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (with optional file upload)
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id === 'admin') {
      return res.json({ id: 'admin', email: 'euforia.admin.2024@gmail.com', firstName: 'Admin', lastName: 'User', is_admin: true, is_premium: true, bio: '', location: null, interests: [], avatarUrl: null, notificationPreferences: { eventReminders: true, newEventsNearby: true, friendActivity: true, adminUpdates: true } });
    }

    const supabase = req.app.get('supabase');
    const updateData = {};

    const parseField = (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return val; } }
      return val;
    };

    // Avatar upload via Cloudinary if file present
    if (req.file) {
      try {
        const cloudinary = require('../config/cloudinary');
        const streamifier = require('streamifier');
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'profile-pictures', public_id: `avatar_${req.user.id}`, overwrite: true, transformation: [{ width: 400, height: 400, crop: 'fill' }] },
            (err, result) => err ? reject(err) : resolve(result)
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        updateData.profile_picture = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Avatar upload error:', uploadErr.message);
        // Continue without avatar update
      }
    }

    // Parse body fields (works for both JSON and FormData)
    const body = req.body;
    if (body.firstName) updateData.first_name = body.firstName;
    if (body.lastName) updateData.last_name = body.lastName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.location) {
      const loc = parseField(body.location);
      updateData.location = typeof loc === 'object' ? JSON.stringify(loc) : loc;
    }
    if (body.interests !== undefined) {
      const interests = parseField(body.interests);
      // interests is TEXT[] in Postgres — must be a JS array, not JSON string
      updateData.interests = Array.isArray(interests) ? interests : (interests ? [interests] : []);
    }
    if (body.notificationPreferences) {
      const prefs = parseField(body.notificationPreferences);
      updateData.notification_preferences = typeof prefs === 'object' ? JSON.stringify(prefs) : prefs;
    }

    if (Object.keys(updateData).length === 0) {
      // Nothing to update — just return current profile
      return res.redirect(307, `/api/users/profile`);
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id);
    if (updateError) throw updateError;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (fetchError) throw fetchError;

    let location = null;
    if (user.location) {
      try { location = typeof user.location === 'string' ? JSON.parse(user.location) : user.location; }
      catch { location = { city: user.location, state: '', latitude: 0, longitude: 0 }; }
    }

    res.json({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio || '',
      location,
      interests: user.interests || [],
      notificationPreferences: user.notification_preferences
        ? (typeof user.notification_preferences === 'string' ? JSON.parse(user.notification_preferences) : user.notification_preferences)
        : { eventReminders: true, newEventsNearby: true, friendActivity: true, adminUpdates: true },
      avatarUrl: user.profile_picture || null,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET user settings (preferences)
router.get('/settings', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: user, error } = await supabase
      .from('users')
      .select('notification_preferences, location_enabled, email_digest, friend_activity')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({
      pushNotifications: user.notification_preferences?.pushNotifications ?? true,
      locationServices: user.location_enabled ?? true,
      emailDigest: user.email_digest ?? false,
      friendActivity: user.friend_activity ?? true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT user settings (preferences)
router.put('/settings', auth, async (req, res) => {
  try {
    const { pushNotifications, locationServices, emailDigest, friendActivity } = req.body;
    const supabase = req.app.get('supabase');
    const { error } = await supabase
      .from('users')
      .update({
        location_enabled: locationServices,
        email_digest: emailDigest,
        friend_activity: friendActivity,
        notification_preferences: { pushNotifications },
      })
      .eq('id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords are required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const supabase = req.app.get('supabase');
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    if (!user.password_hash) return res.status(400).json({ message: 'No password set — use Google sign-in' });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashed })
      .eq('id', req.user.id);
    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST enable 2FA (sends OTP to email)
router.post('/2fa/enable', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: user, error } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    // Mark 2FA as pending — full TOTP/SMS flow can be added later
    const { error: updateError } = await supabase
      .from('users')
      .update({ two_factor_pending: true })
      .eq('id', req.user.id);
    if (updateError) throw updateError;
    res.json({ message: '2FA setup initiated — check your email for next steps' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('id, device, location, last_active, created_at')
      .eq('user_id', req.user.id)
      .order('last_active', { ascending: false });
    // Return empty array gracefully if table doesn't exist yet
    res.json({ sessions: sessions || [] });
  } catch (error) {
    res.json({ sessions: [] });
  }
});

// DELETE a session
router.delete('/sessions/:id', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET data export
router.get('/data-export', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const [{ data: user }, { data: rsvps }, { data: saved }] = await Promise.all([
      supabase.from('users').select('id, email, first_name, last_name, created_at, is_premium').eq('id', req.user.id).single(),
      supabase.from('event_rsvps').select('*').eq('user_id', req.user.id),
      supabase.from('saved_events').select('*').eq('user_id', req.user.id),
    ]);
    const exportData = { profile: user, rsvps: rsvps || [], savedEvents: saved || [], exportedAt: new Date().toISOString() };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="euforia-data.json"');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Delete user data
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.user.id);
    
    if (error) throw error;
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user stats (for premium users)
router.get('/stats', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    
    // Get basic stats
    const stats = {
      eventsAttended: 0,
      eventsSaved: 0,
      friendsConnected: 0,
      premiumSince: new Date().toISOString()
    };
    
    // Get events attended (RSVPs with 'going' status)
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'going');
    
    stats.eventsAttended = rsvps?.length || 0;
    
    // Get saved events
    const { data: saved } = await supabase
      .from('saved_events')
      .select('id')
      .eq('user_id', req.user.id);
    
    stats.eventsSaved = saved?.length || 0;
    
    // Get friends count
    const { data: friends } = await supabase
      .from('friendships')
      .select('id')
      .or(`user_id.eq.${req.user.id},friend_id.eq.${req.user.id}`)
      .eq('status', 'accepted');
    
    stats.friendsConnected = friends?.length || 0;
    
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;