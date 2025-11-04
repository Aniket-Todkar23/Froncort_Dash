'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, FileText, Zap, FolderOpen } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/auth'

interface SearchResult {
  id: string
  title: string
  type: 'page' | 'project' | 'task'
  projectId?: string
  pageId?: string
  description?: string
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults([])
      return
    }

    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      const user = await getCurrentUser()

      if (!user) return

      // Search pages
      const { data: pages } = await supabase
        .from('pages')
        .select('id, title, project_id, content')
        .ilike('title', `%${searchQuery}%`)
        .limit(5)

      // Search projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description')
        .ilike('name', `%${searchQuery}%`)
        .limit(5)

      const searchResults: SearchResult[] = [
        ...(pages?.map((page: any) => ({
          id: page.id,
          title: page.title,
          type: 'page' as const,
          projectId: page.project_id,
          pageId: page.id,
        })) || []),
        ...(projects?.map((project: any) => ({
          id: project.id,
          title: project.name,
          type: 'project' as const,
          projectId: project.id,
          description: project.description,
        })) || []),
      ]

      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    setIsOpen(true)
    performSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'page') {
      router.push(`/${result.projectId}/docs/${result.pageId}`)
    } else if (result.type === 'project') {
      router.push(`/${result.projectId}`)
    }
    setIsOpen(false)
    setQuery('')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText className="h-4 w-4" />
      case 'project':
        return <FolderOpen className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
        <Input
          placeholder="Search pages, projects..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-3 rounded-lg bg-muted/40 border-muted/60 group-hover:border-primary/40 group-focus-within:border-primary group-focus-within:bg-muted/60 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10 transition-all duration-200"
        />
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border/50 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-in zoom-in-95 duration-200 backdrop-blur-sm">
          {isLoading && (
            <div className="p-6 text-center text-sm text-muted-foreground font-medium">
              <div className="inline-block">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {!isLoading && results.length === 0 && query && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground font-medium">No results found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">for &quot;{query}&quot;</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="divide-y divide-border/40 py-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-primary/5 hover:border-l-2 hover:border-l-primary transition-all duration-150 flex items-start gap-3 group/result"
                >
                  <div className="text-muted-foreground group-hover/result:text-primary mt-1 transition-colors duration-150">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground group-hover/result:text-primary transition-colors duration-150">{result.title}</p>
                    {result.description && (
                      <p className="text-xs text-muted-foreground/80 truncate group-hover/result:text-muted-foreground transition-colors duration-150">
                        {result.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 capitalize mt-1.5 font-medium">
                      {result.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
