import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

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

export function usePageDetail(pageId: string) {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .single()

        if (err) throw err
        setPage(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch page')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [pageId])

  return { page, loading, error }
}

export async function createPage(
  projectId: string,
  title: string,
  parentId?: string
) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('pages')
    .insert({
      project_id: projectId,
      title,
      content: '',
      parent_id: parentId || null,
      created_by: 'current-user',
      updated_by: 'current-user',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePage(pageId: string, updates: Partial<Page>) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('pages')
    .update(updates)
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
