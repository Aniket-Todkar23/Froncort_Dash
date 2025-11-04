import { getSupabaseClient } from './supabase/client'

interface SessionData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: any
}

const SESSION_KEY = 'froncort_session'
const SESSION_EXPIRY_TIME = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

export const sessionManager = {
  // Save session to localStorage
  saveSession: (accessToken: string, refreshToken: string, user: any) => {
    if (typeof window === 'undefined') return

    const expiresAt = Date.now() + SESSION_EXPIRY_TIME
    const session: SessionData = {
      accessToken,
      refreshToken,
      expiresAt,
      user,
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },

  // Get current session
  getSession: (): SessionData | null => {
    if (typeof window === 'undefined') return null

    const sessionJson = localStorage.getItem(SESSION_KEY)
    if (!sessionJson) return null

    try {
      const session: SessionData = JSON.parse(sessionJson)

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        sessionManager.clearSession()
        return null
      }

      return session
    } catch {
      return null
    }
  },

  // Check if session is still valid
  isSessionValid: (): boolean => {
    const session = sessionManager.getSession()
    return session !== null
  },

  // Refresh session tokens
  refreshSession: async (): Promise<boolean> => {
    try {
      const session = sessionManager.getSession()
      if (!session) return false

      const supabase = getSupabaseClient()

      // Refresh the session using refresh token
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refreshToken,
      })

      if (error || !data.session) {
        sessionManager.clearSession()
        return false
      }

      // Save new session
      sessionManager.saveSession(
        data.session.access_token,
        data.session.refresh_token || session.refreshToken,
        data.user
      )

      return true
    } catch {
      return false
    }
  },

  // Clear session
  clearSession: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEY)
  },

  // Get time until expiry in milliseconds
  getTimeUntilExpiry: (): number => {
    const session = sessionManager.getSession()
    if (!session) return 0
    return Math.max(0, session.expiresAt - Date.now())
  },

  // Get human-readable expiry time
  getExpiryTime: (): string => {
    const session = sessionManager.getSession()
    if (!session) return 'Not logged in'
    return new Date(session.expiresAt).toLocaleTimeString()
  },
}
