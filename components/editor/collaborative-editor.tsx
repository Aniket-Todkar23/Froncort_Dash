'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { EditorToolbar } from './editor-toolbar'
import { cn } from '@/lib/utils/cn'
import { Check, AlertCircle, Loader } from 'lucide-react'

interface CollaborativeEditorProps {
  content: string
  onChange: (content: string) => void
  isSaving?: boolean
  lastSaved?: Date | null
  error?: string | null
  readOnly?: boolean
  className?: string
}

export function CollaborativeEditor({
  content,
  onChange,
  isSaving = false,
  lastSaved = null,
  error = null,
  readOnly = false,
  className,
}: CollaborativeEditorProps) {
  const [lastContent, setLastContent] = useState(content)
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
      }),
    ],
    content,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor when content changes from remote users
  useEffect(() => {
    if (!editor || content === lastContent) return
    
    console.log('[Editor] Syncing remote content change')
    setLastContent(content)
    
    // Check if editor has focus
    const hasFocus = editor.isFocused
    if (!hasFocus) {
      // Only update if not focused to avoid interrupting user input
      editor.commands.setContent(content, false)
    }
  }, [content, editor, lastContent])

  const handleAddImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Enter link URL:')
    if (url && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()
    }
  }, [editor])

  return (
    <div className={cn('flex flex-col border border-border rounded-lg overflow-hidden', className)}>
      {!readOnly && (
        <EditorToolbar
          editor={editor}
          onAddImage={handleAddImage}
          onAddLink={handleAddLink}
        />
      )}

      <div className="px-4 py-2 bg-muted border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {isSaving && !error && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {!isSaving && lastSaved && !error && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span>Saved {formatTime(lastSaved)}</span>
            </div>
          )}
        </div>
        <span className="text-muted-foreground">{readOnly ? 'Read-only' : 'Editing'}</span>
      </div>

      <div className="flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none w-full p-4',
            'prose-headings:font-bold prose-headings:text-foreground',
            'prose-p:text-foreground prose-p:leading-7',
            readOnly && 'bg-muted/30 cursor-not-allowed'
          )}
        />
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`

  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
