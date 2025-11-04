import { getSupabaseClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

async function seedCards() {
  try {
    const supabase = getSupabaseClient()

    // Get the first board
    const { data: boards, error: boardError } = await supabase
      .from('kanban_boards')
      .select('id')
      .limit(1)

    if (boardError || !boards || boards.length === 0) {
      return NextResponse.json(
        { error: 'No kanban board found. Please create a board first.' },
        { status: 400 }
      )
    }

    const boardId = boards[0].id

    // Get columns for this board
    const { data: columns, error: colError } = await supabase
      .from('kanban_columns')
      .select('id, name')
      .eq('board_id', boardId)
      .order('order')

    if (colError || !columns || columns.length === 0) {
      return NextResponse.json(
        { error: 'No kanban columns found. Please create columns first.' },
        { status: 400 }
      )
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Map column names to IDs
    const columnMap: Record<string, string> = {}
    columns.forEach((col) => {
      columnMap[col.name] = col.id
    })

    // Build cards with real column IDs
    const SEED_CARDS = [
      {
        board_id: boardId,
        title: 'Design login page mockups',
        description: 'Create high-fidelity mockups for the new login flow',
        column_id: columnMap['To Do'] || columns[0].id,
        created_by: user.id,
        order: 0,
      },
      {
        board_id: boardId,
        title: 'Implement authentication API',
        description: 'Build the backend for user authentication',
        column_id: columnMap['In Progress'] || columns[1].id,
        created_by: user.id,
        order: 0,
      },
      {
        board_id: boardId,
        title: 'Write user guide documentation',
        description: 'Complete documentation for end users',
        column_id: columnMap['Done'] || columns[2].id,
        created_by: user.id,
        order: 0,
      },
      {
        board_id: boardId,
        title: 'Bug: Mobile navigation not responsive',
        description: 'Navigation menu breaks on mobile devices below 600px',
        column_id: columnMap['To Do'] || columns[0].id,
        created_by: user.id,
        order: 1,
      },
      {
        board_id: boardId,
        title: 'Implement dark mode toggle',
        description: 'Add dark/light mode switcher to the app',
        column_id: columnMap['To Do'] || columns[0].id,
        created_by: user.id,
        order: 2,
      },
      {
        board_id: boardId,
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing',
        column_id: columnMap['In Progress'] || columns[1].id,
        created_by: user.id,
        order: 1,
      },
    ]

    // Insert seed cards into kanban_cards table
    const { data, error } = await supabase.from('kanban_cards').insert(SEED_CARDS).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SEED_CARDS.length} cards`,
      cards: data,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return seedCards()
}

export async function POST() {
  return seedCards()
}
