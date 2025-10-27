'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/lib/stores/project-store'
import { Plus, Users, FileText, Zap } from 'lucide-react'

export default function ProjectOverviewPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || ''
  const { projects } = useProjectStore()
  const project = projects.find((p) => p.id === projectId)

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(project.members) ? project.members.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Active</div>
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
            <h3 className="text-sm font-semibold mb-3">Team Members</h3>
            <div className="space-y-2">
              {Array.isArray(project.members) && project.members.length > 0 ? (
                project.members.map((member, idx) => {
                const memberId = typeof member === 'string' ? member : member.id || idx
                const userName = typeof member === 'string' ? member : member.user?.name || 'Unknown'
                const userRole = typeof member === 'string' ? 'Member' : member.role || 'Member'
                const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2)
                return (
                  <div key={String(memberId)} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium uppercase">{initials}</span>
                      </div>
                      <span className="text-sm">{userName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                  </div>
                )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New Page
              </Button>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
