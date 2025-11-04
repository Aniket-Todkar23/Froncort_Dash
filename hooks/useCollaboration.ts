import { useEffect, useRef, useState, useCallback } from 'react'
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

interface UseCollaborationOptions {
  pageId: string
  projectId: string
  userId: string
  userName: string
  userEmail: string
  onContentChange?: (content: string) => void
  onRemoteUserUpdate?: (users: RemoteUser[]) => void
}

export function useCollaboration({
  pageId,
  projectId,
  userId,
  userName,
  userEmail,
  onContentChange,
  onRemoteUserUpdate,
}: UseCollaborationOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([])
  const [documentVersion, setDocumentVersion] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())
  
  // Store callback refs to avoid stale closures
  const onContentChangeRef = useRef(onContentChange)
  const onRemoteUserUpdateRef = useRef(onRemoteUserUpdate)
  
  // Update refs when callbacks change
  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])
  
  useEffect(() => {
    onRemoteUserUpdateRef.current = onRemoteUserUpdate
  }, [onRemoteUserUpdate])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!pageId || !projectId || !userId || !userName || !userEmail) return
    
    // Prevent multiple connections
    if (socketRef.current?.connected) return

    // Use Next.js API endpoint for socket (works on Vercel)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || `${typeof window !== 'undefined' ? window.location.origin : ''}`
    
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      forceNew: false,
    })

    socket.on('connect', () => {
      console.log('Connected to collaboration server')
      setIsConnected(true)

      // Join collaboration session
      socket.emit('join-collaboration', {
        pageId,
        projectId,
        userId,
        userName,
        userEmail,
      })
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Receive initial document state
    socket.on('document-state', (data: {
      content: string
      version: number
      activeUsers: RemoteUser[]
    }) => {
      console.log('[Collaboration] Received document state:', data.content.length)
      setDocumentVersion(data.version)
      setRemoteUsers(data.activeUsers)
      if (onContentChangeRef.current) {
        onContentChangeRef.current(data.content)
      }
      if (onRemoteUserUpdateRef.current) {
        onRemoteUserUpdateRef.current(data.activeUsers)
      }
    })

    // Handle remote document changes
    socket.on('document-change', (data: {
      content: string
      version: number
      userId: string
      timestamp: number
    }) => {
      console.log('[Collaboration] Remote content change received from userId:', data.userId, 'Current userId:', userId)
      setDocumentVersion(data.version)
      setLastSyncTime(data.timestamp)
      if (data.userId !== userId) {
        console.log('[Collaboration] Updating local content from remote user')
        if (onContentChangeRef.current) {
          onContentChangeRef.current(data.content)
        }
      }
    })

    // Handle user joined
    socket.on('user-joined', (data: {
      userId: string
      userName: string
      color: string
      activeUsers: RemoteUser[]
    }) => {
      console.log(`${data.userName} joined the collaboration`)
      setRemoteUsers(data.activeUsers)
      if (onRemoteUserUpdateRef.current) {
        onRemoteUserUpdateRef.current(data.activeUsers)
      }
    })

    // Handle user left
    socket.on('user-left', (data: {
      userId: string
      userName: string
      activeUsers: RemoteUser[]
    }) => {
      console.log(`${data.userName} left the collaboration`)
      setRemoteUsers(data.activeUsers)
      if (onRemoteUserUpdateRef.current) {
        onRemoteUserUpdateRef.current(data.activeUsers)
      }
    })

    // Handle cursor updates
    socket.on('cursor-update', (data: {
      userId: string
      position?: { line: number; column: number }
      selection?: { start: number; end: number }
      color: string
    }) => {
      setRemoteUsers((users) =>
        users.map((u) =>
          u.userId === data.userId
            ? {
                ...u,
                cursorPosition: data.position,
                selection: data.selection,
              }
            : u
        )
      )
    })

    // Handle typing status
    socket.on('typing-status', (data: {
      userId: string
      isTyping: boolean
      userName: string
    }) => {
      setRemoteUsers((users) =>
        users.map((u) =>
          u.userId === data.userId
            ? { ...u, isTyping: data.isTyping }
            : u
        )
      )
    })

    // Handle document saved
    socket.on('document-saved', (data: {
      version: number
      savedBy: string
      timestamp: number
    }) => {
      console.log('Document saved by', data.savedBy)
      setLastSyncTime(data.timestamp)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
      setIsConnected(false)
    })

    socketRef.current = socket

    return () => {
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [pageId, projectId, userId])

  // Send document change
  const sendDocumentChange = useCallback(
    (content: string, operation?: { type: 'insert' | 'delete'; position: number; text?: string }) => {
      if (socketRef.current?.connected) {
        console.log('[Collaboration] Sending document change:', { pageId, projectId, userId, contentLength: content.length })
        socketRef.current.emit('document-change', {
          pageId,
          projectId,
          userId,
          content,
          version: documentVersion,
          timestamp: Date.now(),
          operation,
        })
      } else {
        console.warn('[Collaboration] Socket not connected, cannot send change')
      }
    },
    [pageId, projectId, userId, documentVersion]
  )

  // Send cursor update
  const sendCursorUpdate = useCallback(
    (position?: { line: number; column: number }, selection?: { start: number; end: number }) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('cursor-update', {
          pageId,
          projectId,
          userId,
          position,
          selection,
        })
      }
    },
    [pageId, projectId, userId, isConnected]
  )

  // Send typing status
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('typing-status', {
          pageId,
          projectId,
          userId,
          isTyping,
        })
      }
    },
    [pageId, projectId, userId, isConnected]
  )

  // Save document
  const saveDocument = useCallback(
    (content: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('save-document', {
          pageId,
          projectId,
          userId,
          content,
        })
      }
    },
    [pageId, projectId, userId, isConnected]
  )

  return {
    isConnected,
    remoteUsers,
    documentVersion,
    lastSyncTime,
    sendDocumentChange,
    sendCursorUpdate,
    sendTypingStatus,
    saveDocument,
  }
}
