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
      <div className="flex items-center gap-2 py-2 px-3 hover:bg-muted rounded-md group">
        {hasChildren && (
          <button
            onClick={() => onExpand(node.id)}
            className="flex-shrink-0 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        <div className="flex-1">
          <Link
            href={`/${projectId}/docs/${node.id}`}
            className="text-sm hover:text-primary transition-colors hover:underline"
          >
            {node.title}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            Last edited by {node.updatedBy?.name || 'Unknown'} • {new Date(node.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <button className="p-1 hover:bg-background rounded text-xs text-muted-foreground">
            <Edit2 className="h-3 w-3" />
          </button>
          <button className="p-1 hover:bg-destructive/10 rounded text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-border">
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
  const { currentProject } = useProjectStore()
  
  const [pages, setPages] = useState<any[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']))
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="border-b border-border p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {currentProject?.name || 'Project'} • {pages.length} pages
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
            className="flex-1"
          />
          <Button onClick={handleCreatePage} disabled={isCreating || !newPageTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="text-center text-muted-foreground py-8">Loading pages...</div>
        )}

        {error && (
          <div className="text-center text-destructive py-8">Error: {error}</div>
        )}

        {!loading && pages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto opacity-30 mb-2" />
            <p>No pages yet. Create your first page to get started!</p>
          </div>
        )}

        {!loading && pages.length > 0 && (
          <div className="space-y-1">
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
