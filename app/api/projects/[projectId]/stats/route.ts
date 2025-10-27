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

    // Get documentation page count
    const { count: pageCount, error: pageError } = await supabase
      .from('documentation_pages')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', params.projectId)

    // Get kanban card count
    const { data: columns, error: columnsError } = await supabase
      .from('kanban_columns')
      .select('id')
      .in(
        'board_id',
        (
          await supabase
            .from('kanban_boards')
            .select('id')
            .eq('project_id', params.projectId)
        ).data?.map((b) => b.id) || []
      )

    let cardCount = 0
    if (columns && columns.length > 0) {
      const { count } = await supabase
        .from('kanban_cards')
        .select('*', { count: 'exact', head: true })
        .in(
          'column_id',
          columns.map((c) => c.id)
        )
      cardCount = count || 0
    }

    return NextResponse.json({
      pageCount: pageCount || 0,
      taskCount: cardCount,
    })
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
