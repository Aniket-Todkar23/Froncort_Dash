import { useEffect, useState, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { setProjectPages, getProjectPages } from '@/lib/stores/pages-store'

export function useRealtimePages(projectId: string, pollInterval = 2000) {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const lastFetchRef = useRef<number>(0)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()

    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const newPages = data || []
        const currentPages = getProjectPages(projectId)

        // Check if there are any differences
        const hasChanged =
          newPages.length !== currentPages.length ||
          newPages.some(
            (p, i) => JSON.stringify(p) !== JSON.stringify(currentPages[i])
          )

        if (hasChanged) {
          console.log('Pages updated:', newPages)
          setPages(newPages)
          setProjectPages(projectId, newPages)
        }
      } catch (err) {
        console.error('Error fetching pages:', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchPages()
    lastFetchRef.current = Date.now()

    // Poll for changes
    const startPolling = () => {
      pollTimeoutRef.current = setTimeout(() => {
        fetchPages()
        startPolling()
      }, pollInterval)
    }

    startPolling()

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [projectId, pollInterval])

  return { pages, loading }
}
