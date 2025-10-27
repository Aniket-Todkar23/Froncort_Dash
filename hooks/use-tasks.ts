import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Card = Database['public']['Tables']['kanban_cards']['Row']
type CardInsert = Database['public']['Tables']['kanban_cards']['Insert']

export function useTasks(boardId: string | null) {
  const [tasks, setTasks] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks
  const fetchTasks = async () => {
    if (!boardId) return
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data, error: err } = await supabase
        .from('kanban_cards')
        .select('*')
        .eq('board_id', boardId)
        .order('order', { ascending: true })

      if (err) throw err
      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [boardId])

  // Create task
  const createTask = async (
    columnId: string,
    title: string,
    description: string = '',
    userId: string
  ) => {
    try {
      const supabase = getSupabaseClient()
      const newCard: CardInsert = {
        column_id: columnId,
        board_id: boardId!,
        title,
        description,
        created_by: userId,
        order: tasks.length,
      }

      const { data, error: err } = await supabase
        .from('kanban_cards')
        .insert(newCard)
        .select()

      if (err) throw err
      if (data?.[0]) {
        setTasks((prev) => [...prev, data[0]])
      }
      return data?.[0]
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create task'
      setError(msg)
      throw err
    }
  }

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Card>) => {
    try {
      const supabase = getSupabaseClient()
      const { error: err } = await supabase
        .from('kanban_cards')
        .update(updates)
        .eq('id', taskId)

      if (err) throw err
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update task'
      setError(msg)
      throw err
    }
  }

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error: err } = await supabase
        .from('kanban_cards')
        .delete()
        .eq('id', taskId)

      if (err) throw err
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task'
      setError(msg)
      throw err
    }
  }

  // Move task between columns
  const moveTask = async (taskId: string, newColumnId: string, order: number) => {
    try {
      const supabase = getSupabaseClient()
      const { error: err } = await supabase
        .from('kanban_cards')
        .update({ column_id: newColumnId, order })
        .eq('id', taskId)

      if (err) throw err
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, column_id: newColumnId, order } : t
        )
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to move task'
      setError(msg)
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchTasks,
  }
}
