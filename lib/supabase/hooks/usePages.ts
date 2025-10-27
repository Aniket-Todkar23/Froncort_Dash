import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../client'
import type { Database } from '../types'

type Page = Database['public']['Tables']['pages']['Row']

export function usePages(projectId: string) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('pages')
          .select('*')
          .eq('project_id', projectId)
          .order('order')

        if (err) throw err
        setPages(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pages')
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [projectId])

  return { pages, loading, error }
}

export async function createPage(projectId: string, title: string, parentId?: string) {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('pages')
    .insert({
      project_id: projectId,
      title,
      content: '',
      parent_id: parentId || null,
      created_by: user?.id || 'anonymous',
      updated_by: user?.id || 'anonymous',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePage(pageId: string, updates: Partial<Page>) {
  const supabase = getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('pages')
    .update({
      ...updates,
      updated_by: user?.id || 'anonymous',
    })
    .eq('id', pageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePage(pageId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('pages').delete().eq('id', pageId)

  if (error) throw error
}
