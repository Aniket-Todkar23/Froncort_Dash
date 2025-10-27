import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface UseEditorProps {
  pageId: string
  initialContent: string
  onSave?: (content: string) => void
  autoSaveInterval?: number
}

export function useEditor({
  pageId,
  initialContent,
  onSave,
  autoSaveInterval = 3000,
}: UseEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasChangesRef = useRef(false)

  // Auto-save with debounce
  useEffect(() => {
    hasChangesRef.current = true

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveContent()
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content])

  const saveContent = useCallback(async () => {
    if (!hasChangesRef.current) return

    setIsSaving(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Update page content
      const { error: updateError } = await supabase
        .from('pages')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId)

      if (updateError) throw updateError

      // Create version snapshot
      const { error: versionError } = await supabase
        .from('page_versions')
        .insert({
          page_id: pageId,
          content,
          created_by: 'current-user-id', // TODO: Get from auth
          changes_summary: 'Auto-saved changes',
        })

      if (versionError) throw versionError

      setLastSaved(new Date())
      hasChangesRef.current = false

      if (onSave) {
        onSave(content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      console.error('Auto-save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [content, pageId, onSave])

  const manualSave = useCallback(async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    return saveContent()
  }, [saveContent])

  return {
    content,
    setContent,
    isSaving,
    lastSaved,
    error,
    saveContent: manualSave,
  }
}
