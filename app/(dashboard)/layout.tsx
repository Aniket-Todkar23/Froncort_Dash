'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { Sidebar } from '@/components/navigation/sidebar'
import { DashboardHeader } from '@/components/navigation/dashboard-header'
import { CardLoader } from '@/components/Loaders/CardLoader'
import { useTheme } from 'next-themes'
import { useSessionRestore } from '@/hooks/use-session-restore'
import { sessionManager } from '@/lib/session-manager'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, hydrate, setUser } = useUserStore()
  const { theme } = useTheme()
  const { sidebarOpen } = useUIStore()
  const [isHydrating, setIsHydrating] = React.useState(true)

  // Restore session and hydrate
  React.useEffect(() => {
    const restoreAndHydrate = () => {
      // First, try to restore from session manager
      const session = sessionManager.getSession()
      if (session && session.user) {
        setUser(session.user, 'editor')
        console.log('✅ Session restored from storage')
        setIsHydrating(false)
        return
      }

      // Otherwise hydrate from localStorage (legacy)
      hydrate()
      setIsHydrating(false)
    }

    restoreAndHydrate()
  }, [setUser, hydrate])

  // Redirect ONLY after hydration is complete
  React.useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      router.push('/login')
    }
  }, [isHydrating, isAuthenticated, router])

  // Don't block rendering during hydration - let components handle their own loading states

  // Always render the layout, redirect will happen via useEffect
  // This prevents the 404 page from showing
  if (!isAuthenticated) {
    // Still render the layout structure to avoid routing errors
    return (
      <div className="flex h-screen bg-background">
        <div />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
