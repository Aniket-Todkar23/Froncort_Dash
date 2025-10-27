import { getSupabaseClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
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
        { error: 'Only project admins/owners can remove members' },
        { status: 403 }
      )
    }

    // Get member to remove
    const { data: memberToRemove } = await supabase
      .from('project_members')
      .select('*')
      .eq('id', params.memberId)
      .eq('project_id', params.projectId)
      .single()

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent removing project owner (unless you're the owner)
    if (memberToRemove.role === 'owner' && membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove project owner' },
        { status: 403 }
      )
    }

    // Remove member
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', params.memberId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is owner of project (only owners can change roles)
    const { data: membership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only project owners can change member roles' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { role } = body

    if (!role || !['owner', 'admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update member role
    const { data: updatedMember, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', params.memberId)
      .eq('project_id', params.projectId)
      .select('*, user:user_id(id, name, email, avatar)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
