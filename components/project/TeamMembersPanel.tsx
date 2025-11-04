'use client'

import React, { useState } from 'react'
import { useProjectMembers } from '@/hooks/useProjectMembers'
import { X, Plus, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface TeamMembersPanelProps {
  projectId: string | null
  currentUserRole?: string
}

export function TeamMembersPanel({ projectId, currentUserRole = 'member' }: TeamMembersPanelProps) {
  const { members, loading, error, addMember, removeMember, updateMemberRole } =
    useProjectMembers(projectId)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('editor')
  const [isAdding, setIsAdding] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const canManageMembers = ['owner', 'admin'].includes(currentUserRole || '')

  const handleFetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users || [])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter a valid email')
      return
    }

    const user = allUsers.find((u) => u.email === newMemberEmail)
    if (!user) {
      toast.error('User not found')
      return
    }

    setIsAdding(true)
    try {
      await addMember(user.id, selectedRole)
      setNewMemberEmail('')
      setSelectedRole('member')
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding member:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(memberId)
      } catch (err) {
        console.error('Error removing member:', err)
      }
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole)
    } catch (err) {
      console.error('Error updating role:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">Loading team members...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        {canManageMembers && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              if (!showAddForm) handleFetchUsers()
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="p-4 border border-border rounded-lg bg-muted/50">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Select User
              </label>
              {loadingUsers ? (
                <div className="text-xs text-muted-foreground">Loading users...</div>
              ) : (
                <select
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
                >
                  <option value="">Choose a user...</option>
                  {allUsers
                    .filter(
                      (u) =>
                        !members.some((m) => m.user_id === u.id)
                    )
                    .map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded bg-background"
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="editor">Editor (Edit)</option>
                <option value="admin">Admin (Manage)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                disabled={isAdding || !newMemberEmail}
                className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add Member'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members yet</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{member.user?.name}</p>
                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {canManageMembers && member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="px-2 py-1 text-xs border border-border rounded bg-background"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                    <Shield className="h-3 w-3" />
                    {member.role}
                  </span>
                )}

                {canManageMembers && member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive hover:text-destructive"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
