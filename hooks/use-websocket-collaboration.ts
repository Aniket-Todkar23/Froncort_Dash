import { useEffect, useState, useCallback, useRef } from 'react'

export interface RemoteUser {
  userId: string
  userName: string
  isTyping: boolean
}

export function useWebSocketCollaboration(pageId: string, userId: string, userName: string) {
  const [content, setContent] = useState('')
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map())
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Connect to WebSocket server via Next.js API route
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/collaboration`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Connected to collaboration server')
      setConnected(true)

      // Send JOIN message
      ws.send(
        JSON.stringify({
          type: 'JOIN',
          pageId,
          userId,
          userName,
        })
      )
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'CONTENT_UPDATED':
            // Update content from other user
            if (message.userId !== userId) {
              setContent(message.content)
            }
            break

          case 'USER_TYPING':
            // Show typing indicator
            setRemoteUsers((prev) => {
              const updated = new Map(prev)
              updated.set(message.userId, {
                userId: message.userId,
                userName: message.userName,
                isTyping: true,
              })
              return updated
            })
            break

          case 'USER_STOPPED_TYPING':
            setRemoteUsers((prev) => {
              const updated = new Map(prev)
              const user = updated.get(message.userId)
              if (user) {
                updated.set(message.userId, {
                  ...user,
                  isTyping: false,
                })
              }
              return updated
            })
            break

          case 'USER_JOINED':
            setRemoteUsers((prev) => {
              const updated = new Map(prev)
              updated.set(message.userId, {
                userId: message.userId,
                userName: message.userName,
                isTyping: false,
              })
              return updated
            })
            break

          case 'USER_LEFT':
            setRemoteUsers((prev) => {
              const updated = new Map(prev)
              updated.delete(message.userId)
              return updated
            })
            break
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
      setConnected(false)
    }

    ws.onclose = () => {
      console.log('Disconnected from collaboration server')
      setConnected(false)
    }

    wsRef.current = ws

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [pageId, userId, userName])

  const sendContentUpdate = useCallback(
    (newContent: string) => {
      setContent(newContent)

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'CONTENT_CHANGE',
            pageId,
            userId,
            userName,
            content: newContent,
          })
        )
      }
    },
    [pageId, userId, userName]
  )

  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'TYPING',
          pageId,
          userId,
          userName,
        })
      )

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'STOP_TYPING',
              userId,
            })
          )
        }
      }, 2000)
    }
  }, [pageId, userId, userName])

  return {
    content,
    remoteUsers: Array.from(remoteUsers.values()),
    connected,
    sendContentUpdate,
    sendTyping,
  }
}
