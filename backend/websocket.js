const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });
  const alertsWss = new WebSocket.Server({ server, path: '/alerts' });
  
  const chatClients = new Map();
  const planningClients = new Map();
  const globalChatClients = new Map();
  const alertsClients = new Map();

  // Handle alerts WebSocket connections
  alertsWss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token) {
      alertsClients.set(ws, { token });
      ws.send(JSON.stringify({ type: 'connected', message: 'Live updates enabled' }));
      
      // Send periodic updates
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'heartbeat', 
            timestamp: new Date().toISOString() 
          }));
        }
      }, 30000);
      
      ws.on('close', () => {
        clearInterval(interval);
        alertsClients.delete(ws);
      });
    } else {
      ws.close();
    }
  });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const type = url.pathname.split('/')[2]; // chat, planning, or global-chat

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (type === 'chat') {
          handleChatMessage(ws, data, chatClients);
        } else if (type === 'planning') {
          handlePlanningMessage(ws, data, planningClients);
        } else if (type === 'global-chat') {
          handleGlobalChatMessage(ws, data, globalChatClients);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (type === 'chat') {
        chatClients.delete(ws);
      } else if (type === 'planning') {
        planningClients.delete(ws);
      } else if (type === 'global-chat') {
        globalChatClients.delete(ws);
        broadcast(globalChatClients, { type: 'online_count', count: globalChatClients.size });
      }
    });
  });

  function handleChatMessage(ws, data, clients) {
    switch (data.type) {
      case 'join':
        clients.set(ws, { room: data.room });
        break;
      case 'message':
        broadcast(clients, {
          type: 'message',
          user: data.user,
          message: data.message,
          timestamp: new Date().toISOString()
        }, data.room);
        break;
    }
  }

  function handlePlanningMessage(ws, data, clients) {
    switch (data.type) {
      case 'join':
        clients.set(ws, { room: data.room });
        break;
      case 'join_plan':
        broadcast(clients, {
          type: 'plan_update',
          planId: data.planId,
          attendees: Math.floor(Math.random() * 10) + 1 // Simulate dynamic attendee count
        });
        break;
      case 'create_plan':
        broadcast(clients, {
          type: 'new_plan',
          plan: data.plan
        });
        break;
    }
  }

  function handleGlobalChatMessage(ws, data, clients) {
    switch (data.type) {
      case 'join':
        clients.set(ws, { room: data.room });
        broadcast(clients, { type: 'online_count', count: clients.size });
        break;
      case 'message':
        broadcast(clients, {
          type: 'message',
          user: data.user,
          message: data.message,
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  function broadcast(clients, message, room = null) {
    clients.forEach((clientInfo, client) => {
      if (client.readyState === WebSocket.OPEN && (!room || clientInfo.room === room)) {
        client.send(JSON.stringify(message));
      }
    });
  }

  function broadcastAlert(alert) {
    alertsClients.forEach((clientInfo, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(alert));
      }
    });
  }

  function broadcastEventUpdate(eventData) {
    const update = {
      type: 'event_update',
      data: eventData,
      timestamp: new Date().toISOString()
    };
    broadcastAlert(update);
  }

  function broadcastNewEvent(eventData) {
    const notification = {
      type: 'new_event',
      message: `New event: ${eventData.title}`,
      data: eventData,
      timestamp: new Date().toISOString()
    };
    broadcastAlert(notification);
  }

  // Export broadcast functions for use in routes
  server.broadcastAlert = broadcastAlert;
  server.broadcastEventUpdate = broadcastEventUpdate;
  server.broadcastNewEvent = broadcastNewEvent;
}

module.exports = { setupWebSocket };