'use client'

import React from 'react'
import { RemoteUser } from '@/hooks/useCollaboration'

interface CollaboratorPresenceProps {
  remoteUsers: RemoteUser[]
  currentUserId: string
}

export function CollaboratorPresence({
  remoteUsers,
  currentUserId,
}: CollaboratorPresenceProps) {
  const typingUsers = remoteUsers.filter((u) => u.isTyping && u.userId !== currentUserId)

  return (
    <div className="space-y-3">
      {/* Active Collaborators */}
      {remoteUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Collaborators:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {remoteUsers.map((user) => (
              <div key={user.userId} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: user.color }}
                  title={user.userName}
                />
                <span className="text-xs text-muted-foreground">{user.userName.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="text-xs text-muted-foreground animate-pulse">
          {typingUsers.map((user) => (
            <div key={user.userId} className="flex items-center gap-1">
              <span style={{ color: user.color }} className="font-medium">
                {user.userName}
              </span>
              <span>is typing</span>
              <span className="inline-flex gap-0.5">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                  •
                </span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                  •
                </span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                  •
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RemoteCursor({
  user,
  lineHeight,
}: {
  user: RemoteUser
  lineHeight?: number
}) {
  if (!user.cursorPosition) return null

  const defaultLineHeight = lineHeight || 20

  return (
    <div
      className="absolute w-0.5 pointer-events-none animate-pulse"
      style={{
        left: `${(user.cursorPosition.column || 0) * 8}px`,
        top: `${(user.cursorPosition.line || 0) * defaultLineHeight}px`,
        height: `${defaultLineHeight}px`,
        backgroundColor: user.color,
      }}
    >
      <div
        className="absolute top-0 -left-8 px-1 py-0.5 text-xs font-medium text-white rounded whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.userName.split(' ')[0]}
      </div>
    </div>
  )
}
