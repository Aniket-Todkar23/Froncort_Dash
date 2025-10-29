'use client'

import bcryptjs from 'bcryptjs'
import { getSupabaseClient } from './client'

// Mock credentials for testing - passwords stored as bcrypt hashes
// alice123 and bob123 are pre-hashed
// const MOCK_USERS: Record<string, { passwordHash: string; name: string }> = {
//   'alice@example.com': {
//     passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR0Ifj0a', // alice123
//     name: 'Alice Johnson',
//   },
//   'bob@example.com': {
//     passwordHash: '$2a$10$VIsDnSHwArETKLZyf4OzfO3/3eZc.Tr0Dg99n5PEsWJ9xHgQ0zLMG', // bob123
//     name: 'Bob Smith',
//   },
// }

export async function signUpWithEmail(email: string, password: string, name: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  // Check mock credentials first
  const mockUser = MOCK_USERS[email]
  if (mockUser) {
    // Verify password against bcrypt hash
    const isPasswordValid = await bcryptjs.compare(password, mockUser.passwordHash)

    if (isPasswordValid) {
      // Return mock session/user object
      return {
        session: {
          access_token: `mock_token_${email}`,
          refresh_token: `mock_refresh_${email}`,
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: `user_${email.split('@')[0]}`,
            email,
            user_metadata: { name: mockUser.name },
            created_at: new Date().toISOString(),
          },
        },
        user: {
          id: `user_${email.split('@')[0]}`,
          email,
          user_metadata: { name: mockUser.name },
          created_at: new Date().toISOString(),
        },
      }
    }
  }

  // Try Supabase if credentials don't match mock
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (err) {
    // If Supabase fails, throw error with hint
    throw new Error('Invalid credentials. Try alice@example.com (alice123) or bob@example.com (bob123)')
  }
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) throw error
  return session
}
