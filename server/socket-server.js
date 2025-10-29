const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Store document states per room
const documentStates = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-collaboration', (data) => {
    const { pageId, projectId, userId, userName, userEmail } = data;
    const roomId = `${projectId}:${pageId}`;

    socket.join(roomId);

    if (!documentStates.has(roomId)) {
      documentStates.set(roomId, {
        pageId,
        projectId,
        content: '',
        version: 0,
        activeUsers: new Map(),
      });
    }

    const docState = documentStates.get(roomId);
    docState.activeUsers.set(socket.id, {
      userId,
      userName,
      userEmail,
      color: getRandomColor(),
    });

    socket.emit('document-state', {
      content: docState.content,
      version: docState.version,
      activeUsers: Array.from(docState.activeUsers.values()),
    });

    io.to(roomId).emit('user-joined', {
      userId,
      userName,
      activeUsers: Array.from(docState.activeUsers.values()),
    });

    console.log(`User ${userName} joined room ${roomId}`);
  });

  socket.on('document-change', (data) => {
    const { pageId, projectId, userId, content, version } = data;
    const roomId = `${projectId}:${pageId}`;
    const docState = documentStates.get(roomId);

    if (!docState) return;

    docState.content = content;
    docState.version = version + 1;
    docState.lastModifiedBy = userId;
    docState.lastModifiedAt = Date.now();

    socket.to(roomId).emit('document-change', {
      content,
      version: docState.version,
      userId,
      timestamp: Date.now(),
    });

    console.log(`Document ${roomId} updated by ${userId} - version ${docState.version}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    documentStates.forEach((docState, roomId) => {
      if (docState.activeUsers.has(socket.id)) {
        const user = docState.activeUsers.get(socket.id);
        docState.activeUsers.delete(socket.id);

        io.to(roomId).emit('user-left', {
          userId: user.userId,
          userName: user.userName,
          activeUsers: Array.from(docState.activeUsers.values()),
        });

        if (docState.activeUsers.size === 0) {
          documentStates.delete(roomId);
        }
      }
    });
  });
});

function getRandomColor() {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Socket.io collaboration server running on http://localhost:${PORT}`);
});