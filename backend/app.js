const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { buildClient } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Build Neon-backed supabase-compatible client
const supabase = buildClient(require('./db').pool);

// Make supabase available to routes
app.set('supabase', supabase);
app.locals.supabase = supabase;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://euforia-event.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));
app.use('/api/premium', require('./routes/premium'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/social', require('./routes/social'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/create-event', require('./routes/create-event'));

// MapTiler proxy — keeps API key server-side
app.get('/api/map/static', async (req, res) => {
  const { lng, lat, zoom = 14, width = 600, height = 220 } = req.query;
  if (!lng || !lat) return res.status(400).json({ message: 'lng and lat required' });
  const key = process.env.MAPTILER_KEY;
  const url = `https://api.maptiler.com/maps/streets-v2/static/${lng},${lat},${zoom}/${width}x${height}.png?key=${key}&markers=${lng},${lat}`;
  try {
    const mapRes = await fetch(url);
    if (!mapRes.ok) return res.status(mapRes.status).end();
    const buffer = await mapRes.arrayBuffer();
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ message: 'Map fetch failed' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const { pool } = require('./db');
    await pool.query('SELECT 1');
    console.log('✅ Neon database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});

module.exports = { app, supabase };
