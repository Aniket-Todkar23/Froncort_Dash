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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  // Get Website Redesign project
  const { data: projects } = await supabase.from('projects').select('id, name').eq('name', 'Website Redesign')
  console.log('\n=== Website Redesign Project ===')
  if (projects && projects.length > 0) {
    const projId = projects[0].id
    console.log('Project ID:', projId)

    // Get boards for this project
    const { data: boards } = await supabase.from('kanban_boards').select('id, name').eq('project_id', projId)
    console.log('Boards:', boards?.length || 0)
    if (boards && boards.length > 0) {
      const boardId = boards[0].id
      console.log('  Board ID:', boardId, 'Name:', boards[0].name)

      // Get columns
      const { data: columns } = await supabase.from('kanban_columns').select('id, name').eq('board_id', boardId)
      console.log('  Columns:', columns?.length || 0)
      if (columns) {
        columns.forEach(c => console.log(`    - ${c.name} (${c.id})`))
      }

      // Get cards
      const { data: cards } = await supabase.from('kanban_cards').select('id, title').eq('board_id', boardId).limit(5)
      console.log('  Cards:', cards?.length || 0)
    }
  }
}

check()
