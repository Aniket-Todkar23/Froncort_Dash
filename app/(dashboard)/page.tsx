'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 50)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay])

  return <span>{displayedText}</span>
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardLoader } from '@/components/Loaders/CardLoader'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center justify-between gap-8"
      >
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight"
          >
            <span className="hidden lg:inline"><TypingText text={`Welcome back, ${currentUser?.name}!`} delay={100} /></span>
            <span className="inline lg:hidden">Welcome back, {currentUser?.name}!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mt-2"
          >
            <span className="hidden lg:inline"><TypingText text="Here's what's happening across your projects" delay={400} /></span>
            <span className="inline lg:hidden">Here&apos;s what&apos;s happening across your projects</span>
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:block w-48 h-48 flex-shrink-0"
        >
          <DotLottieReact
            src="https://lottie.host/27a23116-1247-4412-a42d-64084e348a91/yCB9MadK61.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Card className="overflow-hidden shadow-md shadow-primary/10"><CardLoader /></Card>
            <Card className="overflow-hidden shadow-md shadow-primary/10"><CardLoader /></Card>
            <Card className="overflow-hidden shadow-md shadow-primary/10"><CardLoader /></Card>
          </>
        ) : (
          <>
            <Card className="shadow-md shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbProjects?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active projects</p>
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Across all boards</p>
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Collaborating</p>
              </CardContent>
            </Card>
          </>
        )}
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
          <Card className="shadow-md shadow-primary/10">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading projects...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="shadow-md shadow-primary/10">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        ) : !dbProjects || dbProjects.length === 0 ? (
          <Card className="shadow-md shadow-primary/10">
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
                <Card className="h-full shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer">
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
        <Card className="shadow-md shadow-primary/10">
          <CardContent className="pt-6">
            {activitiesLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No recent activity yet</p>
                {activitiesError && <p className="text-xs text-destructive mt-2">{activitiesError}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const userName = activity.users?.name || 'User'
                  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const timeAgo = getTimeAgo(new Date(activity.created_at))
                  const bgColorClass = getColorClass(activity.action)
                  const resourceTypeLabel = {
                    page: 'Page',
                    card: 'Task',
                    member: 'Member',
                  }[activity.resource_type] || activity.resource_type

                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${bgColorClass}`}>
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-medium truncate">{activity.resource_name}</p>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize font-medium">{activity.action}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{userName}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{resourceTypeLabel}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{timeAgo}</span>
                        </div>
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
