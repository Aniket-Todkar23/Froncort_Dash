import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface BackupData {
  timestamp: string
  tables: Record<string, any[]>
}

async function backupDatabase() {
  console.log('📦 Starting database backup...\n')

  const backup: BackupData = {
    timestamp: new Date().toISOString(),
    tables: {},
  }

  const tables = [
    'users',
    'projects',
    'project_members',
    'pages',
    'page_versions',
    'kanban_boards',
    'kanban_columns',
    'kanban_cards',
    'card_labels',
    'labels',
    'activities',
    'notifications',
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')

      if (error) {
        console.warn(`⚠️  Failed to backup ${table}: ${error.message}`)
        backup.tables[table] = []
      } else {
        backup.tables[table] = data || []
        console.log(`✓ Backed up ${table} (${(data || []).length} records)`)
      }
    } catch (error) {
      console.warn(`⚠️  Error backing up ${table}:`, error)
      backup.tables[table] = []
    }
  }

  // Save backup to file
  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const backupFile = path.join(
    backupDir,
    `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`
  )

  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
  console.log(`\n✅ Backup completed and saved to: ${backupFile}`)

  return backup
}

backupDatabase().catch((error) => {
  console.error('❌ Backup failed:', error)
  process.exit(1)
})
