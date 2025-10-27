import React from 'react'
import { RemoteUser } from '@/hooks/use-realtime-collaboration'

interface RemoteCursorsProps {
  remoteUsers: RemoteUser[]
}

export function RemoteCursors({ remoteUsers }: RemoteCursorsProps) {
  return (
    <>
      {remoteUsers.map((user) => (
        <div key={user.id} className="relative">
          {/* Cursor Line */}
          <div
            className="absolute w-0.5 h-5 pointer-events-none animate-pulse"
            style={{
              backgroundColor: user.color,
              top: `${user.cursor.line * 24}px`,
              left: `${user.cursor.column * 8}px`,
              zIndex: 10,
            }}
          />
          {/* User Label */}
          <div
            className="absolute px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap pointer-events-none"
            style={{
              backgroundColor: user.color,
              top: `${user.cursor.line * 24 - 24}px`,
              left: `${user.cursor.column * 8}px`,
              zIndex: 11,
            }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </>
  )
}

// Component to show who is editing
export function EditingIndicator({ remoteUsers }: RemoteCursorsProps) {
  if (remoteUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted rounded-md">
      <span className="font-medium">Editing with:</span>
      <div className="flex items-center gap-1">
        {remoteUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 px-2 py-1 rounded"
            style={{ backgroundColor: `${user.color}20`, borderLeft: `3px solid ${user.color}` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
