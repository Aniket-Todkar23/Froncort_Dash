import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Activity = Database['public']['Tables']['activities']['Row'] & {
  users?: Database['public']['Tables']['users']['Row'] | null
}

export function useAllActivities(userId: string, limit = 10) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = getSupabaseClient()

        if (!userId) {
          setActivities([])
          setLoading(false)
          return
        }

        // Fetch activities with related user data in a single query
        // RLS will automatically filter to only projects the user has access to
        const { data, error: err } = await supabase
          .from('activities')
          .select(
            `
            id,
            project_id,
            user_id,
            action,
            resource_type,
            resource_id,
            resource_name,
            changes,
            created_at,
            users:user_id(id, name, avatar)
          `
          )
          .order('created_at', { ascending: false })
          .limit(limit)

        if (err) {
          console.error('Activities error:', err)
          throw new Error(`Failed to fetch activities: ${err.message}`)
        }

        if (!data) {
          setActivities([])
          return
        }

        setActivities(data as any)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch activities'
        console.error('Activity fetch error:', err)
        setError(errorMsg)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId, limit])

  return { activities, loading, error }
}
