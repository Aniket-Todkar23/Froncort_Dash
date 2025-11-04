import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import type { Database } from '@/lib/supabase/types'

type KanbanBoard = Database['public']['Tables']['kanban_boards']['Row']
type KanbanColumn = Database['public']['Tables']['kanban_columns']['Row']
type KanbanCard = Database['public']['Tables']['kanban_cards']['Row']

export function useKanbanBoard(projectId: string) {
  const [board, setBoard] = useState<KanbanBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('kanban_boards')
          .select('*')
          .eq('project_id', projectId)
          .single()

        if (err) {
          if (err.code === 'PGRST116') {
            // No board found, create default
            const { data: newBoard, error: createErr } = await supabase
              .from('kanban_boards')
              .insert({
                project_id: projectId,
                name: 'Planning Board',
              })
              .select()
              .single()

            if (createErr) throw createErr
            setBoard(newBoard)
          } else {
            throw err
          }
        } else {
          setBoard(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch board')
      } finally {
        setLoading(false)
      }
    }

    fetchBoard()
  }, [projectId])

  return { board, loading, error }
}

export function useKanbanColumns(boardId: string) {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('kanban_columns')
          .select('*')
          .eq('board_id', boardId)
          .order('order')

        if (err) throw err
        
        if (!data || data.length === 0) {
          // Create default columns
          const defaultColumns = [
            { board_id: boardId, name: 'To Do', order: 0 },
            { board_id: boardId, name: 'In Progress', order: 1 },
            { board_id: boardId, name: 'Done', order: 2 },
          ]

          const { data: created, error: createErr } = await supabase
            .from('kanban_columns')
            .insert(defaultColumns)
            .select()
            .order('order')

          if (createErr) throw createErr
          setColumns(created || [])
        } else {
          setColumns(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch columns')
      } finally {
        setLoading(false)
      }
    }

    fetchColumns()
  }, [boardId])

  return { columns, loading, error }
}

export function useKanbanCards(columnId: string) {
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        const { data, error: err } = await supabase
          .from('kanban_cards')
          .select('*')
          .eq('column_id', columnId)
          .order('order')

        if (err) throw err
        setCards(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cards')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [columnId])

  return { cards, loading, error }
}

export async function createCard(
  boardId: string,
  columnId: string,
  title: string,
  description: string = ''
) {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('kanban_cards')
    .insert({
      board_id: boardId,
      column_id: columnId,
      title,
      description,
      created_by: user.id,
      order: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCard(cardId: string, updates: Partial<KanbanCard>) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('kanban_cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function moveCard(
  cardId: string,
  newColumnId: string,
  newOrder: number
) {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('kanban_cards')
    .update({
      column_id: newColumnId,
      order: newOrder,
    })
    .eq('id', cardId)

  if (error) throw error
}

export async function deleteCard(cardId: string) {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('kanban_cards').delete().eq('id', cardId)

  if (error) throw error
}
