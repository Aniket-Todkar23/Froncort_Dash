const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active clients per page
const pageClients = new Map();

wss.on('connection', (ws) => {
  let currentPage = null;
  let userId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'JOIN':
          currentPage = message.pageId;
          userId = message.userId;
          userName = message.userName;

          // Add client to page
          if (!pageClients.has(currentPage)) {
            pageClients.set(currentPage, []);
          }
          pageClients.get(currentPage).push({ ws, userId, userName });

          // Notify others that user joined
          broadcastToPage(currentPage, {
            type: 'USER_JOINED',
            userId,
            userName,
          }, ws);

          console.log(`User ${userName} joined page ${currentPage}`);
          break;

        case 'CONTENT_CHANGE':
          // Broadcast content changes to all users on this page
          broadcastToPage(currentPage, {
            type: 'CONTENT_UPDATED',
            userId,
            userName: message.userName,
            content: message.content,
            timestamp: Date.now(),
          }, ws);

          console.log(`Content update from ${message.userName} on page ${currentPage}`);
          break;

        case 'TYPING':
          // Broadcast typing indicator
          broadcastToPage(currentPage, {
            type: 'USER_TYPING',
            userId,
            userName: message.userName,
            position: message.position,
          }, ws);
          break;

        case 'STOP_TYPING':
          broadcastToPage(currentPage, {
            type: 'USER_STOPPED_TYPING',
            userId,
          }, ws);
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    if (currentPage && userId) {
      // Remove client from page
      const clients = pageClients.get(currentPage);
      if (clients) {
        const index = clients.findIndex(c => c.userId === userId);
        if (index > -1) {
          const { userName } = clients[index];
          clients.splice(index, 1);

          // Notify others that user left
          broadcastToPage(currentPage, {
            type: 'USER_LEFT',
            userId,
            userName,
          });

          if (clients.length === 0) {
            pageClients.delete(currentPage);
          }
        }
      }
      console.log(`User left page ${currentPage}`);
    }
  });
});

function broadcastToPage(pageId, message, excludeWs = null) {
  const clients = pageClients.get(pageId);
  if (!clients) return;

  const data = JSON.stringify(message);
  clients.forEach(({ ws }) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Collaboration server running on ws://localhost:${PORT}`);
});
