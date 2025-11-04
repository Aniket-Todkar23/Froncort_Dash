'use client'

import { getSupabaseClient } from './client'

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
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
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
