'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
  onAddImage: () => void
  onAddLink: () => void
}

export function EditorToolbar({ editor, onAddImage, onAddLink }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 bg-card border-b border-border p-2">
      {/* Text Formatting */}
      <ToolbarButton
        icon={Bold}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      />
      <ToolbarButton
        icon={Italic}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      />
      <ToolbarButton
        icon={Strikethrough}
        label="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <ToolbarButton
        icon={Heading1}
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      />
      <ToolbarButton
        icon={Heading2}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      />
      <ToolbarButton
        icon={Heading3}
        label="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <ToolbarButton
        icon={List}
        label="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      />
      <ToolbarButton
        icon={ListOrdered}
        label="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Block Formatting */}
      <ToolbarButton
        icon={Quote}
        label="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      />
      <ToolbarButton
        icon={Code}
        label="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Media */}
      <ToolbarButton
        icon={ImageIcon}
        label="Image"
        onClick={onAddImage}
      />
      <ToolbarButton
        icon={LinkIcon}
        label="Link"
        onClick={onAddLink}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Utilities */}
      <Button
        size="sm"
        variant={editor.isActive('highlight') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="w-8 h-8"
      >
        ↶
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('highlight') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        className="w-8 h-8"
      >
        ↷
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => editor.chain().focus().clearNodes().run()}
        title="Clear formatting"
        className="text-xs"
      >
        Clear
      </Button>
    </div>
  )
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isActive?: boolean
}

function ToolbarButton({ icon: Icon, label, onClick, isActive = false }: ToolbarButtonProps) {
  return (
    <Button
      size="sm"
      variant={isActive ? 'default' : 'outline'}
      onClick={onClick}
      title={label}
      className="w-8 h-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
