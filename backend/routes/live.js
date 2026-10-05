const express = require('express');
const router = express.Router();

// Live stream endpoint
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Send initial connection
  sendEvent({ type: 'connected', timestamp: new Date().toISOString() });
  
  // Keep connection alive
  const heartbeat = setInterval(() => {
    sendEvent({ type: 'heartbeat', timestamp: new Date().toISOString() });
  }, 30000);
  
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

module.exports = router;