import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../client'
import type { Database } from '../types'

type Project = Database['public']['Tables']['projects']['Row']

export function useProjects(userId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })

        if (err) throw err
        setProjects(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [userId])

  return { projects, loading, error }
}

export async function createProject(userId: string, name: string, description: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: userId,
      name,
      description,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(projectId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) throw error
}
