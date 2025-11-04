'use client'

import React, { useState, useEffect } from 'react'
import { useProjectStore } from '@/lib/stores/project-store'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/date'
import { Filter, FileText, CheckSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getSupabaseClient } from '@/lib/supabase/client'

function ActivityIcon({ resourceType }: { resourceType: string }) {
  switch (resourceType) {
    case 'page':
      return <FileText className="h-4 w-4 text-blue-500" />
    case 'card':
      return <CheckSquare className="h-4 w-4 text-green-500" />
    case 'member':
      return <Users className="h-4 w-4 text-purple-500" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

function ActivityAction({ action }: { action: string }) {
  const actionLabels: Record<string, string> = {
    created: 'Created',
    edited: 'Edited',
    deleted: 'Deleted',
    moved: 'Moved',
    assigned: 'Assigned to',
    mentioned: 'Mentioned',
    joined: 'Joined',
  }

  const actionColors: Record<string, string> = {
    created: 'bg-blue-500/10 text-blue-700',
    edited: 'bg-amber-500/10 text-amber-700',
    deleted: 'bg-red-500/10 text-red-700',
    moved: 'bg-purple-500/10 text-purple-700',
    assigned: 'bg-green-500/10 text-green-700',
    mentioned: 'bg-pink-500/10 text-pink-700',
    joined: 'bg-indigo-500/10 text-indigo-700',
  }

  return (
    <Badge variant="outline" className={cn('text-xs', actionColors[action] || 'bg-muted')}>
      {actionLabels[action] || action}
    </Badge>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const resourceTypeLabels: Record<string, string> = {
    page: 'Page',
    card: 'Task',
    member: 'Member',
  }
  const resourceTypeLabel = resourceTypeLabels[activity.resource_type as string] || activity.resource_type

  return (
    <div className="flex gap-4 py-4 px-6 hover:bg-primary/5 border-b border-border/40 last:border-0 transition-all duration-150 group">
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-150">
        <ActivityIcon resourceType={activity.resource_type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-150">{activity.resource_name}</span>
          <ActivityAction action={activity.action} />
          <span className="text-xs font-medium text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">{resourceTypeLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span>{formatRelativeTime(new Date(activity.created_at))}</span>
        </div>
      </div>
    </div>
  )
}

// Mock activity data
const MOCK_ACTIVITIES = [
  {
    id: '1',
    projectId: 'proj-1',
    resource_type: 'page',
    resource_name: 'Getting Started Guide',
    action: 'edited',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    changes: { content: 'Updated content' },
  },
  {
    id: '2',
    projectId: 'proj-1',
    resource_type: 'card',
    resource_name: 'Bug Fix',
    action: 'moved',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    changes: { column: 'Done' },
  },
  {
    id: '3',
    projectId: 'proj-1',
    resource_type: 'member',
    resource_name: 'John Doe',
    action: 'joined',
    created_at: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    changes: { role: 'editor' },
  },
]

export default function ActivityPage({ params }: { params: { projectId: string } }) {
  const { currentProject } = useProjectStore()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data, error: err } = await supabase
          .from('activities')
          .select('*')
          .eq('project_id', params.projectId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (err) {
          console.error('Error fetching activities:', err)
          setActivities(MOCK_ACTIVITIES)
          setError(null)
        } else if (data) {
          setActivities(data)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err)
        setActivities(MOCK_ACTIVITIES)
        setError('Failed to load activities')
      } finally {
        setLoading(false)
      }
    }

    if (params.projectId) {
      fetchActivities()
    }
  }, [params.projectId])

  const filteredActivities = filterType
    ? activities.filter((a) => a.resource_type === filterType)
    : activities

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/95 p-6 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentProject?.name || 'Project'} • <span className="font-medium text-foreground">Recent updates</span>
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-border/50 bg-card/50 px-6 py-4 flex items-center gap-3 backdrop-blur-sm">
        <Filter className="h-4 w-4 text-primary/70" />
        <button
          onClick={() => setFilterType(null)}
          className={cn(
            'text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200',
            !filterType ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
          )}
        >
          All
        </button>
        {['page', 'card', 'member'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 capitalize',
              filterType === type
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
        {loading && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <div className="text-center">
              <div className="animate-pulse mb-3">Loading activities...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-destructive text-center max-w-sm">
              <p className="font-medium mb-1">Error loading activities</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && filteredActivities.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-foreground mb-1">No activities found</p>
              <p className="text-sm">Activities will appear here as you make changes</p>
            </div>
          </div>
        )}

        {!loading && filteredActivities.length > 0 && (
          <div>
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
