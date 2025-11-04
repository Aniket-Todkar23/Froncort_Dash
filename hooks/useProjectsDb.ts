import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

export function useProjectsDb(userId: string) {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Fetch all projects (no RLS filtering)
        const { data, error: err } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })

        if (err) {
          throw err
        }
        setProjects(data || [])
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch projects'
        setError(errorMsg)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error }
}
