import React from 'react'

interface TypingIndicatorProps {
  remoteUsers: Array<{
    userId: string
    userName: string
    isTyping: boolean
  }>
}

export function TypingIndicator({ remoteUsers }: TypingIndicatorProps) {
  const typingUsers = remoteUsers.filter((u) => u.isTyping)

  if (typingUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs bg-muted rounded-md">
      <div className="flex gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-bounce"></span>
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-bounce delay-100"></span>
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-bounce delay-200"></span>
      </div>
      <span className="text-muted-foreground">
        {typingUsers.map((u) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  )
}
