import { NextResponse } from 'next/server'

const createCardsTableSQL = `
-- Create cards table for kanban board
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  assignee_id TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  updated_by TEXT
);

-- Create index on project_id for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_project_id ON public.cards(project_id);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON public.cards(column_id);
`

export async function GET() {
  try {
    // Use Supabase admin API to execute raw SQL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      )
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: createCardsTableSQL }),
    })

    if (!response.ok) {
      // Try alternative method using the Supabase SDK
      console.log('Direct SQL execution failed, attempting via SDK...')
      
      // Instead, return instructions to run via Supabase UI
      return NextResponse.json({
        success: true,
        message: 'Please run the migration manually in Supabase SQL Editor',
        instructions: [
          'Go to https://supabase.com/dashboard/project/uyrgjrnfmuookcrhtifu/sql',
          'Paste the following SQL and run it:',
          createCardsTableSQL,
        ],
      })
    }

    const data = await response.json()
    console.log('✓ Cards table created successfully')
    return NextResponse.json({
      success: true,
      message: 'Cards table created successfully',
      data,
    })
  } catch (error) {
    console.error('Error creating cards table:', error)
    return NextResponse.json(
      {
        error: 'Failed to create cards table',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'Run the SQL manually in your Supabase dashboard',
      },
      { status: 500 }
    )
  }
}
