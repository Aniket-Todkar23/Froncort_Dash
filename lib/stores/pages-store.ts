// Global store for managing pages across components
export const pagesStore: Record<string, any[]> = {}

export function getAllPages(): any[] {
  return Object.values(pagesStore).flat()
}

export function getPageById(pageId: string): any {
  const allPages = getAllPages()
  return allPages.find((p) => p.id === pageId)
}

export function setProjectPages(projectId: string, pages: any[]): void {
  pagesStore[projectId] = pages
}

export function getProjectPages(projectId: string): any[] {
  return pagesStore[projectId] || []
}
