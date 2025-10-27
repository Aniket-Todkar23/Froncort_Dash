import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface RemoteUser {
  id: string
  name: string
  cursor: {
    line: number
    column: number
  }
  color: string
  lastUpdate: number
}

export interface CollaborationEvent {
  type: 'cursor' | 'content' | 'presence'
  userId: string
  userName: string
  data: any
  timestamp: number
}

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
]

export function useRealtimeCollaboration(pageId: string, userId: string, userName: string) {
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map())
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userColorRef = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)])

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channelName = `collaboration:${pageId}`

    // Subscribe to real-time updates
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
        },
      })
      .on('broadcast', { event: 'cursor' }, (payload) => {
        const { data } = payload
        setRemoteUsers((prev) => {
          const updated = new Map(prev)
          updated.set(data.userId, {
            id: data.userId,
            name: data.userName,
            cursor: data.cursor,
            color: data.color,
            lastUpdate: Date.now(),
          })
          return updated
        })
      })
      .on('broadcast', { event: 'content' }, (payload) => {
        const { data } = payload
        setEvents((prev) => [...prev, data])
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setRemoteUsers((prev) => {
          const updated = new Map(prev)
          Object.values(state).forEach((users: any) => {
            users.forEach((user: any) => {
              if (user.user_id !== userId) {
                updated.set(user.user_id, {
                  id: user.user_id,
                  name: user.user_name,
                  cursor: user.cursor || { line: 0, column: 0 },
                  color: user.color,
                  lastUpdate: Date.now(),
                })
              }
            })
          })
          return updated
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.user_id !== userId) {
            setRemoteUsers((prev) => {
              const updated = new Map(prev)
              updated.set(presence.user_id, {
                id: presence.user_id,
                name: presence.user_name,
                cursor: presence.cursor || { line: 0, column: 0 },
                color: presence.color,
                lastUpdate: Date.now(),
              })
              return updated
            })
          }
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          setRemoteUsers((prev) => {
            const updated = new Map(prev)
            updated.delete(presence.user_id)
            return updated
          })
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: userId,
            user_name: userName,
            cursor: { line: 0, column: 0 },
            color: userColorRef.current,
          })
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [pageId, userId, userName])

  const broadcastCursor = useCallback(
    (line: number, column: number) => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'cursor',
          payload: {
            userId,
            userName,
            cursor: { line, column },
            color: userColorRef.current,
          },
        })
      }
    },
    [userId, userName]
  )

  const broadcastContentChange = useCallback(
    (delta: any) => {
      if (channelRef.current) {
        const event: CollaborationEvent = {
          type: 'content',
          userId,
          userName,
          data: delta,
          timestamp: Date.now(),
        }
        channelRef.current.send({
          type: 'broadcast',
          event: 'content',
          payload: event,
        })
      }
    },
    [userId, userName]
  )

  return {
    remoteUsers: Array.from(remoteUsers.values()),
    events,
    broadcastCursor,
    broadcastContentChange,
    userColor: userColorRef.current,
  }
}
