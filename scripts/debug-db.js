import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=')
    if (key && !key.startsWith('//') && !key.startsWith('#')) {
      process.env[key.trim()] = value?.trim().replace(/^['\"]+|['\"]+$/g, '') || ''
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugDb() {
  console.log('\n📊 DATABASE DEBUG INFO\n')

  try {
    // Check projects
    const { data: projects } = await supabase.from('projects').select('id, name').limit(5)
    console.log('Projects:', projects?.length || 0)
    projects?.forEach(p => console.log(`  - ${p.name}`))

    // Check kanban boards
    const { data: boards } = await supabase.from('kanban_boards').select('id, project_id, name').limit(5)
    console.log('\nKanban Boards:', boards?.length || 0)
    boards?.forEach(b => console.log(`  - ${b.name} (project: ${b.project_id})`))

    // Check kanban columns
    const { data: columns } = await supabase.from('kanban_columns').select('id, board_id, name').limit(10)
    console.log('\nKanban Columns:', columns?.length || 0)
    columns?.forEach(c => console.log(`  - ${c.name} (board: ${c.board_id})`))

    // Check kanban cards
    const { data: cards } = await supabase.from('kanban_cards').select('id, title, board_id, column_id').limit(10)
    console.log('\nKanban Cards:', cards?.length || 0)
    cards?.forEach(c => console.log(`  - ${c.title} (board: ${c.board_id}, col: ${c.column_id})`))

    // Check specific project with board and cards
    if (projects && projects.length > 0) {
      const proj = projects[0]
      const { data: boardsForProj } = await supabase.from('kanban_boards').select('id').eq('project_id', proj.id).single()
      if (boardsForProj) {
        const { data: cardsForBoard } = await supabase.from('kanban_cards').select('*').eq('board_id', boardsForProj.id)
        console.log(`\nCards in "${proj.name}" board:`, cardsForBoard?.length || 0)
        cardsForBoard?.forEach(c => console.log(`  - ${c.title}`))
      }
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

debugDb()
