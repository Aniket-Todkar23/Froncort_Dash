'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export interface RemoteUser {
  userId: string
  userName: string
  userEmail: string
  color: string
  isTyping: boolean
  cursorPosition?: { line: number; column: number }
  selection?: { start: number; end: number }
}

export function useSocketCollaboration(
  pageId: string,
  projectId: string,
  userId: string,
  userName: string,
  userEmail: string
) {
  const [content, setContent] = useState('')
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Don't connect if userId is empty
    if (!userId || !pageId || !projectId) {
      console.log('Waiting for user data before connecting to socket')
      return
    }

    // Connect to socket.io server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080'
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('Connected to collaboration server')
      setConnected(true)

      // Join collaboration room
      socket.emit('join-collaboration', {
        pageId,
        projectId,
        userId,
        userName,
        userEmail,
      })
    })

    socket.on('document-state', (data) => {
      console.log('Received document state:', data)
      setContent(data.content)
      setRemoteUsers(data.activeUsers || [])
    })

    socket.on('document-change', (data) => {
      console.log('Received document change:', data)
      // Always update content from server
      setContent(data.content)
    })

    socket.on('user-joined', (data) => {
      console.log('User joined:', data)
      setRemoteUsers(data.activeUsers || [])
    })

    socket.on('user-left', (data) => {
      console.log('User left:', data)
      setRemoteUsers(data.activeUsers || [])
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
      setConnected(false)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    socketRef.current = socket

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [pageId, projectId, userId, userName, userEmail])

  const sendContentUpdate = useCallback(
    (newContent: string) => {
      setContent(newContent)

      if (socketRef.current?.connected) {
        socketRef.current.emit('document-change', {
          pageId,
          projectId,
          userId,
          content: newContent,
          version: 0,
        })
      }
    },
    [pageId, projectId, userId]
  )

  return {
    content,
    setContent,
    remoteUsers,
    connected,
    sendContentUpdate,
  }
}
