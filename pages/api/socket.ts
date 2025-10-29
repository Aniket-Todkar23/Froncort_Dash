import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import { Server as SocketIOServer } from 'socket.io'

interface SocketServer extends HTTPServer {
  io?: SocketIOServer
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

const documentStates = new Map()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) return res.status(404).end()

  const socket = res.socket as SocketWithIO
  if (!socket.server.io) {
    const io = new SocketIOServer(socket.server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    })

    socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-collaboration', (data) => {
        const { pageId, projectId, userId, userName, userEmail } = data
        const roomId = `${projectId}:${pageId}`

        socket.join(roomId)

        if (!documentStates.has(roomId)) {
          documentStates.set(roomId, {
            pageId,
            projectId,
            content: '',
            version: 0,
            activeUsers: new Map(),
          })
        }

        const docState = documentStates.get(roomId)
        docState.activeUsers.set(socket.id, {
          userId,
          userName,
          userEmail,
          color: getRandomColor(),
        })

        socket.emit('document-state', {
          content: docState.content,
          version: docState.version,
          activeUsers: Array.from(docState.activeUsers.values()),
        })

        io.to(roomId).emit('user-joined', {
          userId,
          userName,
          activeUsers: Array.from(docState.activeUsers.values()),
        })

        console.log(`User ${userName} joined room ${roomId}`)
      })

      socket.on('document-change', (data) => {
        const { pageId, projectId, userId, content, version } = data
        const roomId = `${projectId}:${pageId}`
        const docState = documentStates.get(roomId)

        if (!docState) return

        docState.content = content
        docState.version = version + 1
        docState.lastModifiedBy = userId
        docState.lastModifiedAt = Date.now()

        socket.to(roomId).emit('document-change', {
          content,
          version: docState.version,
          userId,
          timestamp: Date.now(),
        })

        console.log(`Document ${roomId} updated - version ${docState.version}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)

        documentStates.forEach((docState, roomId) => {
          if (docState.activeUsers.has(socket.id)) {
            const user = docState.activeUsers.get(socket.id)
            docState.activeUsers.delete(socket.id)

            io.to(roomId).emit('user-left', {
              userId: user.userId,
              userName: user.userName,
              activeUsers: Array.from(docState.activeUsers.values()),
            })

            if (docState.activeUsers.size === 0) {
              documentStates.delete(roomId)
            }
          }
        })
      })
    })
  }

  res.end()
}

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
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
