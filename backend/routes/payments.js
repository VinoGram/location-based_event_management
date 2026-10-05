const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { eventId, amount, currency } = req.body;
    const supabase = req.app.locals.supabase;
    
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', req.user.id)
      .single();

    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: event.title,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        user_id: req.user.id,
        event_id: eventId
      }
    });

    res.json({
      provider: 'stripe',
      authorization_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Premium subscription payment
router.post('/premium-subscription', auth, async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const supabase = req.app.locals.supabase;
    
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', req.user.id)
      .single();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: 'Euforia Premium Subscription',
            description: 'Monthly premium subscription with unlimited features'
          },
          unit_amount: Math.round(amount * 100),
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium/cancel`,
      metadata: {
        user_id: req.user.id,
        subscription_type: 'premium'
      }
    });

    res.json({
      provider: 'stripe',
      authorization_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { session_id } = req.body;
    const supabase = req.app.locals.supabase;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { user_id, event_id } = session.metadata;
      
      // Record successful payment
      await supabase
        .from('ticket_purchases')
        .insert({
          user_id,
          event_id,
          original_price: session.amount_total / 100,
          discount_percent: 0,
          final_price: session.amount_total / 100,
          payment_reference: session_id,
          payment_provider: 'stripe'
        });

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify premium subscription
router.post('/verify-premium', auth, async (req, res) => {
  try {
    const { session_id } = req.body;
    const supabase = req.app.locals.supabase;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { user_id } = session.metadata;
      
      // Update user to premium
      await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_subscription_id: session.subscription
        })
        .eq('id', user_id);

      res.json({ success: true, message: 'Premium subscription activated' });
    } else {
      res.status(400).json({ error: 'Premium subscription verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;