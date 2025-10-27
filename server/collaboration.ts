import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

interface UserPresence {
  userId: string
  userName: string
  userEmail: string
  color: string
  isTyping: boolean
  cursorPosition?: { line: number; column: number }
  selection?: { start: number; end: number }
  timestamp: number
}

interface DocumentState {
  pageId: string
  projectId: string
  content: string
  version: number
  lastModifiedBy: string
  lastModifiedAt: number
  activeUsers: Map<string, UserPresence>
}

interface ChangeEvent {
  pageId: string
  projectId: string
  userId: string
  content: string
  version: number
  timestamp: number
  operation?: {
    type: 'insert' | 'delete'
    position: number
    text?: string
  }
}

const colors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
]

let colorIndex = 0

export function setupCollaborationServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  // Store document states per project
  const documentStates = new Map<string, DocumentState>()
  const userSessions = new Map<string, { userId: string; projectId: string; pageId: string }>()

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id)

    // Handle joining a collaborative editing session
    socket.on('join-collaboration', (data: {
      pageId: string
      projectId: string
      userId: string
      userName: string
      userEmail: string
    }) => {
      const { pageId, projectId, userId, userName, userEmail } = data
      const roomId = `${projectId}:${pageId}`

      // Store user session
      userSessions.set(socket.id, { userId, projectId, pageId })

      // Join the room
      socket.join(roomId)

      // Get or create document state
      let docState = documentStates.get(roomId)
      if (!docState) {
        docState = {
          pageId,
          projectId,
          content: '',
          version: 0,
          lastModifiedBy: userId,
          lastModifiedAt: Date.now(),
          activeUsers: new Map(),
        }
        documentStates.set(roomId, docState)
      }

      // Add user presence
      const userPresence: UserPresence = {
        userId,
        userName,
        userEmail,
        color: colors[colorIndex % colors.length],
        isTyping: false,
        timestamp: Date.now(),
      }
      colorIndex++

      docState.activeUsers.set(socket.id, userPresence)

      // Send current document state to the user
      socket.emit('document-state', {
        content: docState.content,
        version: docState.version,
        activeUsers: Array.from(docState.activeUsers.values()),
      })

      // Broadcast user joined
      io.to(roomId).emit('user-joined', {
        userId,
        userName,
        color: userPresence.color,
        activeUsers: Array.from(docState.activeUsers.values()),
      })

      console.log(`User ${userName} joined collaboration room ${roomId}`)
    })

    // Handle content changes
    socket.on('document-change', (data: ChangeEvent) => {
      const session = userSessions.get(socket.id)
      if (!session) return

      const { pageId, projectId } = session
      const roomId = `${projectId}:${pageId}`
      const docState = documentStates.get(roomId)

      if (!docState) return

      // Update document state
      docState.content = data.content
      docState.version++
      docState.lastModifiedBy = data.userId
      docState.lastModifiedAt = Date.now()

      // Broadcast change to all users in the room except sender
      socket.to(roomId).emit('document-change', {
        content: data.content,
        version: docState.version,
        userId: data.userId,
        operation: data.operation,
        timestamp: Date.now(),
      })

      console.log(`Document ${roomId} updated - version ${docState.version}`)
    })

    // Handle cursor/selection updates
    socket.on('cursor-update', (data: {
      pageId: string
      projectId: string
      userId: string
      position?: { line: number; column: number }
      selection?: { start: number; end: number }
    }) => {
      const { pageId, projectId, userId, position, selection } = data
      const roomId = `${projectId}:${pageId}`
      const docState = documentStates.get(roomId)

      if (!docState) return

      const userPresence = docState.activeUsers.get(socket.id)
      if (userPresence) {
        userPresence.cursorPosition = position
        userPresence.selection = selection
        userPresence.timestamp = Date.now()
      }

      // Broadcast cursor to others
      socket.to(roomId).emit('cursor-update', {
        userId,
        position,
        selection,
        color: userPresence?.color,
      })
    })

    // Handle typing status
    socket.on('typing-status', (data: {
      pageId: string
      projectId: string
      userId: string
      isTyping: boolean
    }) => {
      const { pageId, projectId, userId, isTyping } = data
      const roomId = `${projectId}:${pageId}`
      const docState = documentStates.get(roomId)

      if (!docState) return

      const userPresence = docState.activeUsers.get(socket.id)
      if (userPresence) {
        userPresence.isTyping = isTyping
        userPresence.timestamp = Date.now()
      }

      // Broadcast typing status
      socket.to(roomId).emit('typing-status', {
        userId,
        isTyping,
        userName: userPresence?.userName,
      })
    })

    // Handle save request
    socket.on('save-document', async (data: {
      pageId: string
      projectId: string
      userId: string
      content: string
    }) => {
      const { pageId, projectId, userId, content } = data
      const roomId = `${projectId}:${pageId}`

      // Here you would save to database
      console.log(`Saving document ${roomId}`)

      io.to(roomId).emit('document-saved', {
        version: documentStates.get(roomId)?.version || 0,
        savedBy: userId,
        timestamp: Date.now(),
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      const session = userSessions.get(socket.id)
      if (!session) return

      const { pageId, projectId } = session
      const roomId = `${projectId}:${pageId}`
      const docState = documentStates.get(roomId)

      if (docState) {
        const userPresence = docState.activeUsers.get(socket.id)
        docState.activeUsers.delete(socket.id)

        // Broadcast user left
        io.to(roomId).emit('user-left', {
          userId: userPresence?.userId,
          userName: userPresence?.userName,
          activeUsers: Array.from(docState.activeUsers.values()),
        })

        // Clean up empty documents
        if (docState.activeUsers.size === 0) {
          documentStates.delete(roomId)
        }
      }

      userSessions.delete(socket.id)
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

export default setupCollaborationServer
