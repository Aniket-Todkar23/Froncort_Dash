import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
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


    // Verify user is member of this project
    const projectId = String(params.projectId)
    const { data: membership, error: membershipError } = await (supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId as any)
      .eq('user_id', userId as any) as any)
      .single()

    // Also check if user is the project owner
    const { data: projectOwner } = await (supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId as any) as any)
      .single()
    

    const isOwner = projectOwner?.owner_id === userId || 
                   projectOwner?.owner_id?.toString().toLowerCase() === userId?.toString().toLowerCase()

    // membership could be null even if user is in the table if error occurs
    const hasMembership = membership && !membershipError

    if (!hasMembership && !isOwner) {
      return NextResponse.json(
        { error: 'Not a member of this project' },
        { status: 403 }
      )
    }

    // Get all members of the project
    const { data: members, error } = await (supabase
      .from('project_members')
      .select('*, user:user_id(id, name, email, avatar)')
      .eq('project_id', projectId as any) as any)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    // Verify user is admin/owner of project or project owner
    const projectId = String(params.projectId)
    const { data: membership } = await (supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId as any)
      .eq('user_id', userId as any) as any)
      .single()

    // Also check if user is the project owner
    const { data: projectOwner } = await (supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId as any) as any)
      .single()

    const isOwner = projectOwner?.owner_id === userId || 
                   projectOwner?.owner_id?.toString().toLowerCase() === userId?.toString().toLowerCase()
    const isAdminOrMember = membership && ['owner', 'admin'].includes(membership.role)

    if (!isOwner && !isAdminOrMember) {
      return NextResponse.json(
        { error: 'Only project admins/owners can add members' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { user_id, role = 'editor' } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Add member to project
    const { data: newMember, error } = await (supabase
      .from('project_members')
      .insert({
        project_id: projectId as any,
        user_id: user_id as any,
        role,
        assigned_by: userId as any,
      } as any)
      .select('*, user:user_id(id, name, email, avatar)') as any)
      .single()

    if (error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'User is already a member of this project' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
