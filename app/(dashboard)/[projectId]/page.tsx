'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/lib/stores/project-store'
import { useProjectMembers } from '@/hooks/useProjectMembers'
import { TeamMembersPanel } from '@/components/project/TeamMembersPanel'
import { Plus, Users, FileText, Zap } from 'lucide-react'

export default function ProjectOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = (params?.projectId as string) || ''
  const { projects, setCurrentProject } = useProjectStore()
  const project = projects.find((p) => p.id === projectId)
  const [showMembersPanel, setShowMembersPanel] = useState(false)
  const { members, currentUserRole } = useProjectMembers(projectId)

  // Sync current project when component mounts or projectId changes
  React.useEffect(() => {
    if (project) {
      setCurrentProject(project)
    }
  }, [projectId, project, setCurrentProject])

  // Get member count from the API
  const memberCount = members.length
  
  // Mock page and task counts (these would come from database in production)
  const pageCount = 3
  const taskCount = 4

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground mt-2">{project.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 group cursor-pointer" onClick={() => router.push(`/${projectId}/board`)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Team Members</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-200">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground mt-1">team members</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-purple-500/40 transition-all duration-300 group cursor-pointer" onClick={() => router.push(`/${projectId}/docs`)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Pages</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-200">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pageCount}</div>
            <p className="text-xs text-muted-foreground mt-1">documentation pages</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-orange-500/40 transition-all duration-300 group cursor-pointer" onClick={() => router.push(`/${projectId}/board`)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">Tasks</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-all duration-200">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">kanban cards</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-green-500/40 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-200">
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Overview and team information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Members */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Team Members ({memberCount})</h3>
            <div className="space-y-2">
              {memberCount > 0 ? (
                members?.map((member) => {
                  const userName = (member.user as any)?.name || 'Unknown'
                  const userEmail = (member.user as any)?.email || ''
                  const userRole = member.role || 'editor'
                  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium uppercase">{initials}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{userName}</p>
                          <p className="text-xs text-muted-foreground">{userEmail}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">{userRole}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMembersPanel(!showMembersPanel)}
                className="border-border/50 hover:border-blue-500/60 hover:text-primary hover:bg-blue-500/5 transition-all duration-200 group"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Member
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/${projectId}/docs`)}
                className="border-border/50 hover:border-purple-500/60 hover:text-primary hover:bg-purple-500/5 transition-all duration-200 group"
              >
                <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                View Pages
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/${projectId}/board`)}
                className="border-border/50 hover:border-orange-500/60 hover:text-primary hover:bg-orange-500/5 transition-all duration-200 group"
              >
                <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                View Tasks
              </Button>
            </div>
          </div>

          {/* Members Panel */}
          {showMembersPanel && (
            <div className="pt-4 border-t">
              <TeamMembersPanel projectId={projectId} currentUserRole={currentUserRole || 'member'} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
