import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  assigned_at: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export function useProjectMembers(projectId: string | null) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const fetchMembers = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        
        const response = await fetch(`/api/projects/${projectId}/members`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch members')
        }

        const data = await response.json()
        setMembers(data.members)
        
        // Get current user's role from members list
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const currentMember = data.members.find((m: ProjectMember) => m.user_id === user.id)
          setCurrentUserRole(currentMember?.role || null)
        }
        
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error fetching members'
        setError(message)
        console.error('Error fetching members:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [projectId])

  const addMember = async (userId: string, role: string = 'member') => {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add member')
      }

      const data = await response.json()
      setMembers([...members, data.member])
      toast.success('Member added successfully')
      return data.member
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding member'
      toast.error(message)
      throw err
    }
  }

  const removeMember = async (memberId: string) => {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      setMembers(members.filter((m) => m.id !== memberId))
      toast.success('Member removed successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error removing member'
      toast.error(message)
      throw err
    }
  }

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update member role')
      }

      const data = await response.json()
      setMembers(members.map((m) => (m.id === memberId ? data.member : m)))
      toast.success('Member role updated successfully')
      return data.member
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating member role'
      toast.error(message)
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    currentUserRole,
    addMember,
    removeMember,
    updateMemberRole,
  }
}
