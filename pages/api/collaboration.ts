import { WebSocketServer } from 'ws'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'
import type { Socket } from 'net'

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean
  pageId?: string
  userId?: string
  userName?: string
}

const pageClients = new Map<string, ExtendedWebSocket[]>()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as any
  if (!socket || !socket.server) {
    res.status(500).json({ error: 'Socket not available' })
    return
  }

  if (socket.server.ws) {
    console.log('WebSocket server already running')
    res.status(200).json({ message: 'WebSocket server already running' })
    return
  }

  console.log('Starting WebSocket server')

  const server = socket.server as HTTPServer & { ws?: WebSocketServer }
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/collaboration') {
      wss.handleUpgrade(request, socket as Socket, head, (ws: ExtendedWebSocket) => {
        wss.emit('connection', ws, request)
      })
    }
  })

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection')

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())

        switch (message.type) {
          case 'JOIN':
            ws.pageId = message.pageId
            ws.userId = message.userId
            ws.userName = message.userName

            if (!pageClients.has(ws.pageId)) {
              pageClients.set(ws.pageId, [])
            }
            pageClients.get(ws.pageId)!.push(ws)

            broadcastToPage(ws.pageId, {
              type: 'USER_JOINED',
              userId: ws.userId,
              userName: ws.userName,
            })

            console.log(`User ${ws.userName} joined page ${ws.pageId}`)
            break

          case 'CONTENT_CHANGE':
            broadcastToPage(ws.pageId!, {
              type: 'CONTENT_UPDATED',
              userId: ws.userId,
              userName: ws.userName,
              content: message.content,
              timestamp: Date.now(),
            })

            console.log(`Content update from ${ws.userName} on page ${ws.pageId}`)
            break

          case 'TYPING':
            broadcastToPage(ws.pageId!, {
              type: 'USER_TYPING',
              userId: ws.userId,
              userName: ws.userName,
              position: message.position,
            })
            break

          case 'STOP_TYPING':
            broadcastToPage(ws.pageId!, {
              type: 'USER_STOPPED_TYPING',
              userId: ws.userId,
            })
            break
        }
      } catch (err) {
        console.error('Error handling message:', err)
      }
    })

    ws.on('close', () => {
      if (ws.pageId && ws.userId) {
        const clients = pageClients.get(ws.pageId)
        if (clients) {
          const index = clients.indexOf(ws)
          if (index > -1) {
            clients.splice(index, 1)

            broadcastToPage(ws.pageId, {
              type: 'USER_LEFT',
              userId: ws.userId,
              userName: ws.userName,
            })

            if (clients.length === 0) {
              pageClients.delete(ws.pageId)
            }
          }
        }
        console.log(`User left page ${ws.pageId}`)
      }
    })

    ws.on('error', (err) => {
      console.error('WebSocket error:', err)
    })
  })

  server.ws = wss

  res.status(200).json({ message: 'WebSocket server started' })
}

function broadcastToPage(pageId: string, message: any, excludeWs?: ExtendedWebSocket) {
  const clients = pageClients.get(pageId)
  if (!clients) return

  const data = JSON.stringify(message)
  clients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(data, (err) => {
        if (err) {
          console.error('Error sending message:', err)
        }
      })
    }
  })
}
