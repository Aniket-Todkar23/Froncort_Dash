import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Activity = Database['public']['Tables']['activities']['Row']

export function useActivity(projectId: string, limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('activities')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (err) throw err
        setActivities(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [projectId, limit])

  return { activities, loading, error }
}

export async function logActivity(
  projectId: string,
  userId: string,
  action: 'created' | 'edited' | 'deleted' | 'moved' | 'assigned' | 'mentioned' | 'joined',
  resourceType: 'page' | 'card' | 'member' | 'project',
  resourceId: string,
  resourceName: string,
  changes?: Record<string, any>
) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('activities').insert({
    project_id: projectId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    resource_name: resourceName,
    changes: changes || null,
  })

  if (error) throw error
}
