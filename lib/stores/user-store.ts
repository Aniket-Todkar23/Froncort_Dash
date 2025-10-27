import { create } from 'zustand'
import { type User, type UserRole } from '@/lib/types/database'
import { sessionManager } from '@/lib/session-manager'

interface UserStoreState {
  currentUser: User | null
  currentRole: UserRole | null
  isAuthenticated: boolean
  setUser: (user: User | null, role?: UserRole) => void
  logout: () => void
  hydrate: () => void
}

export const useUserStore = create<UserStoreState>((set) => ({
  currentUser: null,
  currentRole: null,
  isAuthenticated: false,
  setUser: (user, role = 'editor') => {
    set({
      currentUser: user,
      currentRole: user ? role : null,
      isAuthenticated: !!user,
    })
    // Persist to session manager
    if (user) {
      sessionManager.saveSession(
        user.id, // Using user ID as token for now
        user.id, // Using user ID as refresh token
        user
      )
    } else {
      sessionManager.clearSession()
    }
  },
  logout: () => {
    set({
      currentUser: null,
      currentRole: null,
      isAuthenticated: false,
    })
    sessionManager.clearSession()
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const session = sessionManager.getSession()
      if (session && session.user) {
        set({
          currentUser: session.user,
          currentRole: 'editor',
          isAuthenticated: true,
        })
      } else {
        set({
          currentUser: null,
          currentRole: null,
          isAuthenticated: false,
        })
      }
    }
  },
}))
