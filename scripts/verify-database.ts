import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'

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

interface VerificationResult {
  table: string
  status: 'pass' | 'fail' | 'warning'
  count: number
  message: string
}

const results: VerificationResult[] = []

function addResult(table: string, status: 'pass' | 'fail' | 'warning', count: number, message: string) {
  results.push({ table, status, count, message })
}

async function verifyDatabase() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   📋 DATABASE VERIFICATION STARTED 📋         ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    // 1. Verify Users
    console.log('🔍 Verifying Users...')
    const { data: users, error: usersError } = await supabase.from('users').select('id, email, name')

    if (usersError) {
      addResult('users', 'fail', 0, `Error: ${usersError.message}`)
      console.log(`  ✗ Error: ${usersError.message}`)
    } else {
      const userCount = users?.length || 0
      if (userCount >= 4) {
        addResult('users', 'pass', userCount, `${userCount} users found`)
        console.log(`  ✓ ${userCount} users found (expected 4+)`)
      } else {
        addResult('users', 'warning', userCount, `Only ${userCount} users, expected 4+`)
        console.log(`  ⚠️  Only ${userCount} users found (expected 4+)`)
      }
    }

    // 2. Verify Projects
    console.log('\n🔍 Verifying Projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, owner_id')

    if (projectsError) {
      addResult('projects', 'fail', 0, `Error: ${projectsError.message}`)
      console.log(`  ✗ Error: ${projectsError.message}`)
    } else {
      const projectCount = projects?.length || 0
      if (projectCount >= 4) {
        addResult('projects', 'pass', projectCount, `${projectCount} projects found`)
        console.log(`  ✓ ${projectCount} projects found (expected 4+)`)

        // Verify owner relationships
        const { data: projectOwnerData, error: ownerError } = await supabase
          .from('projects')
          .select('id, owner_id, users(id, name)')

        if (!ownerError && projectOwnerData) {
          const validOwners = projectOwnerData.filter((p: any) => p.users)
          console.log(`  ✓ ${validOwners.length}/${projectCount} projects have valid owner relationships`)
        }
      } else {
        addResult('projects', 'warning', projectCount, `Only ${projectCount} projects, expected 4+`)
        console.log(`  ⚠️  Only ${projectCount} projects found (expected 4+)`)
      }
    }

    // 3. Verify Project Members
    console.log('\n🔍 Verifying Project Members...')
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('id, project_id, user_id, role')

    if (membersError) {
      addResult('project_members', 'fail', 0, `Error: ${membersError.message}`)
      console.log(`  ✗ Error: ${membersError.message}`)
    } else {
      const memberCount = members?.length || 0
      if (memberCount >= 8) {
        addResult('project_members', 'pass', memberCount, `${memberCount} memberships found`)
        console.log(`  ✓ ${memberCount} project memberships found (expected 8+)`)
      } else {
        addResult('project_members', 'warning', memberCount, `Only ${memberCount} memberships`)
        console.log(`  ⚠️  Only ${memberCount} project memberships found (expected 8+)`)
      }
    }

    // 4. Verify Pages
    console.log('\n🔍 Verifying Pages...')
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, project_id, created_by')

    if (pagesError) {
      addResult('pages', 'fail', 0, `Error: ${pagesError.message}`)
      console.log(`  ✗ Error: ${pagesError.message}`)
    } else {
      const pageCount = pages?.length || 0
      if (pageCount >= 3) {
        addResult('pages', 'pass', pageCount, `${pageCount} pages found`)
        console.log(`  ✓ ${pageCount} pages found (expected 3+)`)
      } else {
        addResult('pages', 'warning', pageCount, `Only ${pageCount} pages`)
        console.log(`  ⚠️  Only ${pageCount} pages found (expected 3+)`)
      }
    }

    // 5. Verify Kanban Boards
    console.log('\n🔍 Verifying Kanban Boards...')
    const { data: boards, error: boardsError } = await supabase
      .from('kanban_boards')
      .select('id, name, project_id')

    if (boardsError) {
      addResult('kanban_boards', 'fail', 0, `Error: ${boardsError.message}`)
      console.log(`  ✗ Error: ${boardsError.message}`)
    } else {
      const boardCount = boards?.length || 0
      if (boardCount >= 4) {
        addResult('kanban_boards', 'pass', boardCount, `${boardCount} boards found`)
        console.log(`  ✓ ${boardCount} kanban boards found (expected 4+)`)
      } else {
        addResult('kanban_boards', 'warning', boardCount, `Only ${boardCount} boards`)
        console.log(`  ⚠️  Only ${boardCount} kanban boards found (expected 4+)`)
      }
    }

    // 6. Verify Kanban Columns
    console.log('\n🔍 Verifying Kanban Columns...')
    const { data: columns, error: columnsError } = await supabase
      .from('kanban_columns')
      .select('id, name, board_id, order')

    if (columnsError) {
      addResult('kanban_columns', 'fail', 0, `Error: ${columnsError.message}`)
      console.log(`  ✗ Error: ${columnsError.message}`)
    } else {
      const columnCount = columns?.length || 0
      if (columnCount >= 16) {
        // 4 boards × 4 columns
        addResult('kanban_columns', 'pass', columnCount, `${columnCount} columns found`)
        console.log(`  ✓ ${columnCount} kanban columns found (expected 16+)`)
      } else {
        addResult('kanban_columns', 'warning', columnCount, `Only ${columnCount} columns`)
        console.log(`  ⚠️  Only ${columnCount} kanban columns found (expected 16+)`)
      }
    }

    // 7. Verify Kanban Cards
    console.log('\n🔍 Verifying Kanban Cards...')
    const { data: cards, error: cardsError } = await supabase
      .from('kanban_cards')
      .select('id, title, column_id, board_id, created_by, assignee_id')

    if (cardsError) {
      addResult('kanban_cards', 'fail', 0, `Error: ${cardsError.message}`)
      console.log(`  ✗ Error: ${cardsError.message}`)
    } else {
      const cardCount = cards?.length || 0
      if (cardCount >= 32) {
        // 4 boards × 8 cards
        addResult('kanban_cards', 'pass', cardCount, `${cardCount} cards found`)
        console.log(`  ✓ ${cardCount} kanban cards found (expected 32+)`)

        // Check for missing foreign keys
        const { data: cardsWithForeignKeys } = await supabase
          .from('kanban_cards')
          .select('id, column_id, board_id, created_by, assignee_id')

        if (cardsWithForeignKeys) {
          const validCards = cardsWithForeignKeys.filter(
            (c: any) => c.column_id && c.board_id && c.created_by
          )
          console.log(`  ✓ ${validCards.length}/${cardCount} cards have valid foreign keys`)
        }
      } else {
        addResult('kanban_cards', 'warning', cardCount, `Only ${cardCount} cards`)
        console.log(`  ⚠️  Only ${cardCount} kanban cards found (expected 32+)`)
      }
    }

    // 8. Verify Labels
    console.log('\n🔍 Verifying Labels...')
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('id, name, project_id, color')

    if (labelsError) {
      addResult('labels', 'fail', 0, `Error: ${labelsError.message}`)
      console.log(`  ✗ Error: ${labelsError.message}`)
    } else {
      const labelCount = labels?.length || 0
      if (labelCount >= 20) {
        // 4 projects × 5 labels
        addResult('labels', 'pass', labelCount, `${labelCount} labels found`)
        console.log(`  ✓ ${labelCount} labels found (expected 20+)`)
      } else {
        addResult('labels', 'warning', labelCount, `Only ${labelCount} labels`)
        console.log(`  ⚠️  Only ${labelCount} labels found (expected 20+)`)
      }
    }

    // 9. Verify Card Labels (junction table)
    console.log('\n🔍 Verifying Card-Label Relationships...')
    const { data: cardLabels, error: cardLabelsError } = await supabase
      .from('card_labels')
      .select('id, card_id, label_id')

    if (cardLabelsError) {
      addResult('card_labels', 'fail', 0, `Error: ${cardLabelsError.message}`)
      console.log(`  ✗ Error: ${cardLabelsError.message}`)
    } else {
      const cardLabelCount = cardLabels?.length || 0
      if (cardLabelCount >= 32) {
        addResult('card_labels', 'pass', cardLabelCount, `${cardLabelCount} relationships found`)
        console.log(`  ✓ ${cardLabelCount} card-label relationships found (expected 32+)`)
      } else if (cardLabelCount > 0) {
        addResult('card_labels', 'warning', cardLabelCount, `${cardLabelCount} relationships`)
        console.log(`  ⚠️  ${cardLabelCount} card-label relationships found`)
      } else {
        addResult('card_labels', 'warning', cardLabelCount, 'No card-label relationships')
        console.log(`  ⚠️  No card-label relationships found`)
      }
    }

    // 10. Verify Activities
    console.log('\n🔍 Verifying Activities...')
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, action, resource_type, project_id, user_id')

    if (activitiesError) {
      addResult('activities', 'fail', 0, `Error: ${activitiesError.message}`)
      console.log(`  ✗ Error: ${activitiesError.message}`)
    } else {
      const activityCount = activities?.length || 0
      if (activityCount >= 16) {
        // 4 projects × 4 activities
        addResult('activities', 'pass', activityCount, `${activityCount} activities found`)
        console.log(`  ✓ ${activityCount} activities found (expected 16+)`)
      } else if (activityCount > 0) {
        addResult('activities', 'warning', activityCount, `${activityCount} activities`)
        console.log(`  ⚠️  Only ${activityCount} activities found (expected 16+)`)
      }
    }

    // Display summary
    console.log('\n')
    console.log('╔════════════════════════════════════════════════╗')
    console.log('║     ✅ VERIFICATION COMPLETE ✅                ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log('\n📊 VERIFICATION SUMMARY:\n')

    let passed = 0
    let failed = 0
    let warned = 0

    results.forEach((result) => {
      const statusIcon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠️ '
      console.log(`  ${statusIcon} ${result.table.padEnd(20)} | ${result.count} records | ${result.message}`)

      if (result.status === 'pass') passed++
      else if (result.status === 'fail') failed++
      else warned++
    })

    console.log('\n' + `  Total: ${passed} passed, ${warned} warnings, ${failed} failed`)
    console.log('')

    if (failed === 0) {
      console.log('✅ All data looks good! Your database is ready for demonstration.\n')
    } else {
      console.log(
        '⚠️  Some issues detected. Please review the warnings and errors above.\n'
      )
    }
  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  }
}

verifyDatabase()
