const express = require('express');
const router = express.Router();
const ensureInteractionsTable = require('../utils/ensureInteractionsTable');

// Viral threshold — events above this trend_score get the viral badge
const VIRAL_THRESHOLD = 20;

// Trending — velocity-based score using last 48h window
// Formula: views + rsvps*3 + shares*5  (all within 48h for velocity)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const { pool } = require('../db');
    await ensureInteractionsTable(pool);
    const today = new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT e.*,
              COALESCE(v.cnt, 0)                                                        AS view_count,
              COALESCE(r.cnt, 0)                                                        AS rsvp_count,
              COALESCE(s.cnt, 0)                                                        AS share_count,
              COALESCE(v.cnt, 0) + COALESCE(r.cnt, 0) * 3 + COALESCE(s.cnt, 0) * 5    AS trend_score
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) cnt
         FROM event_views
         GROUP BY event_id
       ) v ON v.event_id = e.id
       LEFT JOIN (
         SELECT event_id, COUNT(*) cnt
         FROM event_rsvps
         GROUP BY event_id
       ) r ON r.event_id = e.id
       LEFT JOIN (
         SELECT event_id, COUNT(*) cnt
         FROM user_interactions
         WHERE interaction_type = 'share'
           AND created_at >= NOW() - INTERVAL '48 hours'
         GROUP BY event_id
       ) s ON s.event_id = e.id
       WHERE e.status = 'approved'
         AND e.date >= $1
       ORDER BY trend_score DESC, e.date ASC
       LIMIT $2`,
      [today, parseInt(limit)]
    );

    // Tag each event with whether it has crossed the viral threshold
    const tagged = rows.map(e => ({
      ...e,
      is_viral: Number(e.trend_score) >= VIRAL_THRESHOLD
    }));

    res.json(tagged);
  } catch (error) {
    console.error('Trending error:', error.message);
    res.json([]); // degrade gracefully
  }
});

// Personalised — delegates to interactions route logic (kept for backwards compat)
router.get('/personalized', async (req, res) => {
  res.redirect('/api/interactions/recommendations');
});

module.exports = router;