const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const ensureTable = require('../utils/ensureInteractionsTable');

const WEIGHTS = { click: 1, save: 3, share: 4, purchase: 5, dismiss: -3 };

// Track user interactions
router.post('/track', auth, async (req, res) => {
  try {
    const { event_id, interaction_type } = req.body;
    if (!event_id || !interaction_type) return res.status(400).json({ message: 'Missing required fields' });

    // Admin account uses id='admin' (string) — skip tracking for non-integer user ids
    const userId = parseInt(req.user.id);
    if (isNaN(userId)) return res.json({ success: true });

    const { pool } = require('../db');
    try {
      await ensureTable(pool);
      const weight = WEIGHTS[interaction_type] ?? 1;
      await pool.query(
        `INSERT INTO user_interactions (user_id, event_id, interaction_type, weight)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, event_id, interaction_type)
         DO UPDATE SET weight = GREATEST(user_interactions.weight, EXCLUDED.weight), created_at = NOW()`,
        [userId, parseInt(event_id), interaction_type, weight]
      );
    } catch (dbErr) {
      console.error('Interaction tracking error:', dbErr.message);
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true });
  }
});

// Get personalised recommendations based on real interaction history
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { pool } = require('../db');
    await ensureTable(pool);

    const userId = parseInt(req.user.id);
    if (isNaN(userId)) return res.json({ events: [], preferences: { topCategories: [] } });

    const today = new Date().toISOString().split('T')[0];

    const { rows: catRows } = await pool.query(
      `SELECT e.category, SUM(ui.weight) AS score
       FROM user_interactions ui
       JOIN events e ON e.id = ui.event_id
       WHERE ui.user_id = $1
         AND ui.created_at >= NOW() - INTERVAL '60 days'
         AND ui.weight > 0
       GROUP BY e.category
       ORDER BY score DESC
       LIMIT 4`,
      [userId]
    );

    const topCategories = catRows.map(r => r.category);

    const { rows: seenRows } = await pool.query(
      `SELECT DISTINCT event_id FROM user_interactions WHERE user_id = $1`,
      [userId]
    );
    const seenIds = seenRows.map(r => r.event_id);

    let eventsQuery = `
      SELECT e.*,
             COALESCE(v.cnt,0) AS view_count,
             COALESCE(r.cnt,0) AS rsvp_count
      FROM events e
      LEFT JOIN (SELECT event_id, COUNT(*) cnt FROM event_views  GROUP BY event_id) v ON v.event_id = e.id
      LEFT JOIN (SELECT event_id, COUNT(*) cnt FROM event_rsvps  GROUP BY event_id) r ON r.event_id = e.id
      WHERE e.status = 'approved'
        AND e.date >= $1
    `;
    const params = [today];

    if (topCategories.length > 0) {
      params.push(topCategories);
      eventsQuery += ` AND e.category = ANY($${params.length})`;
    }
    if (seenIds.length > 0) {
      params.push(seenIds);
      eventsQuery += ` AND e.id != ALL($${params.length})`;
    }

    eventsQuery += ` ORDER BY rsvp_count DESC, view_count DESC LIMIT 20`;

    const { rows: events } = await pool.query(eventsQuery, params);

    const scored = events.map(e => ({
      ...e,
      recommendationScore: topCategories.length
        ? Math.max(0.5, 1 - topCategories.indexOf(e.category) * 0.15)
        : 0.5
    }));

    res.json({ events: scored, preferences: { topCategories } });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    // Degrade gracefully — return empty rather than 500
    res.json({ events: [], preferences: { topCategories: [] } });
  }
});

module.exports = router;