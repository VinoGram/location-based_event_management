const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Calculate ticket pricing with discounts
const calculateTicketPrice = (basePrice, quantity, isPremiumUser) => {
  let totalPrice = basePrice * quantity;
  
  // 10% discount for all users
  totalPrice = totalPrice * 0.90;
  
  // 50% off one ticket per month for premium users
  if (isPremiumUser && quantity >= 1) {
    const oneTicketDiscount = basePrice * 0.50;
    totalPrice = totalPrice - oneTicketDiscount;
  }
  
  return Math.round(Math.max(0, totalPrice) * 100); // Convert to cents for Stripe
};

// Create ticket payment session
router.post('/purchase', async (req, res) => {
  try {
    const { eventId, quantity, basePrice, currency, isPremiumUser, userId } = req.body;
    
    const finalPrice = calculateTicketPrice(basePrice, quantity, isPremiumUser);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Event Tickets (${quantity}x)`,
            description: isPremiumUser ? 'Premium User - 10% + 50% off 1 ticket' : 'Standard - 10% Discount Applied'
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${eventId}`,
      metadata: {
        eventId,
        userId,
        quantity: quantity.toString(),
        isPremiumUser: isPremiumUser.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Ticket purchase error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Verify ticket purchase
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Store ticket purchase in database
      const ticketData = {
        eventId: session.metadata.eventId,
        userId: session.metadata.userId,
        quantity: parseInt(session.metadata.quantity),
        amountPaid: session.amount_total / 100,
        currency: session.currency,
        isPremiumUser: session.metadata.isPremiumUser === 'true',
        purchaseDate: new Date(),
        stripeSessionId: sessionId
      };
      
      // TODO: Save to database
      
      res.json({ success: true, ticket: ticketData });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Ticket verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;