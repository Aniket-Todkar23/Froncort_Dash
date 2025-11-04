'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { CollaborativeEditor } from '@/components/editor/collaborative-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SEED_PAGES } from '@/lib/constants/seed-data'
import { getPageById, setProjectPages, getProjectPages } from '@/lib/stores/pages-store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import { logActivity } from '@/hooks/use-activity'
import { useSocketCollaboration } from '@/hooks/use-socket-collaboration'
import { CollaboratorPresence } from '@/components/editor/CollaboratorPresence'

export default function EditorPage({
  params,
}: {
  params: { projectId: string; pageId: string }
}) {
  const router = useRouter()
  const storedPage = getPageById(params.pageId) || SEED_PAGES.find((p) => p.id === params.pageId)
  const [page, setPage] = useState(storedPage || null)
  const [loading, setLoading] = useState(!storedPage)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(page?.title || '')
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [pageContent, setPageContent] = useState(page?.content || '')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Fetch page from database if not in store
  useEffect(() => {
    if (storedPage) {
      setPage(storedPage)
      setTitle(storedPage.title)
      setPageContent(storedPage.content)
      setLoading(false)
      return
    }

    // Try to fetch from database
    const fetchPage = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error: fetchError } = await supabase
          .from('pages')
          .select('*')
          .eq('id', params.pageId)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Page doesn't exist in database
            setLoading(false)
            notFound()
            return
          } else {
            setError(fetchError.message)
          }
          setLoading(false)
          return
        }

        if (data) {
          setPage(data)
          setTitle(data.title)
          setPageContent(data.content)
          // Update store so we have it for next time
          const allPages = getProjectPages(params.projectId)
          if (!allPages.find((p) => p.id === data.id)) {
            setProjectPages(params.projectId, [...allPages, data])
          }
        } else {
          // No data returned
          setLoading(false)
          notFound()
          return
        }
      } catch (err) {
        console.error('Error fetching page:', err)
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [params.pageId, params.projectId, storedPage])

  // Fetch current user for collaboration
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (err) {
        console.error('Failed to fetch current user:', err)
      }
    }
    fetchUser()
  }, [])

  // Initialize Socket.io collaboration (only if user is ready)
  const { content: remoteContent, remoteUsers, connected: isConnected, sendContentUpdate } = useSocketCollaboration(
    params.pageId,
    params.projectId,
    currentUser?.id || '',
    currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Anonymous',
    currentUser?.email || ''
  )

  // Sync remote content changes to local state
  useEffect(() => {
    if (remoteContent && remoteContent !== pageContent) {
      console.log('[Editor] Syncing remote content, length:', remoteContent.length)
      setPageContent(remoteContent)
    }
  }, [remoteContent, pageContent])

  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const hasContentChangesRef = React.useRef(false)

  const handleSaveTitle = async () => {
    if (!title.trim()) {
      toast.error('Title cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      const supabase = getSupabaseClient()
      
      // Check if this is a new page (local only)
      const isNewPage = params.pageId.startsWith('page-')
      
      if (isNewPage) {
        // Update local store only
        const allPages = getProjectPages(params.projectId)
        const updatedPages = allPages.map((p) =>
          p.id === params.pageId ? { ...p, title, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
        )
        setProjectPages(params.projectId, updatedPages)
      } else {
        // Update database
        const user = await getCurrentUser()
        const { error } = await supabase
          .from('pages')
          .update({
            title,
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.pageId)

        if (error) throw error
        
        // Log activity
        if (user && title !== page.title) {
          await logActivity(
            params.projectId,
            user.id,
            'edited',
            'page',
            params.pageId,
            title
          )
        }
        
        // Update local store
        const allPages = getProjectPages(params.projectId)
        const updatedPages = allPages.map((p) =>
          p.id === params.pageId ? { ...p, title, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
        )
        setProjectPages(params.projectId, updatedPages)
      }
      
      setLastSaved(new Date())
      toast.success('Title saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save title'
      toast.error(msg)
      setEditorError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (content: string) => {
    setPageContent(content)
    hasContentChangesRef.current = true
    
    // Send content change via Socket.io if connected
    if (isConnected && currentUser?.id) {
      sendContentUpdate(content)
    }
  }

  const handleSaveContent = useCallback(async () => {
    try {
      setIsSaving(true)
      const supabase = getSupabaseClient()
      
      console.log('Saving content for page:', params.pageId, 'Content length:', pageContent.length)
      
      // Check if this is a new page (local only)
      const isNewPage = params.pageId.startsWith('page-')
      
      if (isNewPage) {
        // Update local store only for new pages
        console.warn('New page detected. Saving to local store only:', params.pageId)
        const allPages = getProjectPages(params.projectId)
        const updatedPages = allPages.map((p) =>
          p.id === params.pageId ? { ...p, content: pageContent, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
        )
        setProjectPages(params.projectId, updatedPages)
        setLastSaved(new Date())
        hasContentChangesRef.current = false
        setEditorError(null)
        return
      }
      
      // For existing pages, update database
      const user = await getCurrentUser()
      const { data, error } = await supabase
        .from('pages')
        .update({
          content: pageContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.pageId)
        .select()

      console.log('Save response:', { data, error })
      
      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      // Log activity
      if (user && pageContent !== (page?.content || '')) {
        await logActivity(
          params.projectId,
          user.id,
          'edited',
          'page',
          params.pageId,
          page?.title || 'Page'
        )
      }
      
      // Update local store
      const allPages = getProjectPages(params.projectId)
      const updatedPages = allPages.map((p) =>
        p.id === params.pageId ? { ...p, content: pageContent, updated_at: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
      )
      setProjectPages(params.projectId, updatedPages)
      
      setLastSaved(new Date())
      hasContentChangesRef.current = false
      setEditorError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      setEditorError(msg)
      console.error('Save error details:', err)
    } finally {
      setIsSaving(false)
    }
  }, [params.pageId, params.projectId, pageContent, page])

  // Auto-save content when it changes
  useEffect(() => {
    if (!page || pageContent === (page?.content || '')) return
    
    hasContentChangesRef.current = true

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Debounce auto-save by 3 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasContentChangesRef.current) {
        handleSaveContent()
      }
    }, 3000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [pageContent, page, handleSaveContent])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading page...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error: {error}</div>
      </div>
    )
  }

  if (!page) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4 space-y-4">
          {/* Back Button and Title */}
          <div className="flex items-center gap-3">
            <Link href={`/${params.projectId}/docs`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* Title Editor */}
          {isTitleEditing ? (
            <div className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                onBlur={() => {
                  if (title !== page.title) {
                    handleSaveTitle()
                  } else {
                    setIsTitleEditing(false)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle()
                  } else if (e.key === 'Escape') {
                    setIsTitleEditing(false)
                    setTitle(page.title)
                  }
                }}
                className="text-2xl font-bold"
              />
            </div>
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => setIsTitleEditing(true)}
            >
              {title}
            </h1>
          )}

          {/* Collaboration Indicator */}
          {remoteUsers.length > 0 && (
            <div className="mb-4">
              <CollaboratorPresence remoteUsers={remoteUsers} currentUserId={currentUser?.id || ''} />
            </div>
          )}
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Created: {new Date(page.created_at || page.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(page.updated_at || page.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {isSaving && <span>Saving...</span>}
              {!isSaving && lastSaved && (
                <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <CollaborativeEditor
            content={pageContent}
            onChange={handleContentChange}
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={editorError}
            className="min-h-96"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
