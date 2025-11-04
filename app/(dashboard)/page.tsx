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
  const { setProjects, setCurrentProject } = useProjectStore()
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

  const handleProjectClick = (project: any) => {
    setCurrentProject(project)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center justify-between gap-8 bg-gradient-to-r from-primary/5 via-background to-background rounded-2xl p-8 border border-border/40 shadow-sm"
      >
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
          >
            <span className="hidden lg:inline"><TypingText text={`Welcome back, ${currentUser?.name}!`} delay={100} /></span>
            <span className="inline lg:hidden">Welcome back, {currentUser?.name}!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground/80 mt-3 font-medium"
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
            <Card className="overflow-hidden border-border/50"><CardLoader /></Card>
            <Card className="overflow-hidden border-border/50"><CardLoader /></Card>
            <Card className="overflow-hidden border-border/50"><CardLoader /></Card>
          </>
        ) : (
          <>
            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Projects</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 ring-1 ring-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{dbProjects?.length || 0}</div>
                <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Active projects</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-green-500/40 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Tasks</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 group-hover:from-green-500/30 group-hover:to-green-500/20 transition-all duration-300 ring-1 ring-green-500/20">
                  <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">12</div>
                <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Across all boards</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Team Members</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-all duration-300 ring-1 ring-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{dbProjects?.reduce((acc, p) => acc + (Array.isArray(p.members) ? p.members.length : 0), 0) || 0}</div>
                <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Across all projects</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Your Projects</h2>
          <Button onClick={handleCreateProject} size="lg" className="font-semibold">
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {loading ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground/80 font-medium">Loading projects...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
            <CardContent className="pt-8 text-center">
              <p className="text-destructive font-medium">Error: {error}</p>
            </CardContent>
          </Card>
        ) : !dbProjects || dbProjects.length === 0 ? (
          <Card className="border-border/50 shadow-sm text-center py-12">
            <CardContent>
              <p className="text-muted-foreground/80 mb-4 font-medium">No projects yet. Create one to get started.</p>
              <Button onClick={handleCreateProject} variant="outline" size="lg" className="font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dbProjects.map((project: any) => (
              <Link key={project?.id || project} href={`/${project?.id || project}`} onClick={() => handleProjectClick(project)}>
                <Card className="h-full border-border/50 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors duration-200">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground/80">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground/70">
                      <span>👥 {Array.isArray(project.members) ? project.members.length : 1} members</span>
                      <span>📄 3 pages</span>
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
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Recent Activity</h2>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            {activitiesLoading ? (
              <div className="text-center text-muted-foreground/80 py-12 font-medium">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="font-medium text-foreground mb-1">No recent activity yet</p>
                <p className="text-sm">Activity will appear here as you make changes</p>
                {activitiesError && <p className="text-xs text-destructive mt-3">{activitiesError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const userName = activity.users?.name || 'User'
                  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const timeAgo = getTimeAgo(new Date(activity.created_at))
                  const bgColorClass = getColorClass(activity.action)
                  const resourceTypeLabels: Record<string, string> = {
                    page: 'Page',
                    card: 'Task',
                    member: 'Member',
                  }
                  const resourceTypeLabel = resourceTypeLabels[activity.resource_type as string] || activity.resource_type

                  return (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0 group hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors duration-150">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${bgColorClass} shadow-sm`}>
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-150">{activity.resource_name}</p>
                          <span className="text-xs px-2.5 py-1 bg-muted/60 rounded-md capitalize font-semibold text-muted-foreground">{activity.action}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground/70 font-medium">
                          <span>{userName}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{resourceTypeLabel}</span>
                          <span className="text-muted-foreground/30">•</span>
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
