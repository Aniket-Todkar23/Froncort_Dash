import { getSupabaseClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of this project
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this project' },
        { status: 403 }
      )
    }

    // Get all members of the project
    const { data: members, error } = await supabase
      .from('project_members')
      .select('*, user:user_id(id, name, email, avatar)')
      .eq('project_id', params.projectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
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
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin/owner of project
    const { data: membership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only project admins/owners can add members' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { user_id, role = 'member' } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Add member to project
    const { data: newMember, error } = await supabase
      .from('project_members')
      .insert({
        project_id: params.projectId,
        user_id,
        role,
        assigned_by: user.id,
      })
      .select('*, user:user_id(id, name, email, avatar)')
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
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
