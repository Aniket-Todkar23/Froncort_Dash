import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { getSupabaseClient } from '@/lib/supabase/client'

export function useYjsCollaboration(pageId: string) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [ytext, setYtext] = useState<Y.Text | null>(null)
  const [awareness, setAwareness] = useState<any>(null)

  useEffect(() => {
    // Create a new Y.doc
    const doc = new Y.Doc()
    const text = doc.getText('shared-text')
    
    setYdoc(doc)
    setYtext(text)

    // Sync with Supabase
    const supabase = getSupabaseClient()
    let syncInProgress = false

    // Load initial state from DB
    const loadInitialState = async () => {
      try {
        const { data } = await supabase
          .from('pages')
          .select('content')
          .eq('id', pageId)
          .single()

        if (data?.content) {
          // Apply remote content to Y.Text
          text.insert(0, data.content)
        }
      } catch (err) {
        console.error('Error loading initial state:', err)
      }
    }

    loadInitialState()

    // Save changes to Supabase
    const handleUpdate = async () => {
      if (syncInProgress) return
      
      syncInProgress = true
      try {
        const content = text.toString()
        await supabase
          .from('pages')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pageId)
      } catch (err) {
        console.error('Error syncing content:', err)
      } finally {
        syncInProgress = false
      }
    }

    // Debounce save by 2 seconds
    let saveTimeout: NodeJS.Timeout
    text.observe((event) => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(handleUpdate, 2000)
    })

    return () => {
      clearTimeout(saveTimeout)
      doc.destroy()
    }
  }, [pageId])

  return { ydoc, ytext }
}

// Hook for use with TipTap
export function useYjsTipTap(pageId: string) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [ytext, setYtext] = useState<Y.Text | null>(null)

  useEffect(() => {
    const doc = new Y.Doc()
    const text = doc.getText('shared-text')

    setYdoc(doc)
    setYtext(text)

    // Load from DB
    const supabase = getSupabaseClient()
    const loadContent = async () => {
      try {
        const { data } = await supabase
          .from('pages')
          .select('content')
          .eq('id', pageId)
          .single()

        if (data?.content) {
          text.insert(0, data.content)
        }
      } catch (err) {
        console.error('Failed to load content:', err)
      }
    }

    loadContent()

    // Save on changes
    let saveTimeout: NodeJS.Timeout
    const observer = () => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(async () => {
        try {
          const content = text.toString()
          await supabase
            .from('pages')
            .update({
              content,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pageId)
        } catch (err) {
          console.error('Error saving:', err)
        }
      }, 2000)
    }

    text.observe(observer)

    return () => {
      text.unobserve(observer)
      clearTimeout(saveTimeout)
      doc.destroy()
    }
  }, [pageId])

  return { ydoc, ytext }
}
