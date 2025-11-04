'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/lib/stores/project-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Users, Lock, Trash2, Save, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function SettingsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter()
  const { currentProject, projects, setCurrentProject } = useProjectStore()
  const project = projects.find((p) => p.id === params.projectId)
  
  const [projectName, setProjectName] = useState(project?.name || '')
  const [projectDescription, setProjectDescription] = useState(project?.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveSettings = async () => {
    if (!projectName.trim()) {
      toast.error('Project name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectName,
          description: projectDescription,
        })
        .eq('id', params.projectId)

      if (error) throw error
      toast.success('Project settings saved')
    } catch (err) {
      console.error('Error saving settings:', err)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true)
      const supabase = getSupabaseClient()

      // Delete all kanban boards and related data for this project
      const { data: boards } = await supabase
        .from('kanban_boards')
        .select('id')
        .eq('project_id', params.projectId)

      if (boards && boards.length > 0) {
        const boardIds = boards.map((b) => b.id)
        // Delete columns
        await supabase
          .from('kanban_columns')
          .delete()
          .in('board_id', boardIds)
        // Delete cards
        await supabase
          .from('kanban_cards')
          .delete()
          .in('board_id', boardIds)
      }

      // Delete all pages
      await supabase
        .from('pages')
        .delete()
        .eq('project_id', params.projectId)

      // Delete all activities
      await supabase
        .from('activities')
        .delete()
        .eq('project_id', params.projectId)

      // Delete the project itself
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', params.projectId)

      if (deleteError) throw deleteError

      // Clear from store
      setCurrentProject(null)
      toast.success('Project deleted successfully')
      
      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      console.error('Error deleting project:', err)
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/95 p-6 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Project Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your project configuration</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                General
              </CardTitle>
              <CardDescription className="text-xs">Basic project information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="bg-background/50 border-border/60 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  className="w-full min-h-24 p-3 border border-border/60 rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full font-semibold">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription className="text-xs">Manage project members and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.members && project.members.length > 0 ? (
                <div className="space-y-2">
                  {project.members.map((member, i) => {
                    const userName = typeof member === 'string' ? member : member.user?.name || 'Unknown'
                    const userRole = typeof member === 'string' ? 'Member' : member.role || 'Member'
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/60 rounded-lg border border-border/40 transition-colors duration-150"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{userName}</p>
                          <p className="text-xs text-muted-foreground/80 capitalize font-medium">{userRole}</p>
                        </div>
                        <Button variant="outline" size="sm" disabled className="text-xs">
                          {userRole === 'owner' ? 'Owner' : 'Remove'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground/80 font-medium">No team members yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add members to collaborate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-xs">Control project visibility and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-border/60 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors duration-150">
                  <input type="radio" name="visibility" value="private" defaultChecked />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Private</p>
                    <p className="text-xs text-muted-foreground/80">Only team members can access</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border/60 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors duration-150">
                  <input type="radio" name="visibility" value="public" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Public</p>
                    <p className="text-xs text-muted-foreground/80">Anyone with the link can view</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-xs">Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full font-semibold" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
              <p className="text-xs text-muted-foreground/80 mt-3">
                Once you delete a project, there is no going back. Please be certain.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md border-destructive/40 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Project?
              </CardTitle>
              <CardDescription className="text-xs">This action cannot be undone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-sm text-foreground font-medium">You are about to permanently delete:</p>
                <p className="text-sm font-semibold text-destructive mt-2">"{project.name}"</p>
                <p className="text-xs text-muted-foreground/80 mt-3">
                  This will delete all associated pages, kanban boards, cards, and activities. This action is permanent and cannot be reversed.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 font-semibold"
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
