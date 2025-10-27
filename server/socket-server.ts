import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { createClient } from '@supabase/supabase-js'

interface DocumentSession {
  pageId: string
  projectId: string
  content: string
  version: number
  users: Map<string, UserInfo>
}

interface UserInfo {
  userId: string
  userName: string
  color: string
  isTyping: boolean
}

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
let colorIndex = 0

// Initialize Supabase client for database persistence
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Debounce saves to avoid too many database writes
const saveDebounceTimers = new Map<string, NodeJS.Timeout>()

async function persistDocumentToDatabase(pageId: string, content: string) {
  if (!supabase) {
    console.warn('[Socket] Supabase not configured, skipping database persistence')
    return
  }

  try {
    const { error } = await supabase
      .from('pages')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)

    if (error) {
      console.error(`[Socket] Failed to persist page ${pageId}:`, error)
    } else {
      console.log(`[Socket] Page ${pageId} persisted to database`)
    }
  } catch (err) {
    console.error(`[Socket] Error persisting page ${pageId}:`, err)
  }
}

export function createSocketServer(port: number = 8080) {
  const httpServer = createServer()
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  const documents = new Map<string, DocumentSession>()
  const userSessions = new Map<string, { pageId: string; projectId: string; userId: string; userName: string }>()

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`)

    socket.on('join-collaboration', (data: any) => {
      const { pageId, projectId, userId, userName } = data
      const roomId = `${projectId}:${pageId}`

      console.log(`[Socket] User join request - userId: ${userId}, userName: ${userName}`)
      userSessions.set(socket.id, { pageId, projectId, userId, userName })
      socket.join(roomId)

      let doc = documents.get(roomId)
      if (!doc) {
        doc = {
          pageId,
          projectId,
          content: '',
          version: 0,
          users: new Map(),
        }
        documents.set(roomId, doc)
      }

      const userColor = colors[colorIndex % colors.length]
      colorIndex++

      doc.users.set(socket.id, {
        userId,
        userName,
        color: userColor,
        isTyping: false,
      })

      socket.emit('document-state', {
        content: doc.content,
        version: doc.version,
        activeUsers: Array.from(doc.users.values()),
      })

      socket.to(roomId).emit('user-joined', {
        userId,
        userName,
        color: userColor,
        activeUsers: Array.from(doc.users.values()),
      })

      console.log(`[Socket] ${userName} joined room ${roomId}`)
    })

    socket.on('document-change', (data: any) => {
      const session = userSessions.get(socket.id)
      if (!session) return

      const roomId = `${session.projectId}:${session.pageId}`
      const doc = documents.get(roomId)
      if (!doc) return

      doc.content = data.content
      doc.version++

      const timestamp = Date.now()
      socket.to(roomId).emit('document-change', {
        content: data.content,
        version: doc.version,
        userId: data.userId,
        timestamp,
      })

      console.log(`[Socket] Document updated in ${roomId}, version ${doc.version}, content length: ${data.content.length}`)

      // Debounce database save (3 seconds after last change)
      const pageId = session.pageId
      if (saveDebounceTimers.has(pageId)) {
        clearTimeout(saveDebounceTimers.get(pageId)!)
      }

      const timer = setTimeout(() => {
        persistDocumentToDatabase(pageId, data.content)
        saveDebounceTimers.delete(pageId)
      }, 3000)

      saveDebounceTimers.set(pageId, timer)
    })

    socket.on('typing-status', (data: any) => {
      const session = userSessions.get(socket.id)
      if (!session) return

      const roomId = `${session.projectId}:${session.pageId}`
      const doc = documents.get(roomId)
      if (!doc) return

      const userInfo = doc.users.get(socket.id)
      if (userInfo) {
        userInfo.isTyping = data.isTyping
      }

      socket.to(roomId).emit('typing-status', {
        userId: data.userId,
        isTyping: data.isTyping,
        userName: session.userName,
      })
    })

    socket.on('disconnect', () => {
      const session = userSessions.get(socket.id)
      if (session) {
        const roomId = `${session.projectId}:${session.pageId}`
        const doc = documents.get(roomId)

        if (doc) {
          const userInfo = doc.users.get(socket.id)
          doc.users.delete(socket.id)

          io.to(roomId).emit('user-left', {
            userId: session.userId,
            userName: session.userName,
            activeUsers: Array.from(doc.users.values()),
          })

          // Save to database when last user disconnects
          if (doc.users.size === 0) {
            console.log(`[Socket] Last user left ${roomId}, saving to database...`)
            persistDocumentToDatabase(session.pageId, doc.content)
            documents.delete(roomId)
          }
        }
      }

      userSessions.delete(socket.id)
      console.log(`[Socket] User disconnected: ${socket.id}`)
    })
  })

  httpServer.listen(port, () => {
    console.log(`[Socket Server] Running on port ${port}`)
  })

  return { io, httpServer }
}

export default createSocketServer
