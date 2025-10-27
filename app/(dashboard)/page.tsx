'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/lib/stores/user-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { Plus, FileText, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { useProjectsDb } from '@/hooks/useProjectsDb'
import { useAllActivities } from '@/hooks/use-all-activities'
import { SEED_PROJECTS } from '@/lib/constants/seed-data'

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser } = useUserStore()
  const { setProjects } = useProjectStore()
  const { projects: dbProjects, loading, error } = useProjectsDb(currentUser?.id || '')
  const { activities, loading: activitiesLoading, error: activitiesError } = useAllActivities(currentUser?.id || '', 10)

  // Sync projects to project store
  React.useEffect(() => {
    if (dbProjects && dbProjects.length > 0) {
      setProjects(dbProjects)
    }
  }, [dbProjects, setProjects])

  const handleCreateProject = () => {
    router.push('/create-project')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser?.name}!</h1>
        <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening across your projects</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbProjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all boards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Collaborating</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <Button onClick={handleCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading projects...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        ) : !dbProjects || dbProjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No projects yet. Create one to get started.</p>
              <Button onClick={handleCreateProject} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbProjects.map((project: any) => (
              <Link key={project?.id || project} href={`/${project?.id || project}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{Array.isArray(project.members) ? project.members.length : 1} members</span>
                      <span>3 pages</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {activitiesLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No recent activity yet</p>
                {activitiesError && <p className="text-xs text-destructive mt-2">{activitiesError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const userName = activity.users?.name || 'User'
                  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const actionText = getActionText(activity.action, activity.resource_type, activity.resource_name)
                  const timeAgo = getTimeAgo(new Date(activity.created_at))
                  const bgColorClass = getColorClass(activity.action)

                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${bgColorClass}`}>
                        {userInitials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{actionText}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getActionText(action: string, resourceType: string, resourceName: string): string {
  const resourceLabel = resourceType === 'card' ? 'task' : resourceType
  const actionMap: Record<string, string> = {
    created: 'created',
    edited: 'edited',
    deleted: 'deleted',
    moved: 'moved',
    assigned: 'assigned',
    mentioned: 'mentioned',
    joined: 'joined',
  }
  const actionText = actionMap[action] || action
  return `${actionText} &apos;${resourceName}&apos; ${resourceLabel}`
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

function getColorClass(action: string): string {
  const colorMap: Record<string, string> = {
    created: 'bg-green-500',
    edited: 'bg-blue-500',
    deleted: 'bg-red-500',
    moved: 'bg-purple-500',
    assigned: 'bg-orange-500',
    mentioned: 'bg-pink-500',
    joined: 'bg-teal-500',
  }
  return colorMap[action] || 'bg-gray-500'
}
