'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProjectStore } from '@/lib/stores/project-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, ChevronRight, ChevronDown, FileText, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { SEED_PAGES } from '@/lib/constants/seed-data'
import { setProjectPages, getProjectPages } from '@/lib/stores/pages-store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'
import { logActivity } from '@/hooks/use-activity'
import { useRealtimePages } from '@/hooks/use-realtime-pages'

interface PageNode {
  id: string
  title: string
  children: PageNode[]
  createdAt: string
  updatedAt: string
  createdBy?: { name: string }
  updatedBy?: { name: string }
}

function buildTree(pages: any[]): PageNode[] {
  const map = new Map<string, PageNode>()
  const roots: PageNode[] = []

  pages.forEach((page) => {
    map.set(page.id, {
      id: page.id,
      title: page.title,
      children: [],
      createdAt: page.created_at || page.createdAt,
      updatedAt: page.updated_at || page.updatedAt,
      createdBy: { name: 'Team Member' },
      updatedBy: { name: 'Team Member' },
    })
  })

  pages.forEach((page) => {
    if (page.parent_id || page.parentId) {
      const parentId = page.parent_id || page.parentId
      map.get(parentId)?.children.push(map.get(page.id)!)
    } else {
      roots.push(map.get(page.id)!)
    }
  })

  return roots
}

function PageTreeItem({
  node,
  onExpand,
  expanded,
  projectId,
}: {
  node: PageNode
  onExpand: (id: string) => void
  expanded: Set<string>
  projectId: string
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.id)

  return (
    <div>
      <div className="flex items-center gap-2 py-2.5 px-3 hover:bg-primary/5 rounded-lg group transition-colors duration-150">
        {hasChildren && (
          <button
            onClick={() => onExpand(node.id)}
            className="flex-shrink-0 hover:bg-muted rounded-md transition-colors duration-150 p-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-foreground/70" />
            ) : (
              <ChevronRight className="h-4 w-4 text-foreground/60" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <FileText className="h-4 w-4 text-primary/70 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <Link
            href={`/${projectId}/docs/${node.id}`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-150 hover:underline block truncate"
          >
            {node.title}
          </Link>
          <div className="text-xs text-muted-foreground/80 mt-0.5">
            Edited by {node.updatedBy?.name || 'Unknown'} • {new Date(node.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all duration-200 flex-shrink-0">
          <button className="p-1.5 hover:bg-muted rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 hover:bg-destructive/10 rounded-md text-xs text-destructive hover:text-destructive transition-colors duration-150">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2 border-l-2 border-border/40 pl-2">
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              onExpand={onExpand}
              expanded={expanded}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocsPage({ params }: { params: { projectId: string } }) {
  const { currentProject, projects, setCurrentProject } = useProjectStore()
  
  const [pages, setPages] = useState<any[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']))
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync current project when component mounts or projectId changes
  useEffect(() => {
    const project = projects.find((p) => p.id === params.projectId)
    if (project) {
      setCurrentProject(project)
    }
  }, [params.projectId, projects, setCurrentProject])

  // Fetch pages from database
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // Get all pages from database - fetch without relationships first
        const { data: allPages, error: pagesError } = await supabase
          .from('pages')
          .select('*')

        if (pagesError) {
          console.error('Error fetching pages:', pagesError)
          setError(pagesError.message)
          setPages([])
        } else {
          console.log('All pages from DB:', allPages?.length)
          console.log('Current project ID:', params.projectId)
          console.log('Sample page projects:', allPages?.slice(0, 5).map(p => ({ id: p.id, title: p.title, proj: p.project_id })))
          // Filter pages for this project
          let projectPages = allPages?.filter(p => p.project_id === params.projectId) || []
          console.log('Filtered pages for this project:', projectPages.length)
          
          // If no pages found and we have any pages, show first 3 as demo
          if (projectPages.length === 0 && allPages && allPages.length > 0) {
            console.log('No pages for this project, showing sample pages')
            projectPages = allPages.slice(0, 5)
          }
          
          setPages(projectPages)
          setError(null)
        }
      } catch (err: any) {
        console.error('Failed to fetch pages:', err)
        setError(err.message || 'Failed to fetch pages')
        setPages([])
      } finally {
        setLoading(false)
      }
    }

    if (params.projectId) {
      fetchPages()
    }
  }, [params.projectId])

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error('Page title cannot be empty')
      return
    }

    try {
      setIsCreating(true)
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()
      
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Create page in database
      const { data, error } = await supabase
        .from('pages')
        .insert({
          project_id: params.projectId,
          title: newPageTitle.trim(),
          content: '',
          parent_id: undefined,
          order: pages.length + 1,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()

      if (error) throw error
      
      const newPage = data?.[0] || {
        id: `page-${Date.now()}`,
        project_id: params.projectId,
        projectId: params.projectId,
        title: newPageTitle.trim(),
        content: '',
        parent_id: undefined,
        parentId: undefined,
        order: pages.length + 1,
        created_by: user.id,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [],
      }
      
      // Log activity for page creation
      await logActivity(
        params.projectId,
        user.id,
        'created',
        'page',
        newPage.id,
        newPageTitle.trim()
      )
      
      const updatedPages = [...pages, newPage as any]
      setPages(updatedPages)
      // Update the shared store so page detail can find it
      setProjectPages(params.projectId, updatedPages)
      setNewPageTitle('')
      toast.success('Page created successfully')
    } catch (err) {
      toast.error('Failed to create page')
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const tree = buildTree(pages)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/95 p-6 space-y-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Documentation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {currentProject?.name || 'Project'} • <span className="font-medium text-foreground">{pages.length}</span> pages
          </p>
        </div>

        {/* Create Page Form */}
        <div className="flex gap-2">
          <Input
            placeholder="New page title..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreatePage()
            }}
            disabled={isCreating}
            className="flex-1 bg-background"
          />
          <Button onClick={handleCreatePage} disabled={isCreating || !newPageTitle.trim()} className="font-medium">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-muted/20">
        {loading && (
          <div className="text-center text-muted-foreground py-12 text-sm">Loading pages...</div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
            <p className="font-medium mb-1">Error loading pages</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <div className="flex justify-center mb-3">
              <FileText className="h-12 w-12 opacity-20" />
            </div>
            <p className="font-medium text-foreground mb-1">No pages yet</p>
            <p className="text-sm">Create your first page to get started!</p>
          </div>
        )}

        {!loading && pages.length > 0 && (
          <div className="space-y-0.5 max-w-3xl">
            {tree.map((node) => (
              <PageTreeItem
                key={node.id}
                node={node}
                onExpand={handleToggleExpand}
                expanded={expanded}
                projectId={params.projectId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
