const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Upgrade to premium
router.post('/upgrade', auth, async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    const supabase = req.app.locals.supabase;
    
    const expiryDate = plan === 'annual' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        is_premium: true,
        premium_expiry_date: expiryDate.toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Upgraded to premium!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Check premium status
    const { data: user } = await supabase
      .from('users')
      .select('is_premium, premium_expiry_date, interests')
      .eq('id', req.user.id)
      .single();

    if (!user?.is_premium || (user.premium_expiry_date && new Date(user.premium_expiry_date) < new Date())) {
      return res.status(403).json({ message: 'Premium feature' });
    }

    // Get recommendations based on interests
    const { data: recommendations, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users(first_name, last_name)
      `)
      .in('category', user.interests || [])
      .gte('date', new Date().toISOString())
      .eq('is_public', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(recommendations || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get premium-only events
router.get('/exclusive-events', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Check premium status
    const { data: user } = await supabase
      .from('users')
      .select('is_premium, premium_expiry_date')
      .eq('id', req.user.id)
      .single();

    if (!user?.is_premium || (user.premium_expiry_date && new Date(user.premium_expiry_date) < new Date())) {
      return res.status(403).json({ message: 'Premium feature' });
    }

    const { data: exclusiveEvents, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users(first_name, last_name)
      `)
      .eq('is_exclusive', true)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    res.json(exclusiveEvents || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Early access events
router.get('/early-access', auth, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Check premium status
    const { data: user } = await supabase
      .from('users')
      .select('is_premium, premium_expiry_date')
      .eq('id', req.user.id)
      .single();

    if (!user?.is_premium || (user.premium_expiry_date && new Date(user.premium_expiry_date) < new Date())) {
      return res.status(403).json({ message: 'Premium feature' });
    }

    const { data: earlyAccessEvents, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users(first_name, last_name)
      `)
      .not('early_access_date', 'is', null)
      .gte('early_access_date', new Date().toISOString())
      .gte('date', new Date().toISOString())
      .order('early_access_date', { ascending: true });

    if (error) throw error;

    res.json(earlyAccessEvents || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;