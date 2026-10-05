const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { pool } = require('../db');

// Get chat history for a group
router.get('/groups/:groupId/messages', auth, async (req, res) => {
  try {
    const supabase = req.app.get('supabase');
    const messageModel = new Message(supabase);
    
    const messages = await messageModel.findByGroupId(req.params.groupId);
    
    res.json(messages.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      username: msg.username,
      text: msg.text,
      timestamp: msg.created_at
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message to a group
router.post('/groups/:groupId/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const supabase = req.app.get('supabase');
    const messageModel = new Message(supabase);
    const io = req.app.get('io');
    
    const message = await messageModel.create({
      groupId: req.params.groupId,
      userId: req.user.id,
      username: req.user.firstName + ' ' + req.user.lastName,
      text
    });
    
    // Broadcast to group members
    io.to(`group-${req.params.groupId}`).emit('new_message', {
      id: message.id,
      userId: message.user_id,
      username: message.username,
      text: message.text,
      timestamp: message.created_at
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get global chat messages
router.get('/global/messages', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gm.id, gm.user_id, gm.message, gm.created_at,
             u.first_name, u.last_name, u.avatar_url
      FROM global_messages gm
      LEFT JOIN users u ON u.id = gm.user_id
      ORDER BY gm.created_at ASC
      LIMIT 50
    `);
    res.json(rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      user: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Anonymous',
      message: r.message,
      timestamp: r.created_at,
      avatar: r.avatar_url || null,
    })));
  } catch (err) {
    console.error('Error fetching global messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a global chat message
router.post('/global/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const { rows } = await pool.query(`
      INSERT INTO global_messages (user_id, message)
      VALUES ($1, $2)
      RETURNING id, user_id, message, created_at
    `, [req.user.id, message.trim()]);
    const saved = rows[0];
    const userRes = await pool.query(
      'SELECT first_name, last_name, avatar_url FROM users WHERE id = $1', [req.user.id]
    );
    const u = userRes.rows[0] || {};
    res.json({
      success: true,
      message: {
        id: saved.id,
        userId: saved.user_id,
        user: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Anonymous',
        message: saved.message,
        timestamp: saved.created_at,
        avatar: u.avatar_url || null,
      }
    });
  } catch (err) {
    console.error('Error sending global message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get online users count
router.get('/global/online', auth, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { rows } = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS count FROM global_messages WHERE created_at >= $1`,
      [fiveMinutesAgo]
    );
    res.json({ count: parseInt(rows[0].count, 10) });
  } catch {
    res.json({ count: 0 });
  }
});

module.exports = router;