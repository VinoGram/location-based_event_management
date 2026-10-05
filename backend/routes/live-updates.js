const express = require('express');
const router = express.Router();

const clients = new Set();

// SSE endpoint for live updates
router.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Live updates connected' })}\n\n`);
});

// Broadcast update to all clients
function broadcastUpdate(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.write(message);
    } catch (error) {
      clients.delete(client);
    }
  });
}

// Trigger update (for testing)
router.post('/trigger', (req, res) => {
  const { type, message } = req.body;
  broadcastUpdate({ type, message, timestamp: new Date().toISOString() });
  res.json({ success: true });
});

module.exports = { router, broadcastUpdate };