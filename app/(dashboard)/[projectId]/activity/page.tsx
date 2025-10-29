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
  const resourceTypeLabel = {
    page: 'Page',
    card: 'Task',
    member: 'Member',
  }[activity.resource_type] || activity.resource_type

  return (
    <div className="flex gap-4 py-4 px-6 hover:bg-muted/30 border-b border-border last:border-0 transition-colors">
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted">
        <ActivityIcon resourceType={activity.resource_type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-medium text-sm">{activity.resource_name}</span>
          <ActivityAction action={activity.action} />
          <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5">{resourceTypeLabel}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
      <div className="border-b border-border bg-card p-6">
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentProject?.name || 'Project'} • Recent updates
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilterType(null)}
          className={cn(
            'text-xs px-3 py-1 rounded-full transition-colors',
            !filterType ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All
        </button>
        {['page', 'card', 'member'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'text-xs px-3 py-1 rounded-full transition-colors capitalize',
              filterType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading activities...
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full text-destructive">
            Error: {error}
          </div>
        )}

        {!loading && filteredActivities.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No activities found
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
