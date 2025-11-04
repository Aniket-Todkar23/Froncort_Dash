import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fallback: extract user from auth token cookie if Supabase session fails
    let userId = user?.id
    if (!userId) {
      const authCookie = req.cookies.get('sb-uyrgjrnfmuookcrhtifu-auth-token')?.value
      if (authCookie) {
        try {
          const authData = JSON.parse(authCookie)
          userId = authData.user?.id
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users (excluding current user)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, avatar')
      .neq('id', userId)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
