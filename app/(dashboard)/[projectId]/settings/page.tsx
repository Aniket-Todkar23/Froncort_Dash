'use client'

import React, { useState } from 'react'
import { useProjectStore } from '@/lib/stores/project-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Users, Lock, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function SettingsPage({ params }: { params: { projectId: string } }) {
  const { currentProject, projects } = useProjectStore()
  const project = projects.find((p) => p.id === params.projectId)
  
  const [projectName, setProjectName] = useState(project?.name || '')
  const [projectDescription, setProjectDescription] = useState(project?.description || '')
  const [isSaving, setIsSaving] = useState(false)

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
      <div className="border-b border-border bg-card p-6">
        <h1 className="text-3xl font-bold">Project Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your project configuration</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General
              </CardTitle>
              <CardDescription>Basic project information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  className="w-full min-h-24 p-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage project members and permissions</CardDescription>
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
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          {userRole === 'owner' ? 'Owner' : 'Remove'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members yet</p>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control project visibility and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                  <input type="radio" name="visibility" value="private" defaultChecked />
                  <div>
                    <p className="font-medium text-sm">Private</p>
                    <p className="text-xs text-muted-foreground">Only team members can access</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                  <input type="radio" name="visibility" value="public" />
                  <div>
                    <p className="font-medium text-sm">Public</p>
                    <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" disabled>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Once you delete a project, there is no going back. Please be certain.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
