'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useProjectStore } from '@/lib/stores/project-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, ChevronRight, ChevronDown, FileText, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { SEED_PAGES } from '@/lib/constants/seed-data'
import { setProjectPages, getProjectPages } from '@/lib/stores/pages-store'

interface PageNode {
  id: string
  title: string
  children: PageNode[]
  createdAt: string
  updatedAt: string
}

function buildTree(pages: any[]): PageNode[] {
  const map = new Map<string, PageNode>()
  const roots: PageNode[] = []

  pages.forEach((page) => {
    map.set(page.id, {
      id: page.id,
      title: page.title,
      children: [],
      createdAt: page.created_at,
      updatedAt: page.updated_at,
    })
  })

  pages.forEach((page) => {
    if (page.parent_id) {
      map.get(page.parent_id)?.children.push(map.get(page.id)!)
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

        <Link
          href={`/${projectId}/docs/${node.id}`}
          className="flex-1 text-sm hover:text-primary transition-colors truncate"
        >
          {node.title}
        </Link>

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
  const [pages, setPages] = useState(() => {
    let storedPages = getProjectPages(params.projectId)
    if (storedPages.length === 0) {
      storedPages = SEED_PAGES.filter((p) => p.projectId === params.projectId)
      setProjectPages(params.projectId, storedPages)
    }
    return storedPages
  })
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']))
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const loading = false
  const error = null

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
      // Mock page creation
      const newPage = {
        id: `page-${Date.now()}`,
        projectId: params.projectId,
        title: newPageTitle.trim(),
        content: '',
        parentId: undefined,
        order: pages.length + 1,
        createdBy: 'user',
        createdAt: new Date(),
        updatedBy: 'user',
        updatedAt: new Date(),
        versions: [],
      }
      const updatedPages = [...pages, newPage as any]
      setPages(updatedPages)
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
