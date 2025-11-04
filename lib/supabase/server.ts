import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import type { Database } from './types'

export function createServerSupabaseClient(request?: NextRequest) {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Extract the project ref from URL to construct the cookie name
  const projectRef = supabaseUrl.split('.')[0].replace('https://', '')
  const authCookieName = `sb-${projectRef}-auth-token`

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Ignore errors in API routes
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name)
          } catch (error) {
            // Ignore errors in API routes
          }
        },
      },
    }
  )
}
