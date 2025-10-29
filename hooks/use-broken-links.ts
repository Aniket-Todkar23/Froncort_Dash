'use client'

import { useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getPageById, getProjectPages } from '@/lib/stores/pages-store'

export interface BrokenLink {
  pageId: string
  title: string
  reason: 'not-found' | 'in-progress' | 'deleted'
}

/**
 * Hook to find broken links and pages that don't exist
 * Analyzes content for page references and validates them
 */
export function useBrokenLinks() {
  /**
   * Check if a specific page exists
   */
  const pageExists = useCallback(
    async (pageId: string, projectId: string): Promise<boolean> => {
      // Check in local store first
      const storedPage = getPageById(pageId)
      if (storedPage) return true

      // Check in project pages
      const projectPages = getProjectPages(projectId)
      if (projectPages.some((p) => p.id === pageId)) return true

      // Check in database
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('pages')
          .select('id')
          .eq('id', pageId)
          .single()

        return !error && !!data
      } catch (err) {
        console.error('Error checking page existence:', err)
        return false
      }
    },
    []
  )

  /**
   * Extract page IDs from markdown or HTML content
   * Looks for patterns like: [text](/{projectId}/docs/{pageId})
   */
  const extractPageReferences = useCallback((content: string, projectId: string): string[] => {
    const pageIdPattern = new RegExp(`\/${projectId}\/docs\/([a-zA-Z0-9-]+)`, 'g')
    const matches = content.matchAll(pageIdPattern)
    const pageIds = Array.from(matches, (match) => match[1])
    return [...new Set(pageIds)] // Remove duplicates
  }, [])

  /**
   * Find all broken links in a page's content
   */
  const findBrokenLinks = useCallback(
    async (content: string, projectId: string): Promise<BrokenLink[]> => {
      const pageIds = extractPageReferences(content, projectId)
      const brokenLinks: BrokenLink[] = []

      for (const pageId of pageIds) {
        const exists = await pageExists(pageId, projectId)
        if (!exists) {
          brokenLinks.push({
            pageId,
            title: `Page ${pageId}`,
            reason: 'not-found',
          })
        }
      }

      return brokenLinks
    },
    [extractPageReferences, pageExists]
  )

  /**
   * Get all pages that have broken links
   */
  const findPagesWithBrokenLinks = useCallback(
    async (projectId: string) => {
      try {
        const projectPages = getProjectPages(projectId)
        const pagesWithBrokenLinks: Array<{
          pageId: string
          title: string
          brokenLinks: BrokenLink[]
        }> = []

        for (const page of projectPages) {
          const brokenLinks = await findBrokenLinks(page.content || '', projectId)
          if (brokenLinks.length > 0) {
            pagesWithBrokenLinks.push({
              pageId: page.id,
              title: page.title,
              brokenLinks,
            })
          }
        }

        return pagesWithBrokenLinks
      } catch (err) {
        console.error('Error finding pages with broken links:', err)
        return []
      }
    },
    [findBrokenLinks]
  )

  return {
    pageExists,
    extractPageReferences,
    findBrokenLinks,
    findPagesWithBrokenLinks,
  }
}
