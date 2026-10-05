const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { pool } = require('./db');

require('dotenv').config();

const app = express();
const server = createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  /^https:\/\/.*\.vercel\.app$/,
  /^http:\/\/192\.168\./
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Neon database client (Supabase-compatible API)
const { buildClient } = require('./db');
const supabase = buildClient(require('./db').pool);

// Make supabase available to routes
app.set('supabase', supabase);
app.set('supabaseAdmin', supabase);

// WebSocket connection handling
const Message = require('./models/Message');
const globalChatUsers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
  });
  
  socket.on('join-global-chat', async () => {
    socket.join('global-chat');
    globalChatUsers.add(socket.id);
    io.to('global-chat').emit('global-online-count', globalChatUsers.size);

    try {
      const { rows } = await pool.query(`
        SELECT gm.id, gm.user_id, gm.message, gm.created_at,
               u.first_name, u.last_name, u.avatar_url
        FROM global_messages gm
        LEFT JOIN users u ON u.id = gm.user_id
        ORDER BY gm.created_at ASC
        LIMIT 50
      `);
      socket.emit('global-message-history', rows.map(r => ({
        id: r.id,
        user: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Anonymous',
        message: r.message,
        avatar: r.avatar_url || null,
        timestamp: r.created_at,
      })));
    } catch (err) {
      console.error('Error loading global message history:', err);
    }
  });
  
  socket.on('send-global-message', async (data) => {
    let userId = null;
    if (data.token) {
      try {
        const payload = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64').toString());
        userId = payload.id;
      } catch {}
    }

    try {
      const { rows } = await pool.query(`
        INSERT INTO global_messages (user_id, message)
        VALUES ($1, $2)
        RETURNING id, user_id, message, created_at
      `, [userId, data.message]);

      const saved = rows[0];

      // Fetch user info
      let userName = data.user || 'Anonymous';
      let avatarUrl = data.avatar || null;
      if (userId) {
        const userRes = await pool.query(
          'SELECT first_name, last_name, avatar_url FROM users WHERE id = $1', [userId]
        );
        if (userRes.rows[0]) {
          const u = userRes.rows[0];
          userName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || userName;
          avatarUrl = u.avatar_url || avatarUrl;
        }
      }

      io.to('global-chat').emit('global-message', {
        id: saved.id,
        user: userName,
        message: saved.message,
        avatar: avatarUrl,
        timestamp: saved.created_at,
      });
    } catch (err) {
      console.error('Error saving global message:', err);
      // Fallback broadcast without DB
      io.to('global-chat').emit('global-message', {
        user: data.user,
        message: data.message,
        avatar: data.avatar,
        timestamp: data.timestamp,
      });
    }
  });
  
  socket.on('join-group', async (data) => {
    const { groupId, token } = data;
    socket.join(`group-${groupId}`);
    
    // Send message history from group_messages table
    try {
      const { data: messages, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      
      if (!error) {
        socket.emit('message_history', { messages: messages || [] });
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
    }
  });
  
  socket.on('send_message', async (data) => {
    const { groupId, text, userId, username } = data;
    
    try {
      const { data: message, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: userId,
          message: text
        })
        .select()
        .single();
      
      if (!error && message) {
        // Fetch avatar for the sender
        const { data: user } = await supabase
          .from('users')
          .select('avatar_url, profile_picture')
          .eq('id', userId)
          .single();

        io.to(`group-${groupId}`).emit('message', {
          message: {
            id: message.id,
            userId: message.user_id,
            username: username,
            avatar: user?.avatar_url || user?.profile_picture || null,
            text: message.message,
            timestamp: message.created_at
          }
        });
      } else {
        socket.emit('error', { message: 'Failed to send message' });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    globalChatUsers.delete(socket.id);
    io.to('global-chat').emit('global-online-count', globalChatUsers.size);
  });
});

// Make io and server available to routes
app.set('io', io);
app.set('server', server);

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/premium', require('./routes/premium'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/live', require('./routes/live'));



// Make broadcast functions available globally
setTimeout(() => {
  if (server.broadcastNewEvent) {
    app.set('broadcastNewEvent', server.broadcastNewEvent);
    app.set('broadcastEventUpdate', server.broadcastEventUpdate);
  }
}, 1000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});