import { useEffect } from 'react'
import { useUserStore } from '@/lib/stores/user-store'
import { sessionManager } from '@/lib/session-manager'

export function useSessionRestore() {
  useEffect(() => {
    // Restore session on app load
    const restoreSession = async () => {
      // First check if session exists in localStorage
      const session = sessionManager.getSession()
      
      if (session && session.user) {
        // Session is valid, restore it
        const { setUser } = useUserStore.getState()
        setUser(session.user, 'editor')
        console.log('Session restored from storage')
        
        // Optional: Refresh the session in background if close to expiry
        const timeUntilExpiry = sessionManager.getTimeUntilExpiry()
        const refreshThreshold = 30 * 60 * 1000 // Refresh if less than 30 minutes left
        
        if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
          console.log('Session expiring soon, attempting refresh...')
          await sessionManager.refreshSession()
        }
      }
    }

    restoreSession()
  }, [])
}
