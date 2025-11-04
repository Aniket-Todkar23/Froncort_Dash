'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { FolderOpen, Plus, ChevronDown, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { projects, currentProject, setCurrentProject, setProjects, addProject } = useProjectStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // Fetch projects from database on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        
        // Get all projects from database
        const { data: allProjects, error } = await supabase
          .from('projects')
          .select('id, name, description, owner_id, avatar, created_at, updated_at')
          .order('created_at', { ascending: false })

        if (error) {
          // Handle error silently
        } else if (allProjects && allProjects.length > 0) {
          setProjects(allProjects as any)
        } else {
          setProjects([])
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [setProjects])

  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0])
    }
  }, [projects, currentProject, setCurrentProject])

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      setIsCreatingProject(true)
      const supabase = getSupabaseClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        return
      }

      // Create project in database
      const { data: newProj, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: '',
          owner_id: user.id,
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${newProjectName}`,
        })
        .select()
        .single()

      if (error) {
        return
      }

      // Create default kanban board for the project
      const { data: board } = await supabase
        .from('kanban_boards')
        .insert({
          project_id: newProj.id,
          name: 'Planning Board',
        })
        .select()
        .single()

      // Create default columns
      if (board) {
        const columns = [
          { board_id: board.id, name: 'To Do', order: 0, color: '#EF4444' },
          { board_id: board.id, name: 'In Progress', order: 1, color: '#F59E0B' },
          { board_id: board.id, name: 'Done', order: 2, color: '#10B981' },
        ]
        await supabase.from('kanban_columns').insert(columns)
      }

      // Add to local store
      addProject(newProj as any)
      setNewProjectName('')
      setExpandedProjects([...expandedProjects, newProj.id])
      setCurrentProject(newProj as any)
    } catch {
      // Handle error silently
    } finally {
      setIsCreatingProject(false)
    }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="fixed md:relative w-64 border-r border-border bg-card flex flex-col h-screen z-40 md:z-0">
      {/* Logo & Close */}
      <div className="p-6 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
            <Image src="/penrose_image.png" alt="Froncort Logo" width={32} height={32} style={{ width: 'auto', height: 'auto' }} className="rounded-lg" />
            <span className="font-bold text-lg">Froncort<span className="text-primary"> Forge</span></span>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={() => {
            router.push('/')
            handleLinkClick()
          }}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</h3>
          </div>
          {!isCreatingProject && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-8"
              onClick={() => setIsCreatingProject(true)}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {isCreatingProject && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                  if (e.key === 'Escape') {
                    setIsCreatingProject(false)
                    setNewProjectName('')
                  }
                }}
                autoFocus
                className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-7 text-xs"
                  onClick={() => {
                    setIsCreatingProject(false)
                    setNewProjectName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">No projects yet</p>
          </div>
        )}

        <nav className="space-y-1">
          {projects.map((project) => {
            const isActive = currentProject?.id === project.id
            const isExpanded = expandedProjects.includes(project.id)

            return (
              <div key={project.id}>
                <button
                  onClick={() => {
                    setCurrentProject(project)
                    toggleProject(project.id)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-between',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-muted/50 hover:shadow-sm'
                  )}
                >
                  <span className="truncate">{project.name}</span>
                  <ChevronDown
                    className={cn('h-4 w-4 flex-shrink-0 transition-transform', isExpanded && 'rotate-180')}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-muted pl-3">
                    <Link
                      href={`/${project.id}`}
                      onClick={handleLinkClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm transition-colors',
                        pathname === `/${project.id}`
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      Overview
                    </Link>
                    <Link
                      href={`/${project.id}/docs`}
                      onClick={handleLinkClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm transition-colors',
                        pathname?.includes(`/${project.id}/docs`)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      Documentation
                    </Link>
                    <Link
                      href={`/${project.id}/board`}
                      onClick={handleLinkClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm transition-colors',
                        pathname?.includes(`/${project.id}/board`)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      Board
                    </Link>
                    <Link
                      href={`/${project.id}/activity`}
                      onClick={handleLinkClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm transition-colors',
                        pathname?.includes(`/${project.id}/activity`)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      Activity
                    </Link>
                    <Link
                      href={`/${project.id}/settings`}
                      onClick={handleLinkClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm transition-colors',
                        pathname?.includes(`/${project.id}/settings`)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">v0.1.0</p>
      </div>
    </aside>
  )
}
