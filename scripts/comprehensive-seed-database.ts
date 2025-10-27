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

// Define seed data
const SEED_USERS = [
  {
    email: 'john.doe@froncort.com',
    password: 'SecurePass123!',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    email: 'sarah.smith@froncort.com',
    password: 'SecurePass123!',
    name: 'Sarah Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    email: 'mike.johnson@froncort.com',
    password: 'SecurePass123!',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    email: 'emily.davis@froncort.com',
    password: 'SecurePass123!',
    name: 'Emily Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
]

const PROJECT_CONFIGS = [
  {
    name: 'Product Roadmap Q1 2025',
    description: 'Quarterly planning and feature prioritization for Q1 2025',
    ownerEmail: 'john.doe@froncort.com',
    members: ['sarah.smith@froncort.com', 'mike.johnson@froncort.com'],
    memberRoles: ['admin', 'editor'],
  },
  {
    name: 'Engineering Documentation',
    description: 'API docs, architecture guides, and technical specifications',
    ownerEmail: 'sarah.smith@froncort.com',
    members: ['john.doe@froncort.com', 'emily.davis@froncort.com'],
    memberRoles: ['editor', 'viewer'],
  },
  {
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX',
    ownerEmail: 'mike.johnson@froncort.com',
    members: ['john.doe@froncort.com', 'emily.davis@froncort.com'],
    memberRoles: ['editor', 'editor'],
  },
  {
    name: 'Mobile App Development',
    description: 'Development and launch of iOS and Android applications',
    ownerEmail: 'emily.davis@froncort.com',
    members: ['john.doe@froncort.com', 'sarah.smith@froncort.com', 'mike.johnson@froncort.com'],
    memberRoles: ['admin', 'editor', 'editor'],
  },
]

const BOARD_COLUMNS = [
  { name: 'To Do', order: 0, color: '#EF4444' },
  { name: 'In Progress', order: 1, color: '#F59E0B' },
  { name: 'Review', order: 2, color: '#3B82F6' },
  { name: 'Done', order: 3, color: '#10B981' },
]

const DEFAULT_LABELS = [
  { name: 'Bug', color: '#EF4444' },
  { name: 'Feature', color: '#8B5CF6' },
  { name: 'Documentation', color: '#06B6D4' },
  { name: 'Design', color: '#EC4899' },
  { name: 'Performance', color: '#F59E0B' },
]

const PAGE_TEMPLATES = [
  {
    title: 'Getting Started Guide',
    content:
      '<h2>Welcome to Froncort</h2><p>Froncort is a collaborative project management tool combining the best of Confluence and Jira.</p><h3>Key Features</h3><ul><li>Real-time collaborative editing</li><li>Kanban boards for task management</li><li>Version history and rollback</li><li>@mentions and notifications</li></ul>',
  },
  {
    title: 'Sprint Planning Template',
    content:
      '<h2>Sprint Planning</h2><p>Use this template for sprint planning and tracking.</p><h3>Sprint Goals</h3><ul><li>Define sprint goals</li><li>Identify key deliverables</li><li>Estimate effort and capacity</li></ul>',
  },
  {
    title: 'Architecture Overview',
    content:
      '<h2>System Architecture</h2><p>High-level overview of system components and their interactions.</p><h3>Components</h3><ul><li>Frontend (Next.js, React)</li><li>Backend API</li><li>Database (PostgreSQL)</li><li>Real-time Services</li></ul>',
  },
]

const CARD_TEMPLATES = [
  {
    title: 'Design system documentation',
    description: 'Create comprehensive design system documentation',
  },
  {
    title: 'Implement user authentication',
    description: 'Build secure user authentication with OAuth2',
  },
  {
    title: 'Database optimization',
    description: 'Optimize slow queries and add appropriate indexes',
  },
  {
    title: 'Performance testing',
    description: 'Run comprehensive performance tests and benchmarks',
  },
  {
    title: 'Security audit',
    description: 'Conduct security audit and fix vulnerabilities',
  },
  {
    title: 'API documentation',
    description: 'Write comprehensive API documentation',
  },
  {
    title: 'Mobile responsiveness',
    description: 'Ensure all pages are mobile responsive',
  },
  {
    title: 'Unit test coverage',
    description: 'Increase unit test coverage to 85%',
  },
]

interface SeedStats {
  users: number
  projects: number
  pages: number
  kanbanBoards: number
  kanbanColumns: number
  kanbanCards: number
  labels: number
  activities: number
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...\n')

  const tablesToClear = [
    'card_labels',
    'kanban_cards',
    'kanban_columns',
    'kanban_boards',
    'labels',
    'page_versions',
    'pages',
    'project_members',
    'activities',
    'notifications',
  ]

  for (const table of tablesToClear) {
    try {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      console.log(`✓ Cleared ${table}`)
    } catch (error) {
      console.warn(`⚠️  Could not clear ${table}`)
    }
  }
  console.log('')
}

async function seedUsers(): Promise<Record<string, string>> {
  console.log('👥 Creating users...')

  const userIds: Record<string, string> = {}

  for (const user of SEED_USERS) {
    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { name: user.name, avatar: user.avatar },
        email_confirm: true,
      })

      if (authError && !authError.message.includes('already exists')) {
        throw authError
      }

      let userId: string

      if (authUser?.user) {
        userId = authUser.user.id
      } else {
        // User already exists, fetch their ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existing = existingUsers?.users?.find((u) => u.email === user.email)
        if (!existing) throw new Error(`Could not create or find user: ${user.email}`)
        userId = existing.id
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').upsert(
        {
          id: userId,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        { onConflict: 'id' }
      )

      if (profileError && !profileError.message.includes('duplicate')) {
        throw profileError
      }

      userIds[user.email] = userId
      console.log(`✓ Created user: ${user.name} (${user.email})`)
    } catch (error) {
      console.error(`✗ Error creating user ${user.email}:`, error)
      throw error
    }
  }

  console.log('')
  return userIds
}

async function seedProjects(
  userIds: Record<string, string>
): Promise<Record<string, { id: string; userId: string }>> {
  console.log('📁 Creating projects...')

  const projectMap: Record<string, { id: string; userId: string }> = {}

  for (const projectConfig of PROJECT_CONFIGS) {
    try {
      const ownerId = userIds[projectConfig.ownerEmail]
      if (!ownerId) throw new Error(`Owner not found: ${projectConfig.ownerEmail}`)

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: projectConfig.name,
          description: projectConfig.description,
          owner_id: ownerId,
          avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${projectConfig.name}`,
        })
        .select()
        .single()

      if (error) throw error

      projectMap[projectConfig.name] = { id: project.id, userId: ownerId }

      // Add project members
      for (let i = 0; i < projectConfig.members.length; i++) {
        const memberEmail = projectConfig.members[i]
        const role = projectConfig.memberRoles[i]
        const memberId = userIds[memberEmail]

        if (!memberId) {
          console.warn(`⚠️  Member not found: ${memberEmail}`)
          continue
        }

        const { error: memberError } = await supabase.from('project_members').insert({
          project_id: project.id,
          user_id: memberId,
          role: role,
        })

        if (memberError && !memberError.message.includes('duplicate')) {
          console.warn(`⚠️  Could not add member: ${error}`)
        }
      }

      console.log(`✓ Created project: ${projectConfig.name}`)
    } catch (error) {
      console.error(`✗ Error creating project ${projectConfig.name}:`, error)
      throw error
    }
  }

  console.log('')
  return projectMap
}

async function seedPages(
  projectMap: Record<string, { id: string; userId: string }>
): Promise<Record<string, string>> {
  console.log('📄 Creating pages...')

  const pageIds: Record<string, string> = {}
  const projects = Object.entries(projectMap)

  for (let i = 0; i < PAGE_TEMPLATES.length; i++) {
    try {
      const template = PAGE_TEMPLATES[i]
      const [projectName, { id: projectId, userId }] = projects[i % projects.length]

      const { data: page, error } = await supabase
        .from('pages')
        .insert({
          project_id: projectId,
          title: template.title,
          content: template.content,
          order: i,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      pageIds[template.title] = page.id
      console.log(`✓ Created page: ${template.title} (in ${projectName})`)
    } catch (error) {
      console.error(`✗ Error creating page:`, error)
      throw error
    }
  }

  console.log('')
  return pageIds
}

async function seedKanbanBoards(projectMap: Record<string, { id: string; userId: string }>) {
  console.log('🎯 Creating kanban boards...')

  const boardMap: Record<string, { id: string; projectId: string }> = {}

  for (const [projectName, { id: projectId }] of Object.entries(projectMap)) {
    try {
      const { data: board, error } = await supabase
        .from('kanban_boards')
        .insert({
          project_id: projectId,
          name: 'Planning Board',
        })
        .select()
        .single()

      if (error) throw error

      boardMap[projectName] = { id: board.id, projectId }
      console.log(`✓ Created board for: ${projectName}`)
    } catch (error) {
      console.error(`✗ Error creating board for ${projectName}:`, error)
      throw error
    }
  }

  console.log('')
  return boardMap
}

async function seedKanbanColumns(boardMap: Record<string, { id: string; projectId: string }>) {
  console.log('📋 Creating kanban columns...')

  const columnMap: Record<string, string[]> = {}

  for (const [projectName, { id: boardId }] of Object.entries(boardMap)) {
    try {
      const columns = BOARD_COLUMNS.map((col) => ({
        board_id: boardId,
        name: col.name,
        order: col.order,
        color: col.color,
      }))

      const { data: createdColumns, error } = await supabase
        .from('kanban_columns')
        .insert(columns)
        .select()

      if (error) throw error

      columnMap[boardId] = (createdColumns || []).map((col) => col.id)
      console.log(`✓ Created columns for: ${projectName}`)
    } catch (error) {
      console.error(`✗ Error creating columns:`, error)
      throw error
    }
  }

  console.log('')
  return columnMap
}

async function seedLabels(projectMap: Record<string, { id: string; userId: string }>) {
  console.log('🏷️  Creating labels...')

  const labelMap: Record<string, string[]> = {}

  for (const [projectName, { id: projectId }] of Object.entries(projectMap)) {
    try {
      const labels = DEFAULT_LABELS.map((label) => ({
        project_id: projectId,
        name: label.name,
        color: label.color,
      }))

      const { data: createdLabels, error } = await supabase
        .from('labels')
        .insert(labels)
        .select()

      if (error) throw error

      labelMap[projectId] = (createdLabels || []).map((label) => label.id)
      console.log(`✓ Created labels for: ${projectName}`)
    } catch (error) {
      console.error(`✗ Error creating labels:`, error)
      throw error
    }
  }

  console.log('')
  return labelMap
}

async function seedKanbanCards(
  boardMap: Record<string, { id: string; projectId: string }>,
  columnMap: Record<string, string[]>,
  labelMap: Record<string, string[]>,
  projectMap: Record<string, { id: string; userId: string }>,
  userIds: Record<string, string>
) {
  console.log('🎴 Creating kanban cards...')

  let totalCards = 0
  const userIdsList = Object.values(userIds)

  for (const [projectName, { id: boardId, projectId }] of Object.entries(boardMap)) {
    try {
      const columnIds = columnMap[boardId]
      const labelIds = labelMap[projectId]
      const { userId: createdBy } = projectMap[projectName]

      if (!columnIds || columnIds.length === 0) {
        console.warn(`⚠️  No columns found for ${projectName}`)
        continue
      }

      // Distribute cards across columns
      for (let i = 0; i < CARD_TEMPLATES.length; i++) {
        const template = CARD_TEMPLATES[i]
        const columnId = columnIds[i % columnIds.length]
        const assigneeId = userIdsList[i % userIdsList.length]
        const order = Math.floor(i / columnIds.length)

        const cardData: any = {
          board_id: boardId,
          column_id: columnId,
          title: template.title,
          description: template.description,
          order: order,
          created_by: createdBy,
          assignee_id: assigneeId,
          due_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }

        const { data: card, error } = await supabase
          .from('kanban_cards')
          .insert(cardData)
          .select()
          .single()

        if (error) throw error

        // Attach 1-2 random labels to each card
        if (labelIds && labelIds.length > 0) {
          const labelsToAttach = labelIds.slice(0, Math.min(2, labelIds.length))
          for (const labelId of labelsToAttach) {
            await supabase.from('card_labels').insert({
              card_id: card.id,
              label_id: labelId,
            })
          }
        }

        totalCards++
      }

      console.log(`✓ Created cards for: ${projectName}`)
    } catch (error) {
      console.error(`✗ Error creating cards for ${projectName}:`, error)
      throw error
    }
  }

  console.log(`✓ Total cards created: ${totalCards}\n`)
  return totalCards
}

async function seedActivities(
  userIds: Record<string, string>,
  projectMap: Record<string, { id: string; userId: string }>
) {
  console.log('📊 Creating activity entries...')

  const activities = [
    { action: 'created', resourceType: 'project', resourceName: 'Project initialized' },
    { action: 'created', resourceType: 'page', resourceName: 'Documentation added' },
    { action: 'created', resourceType: 'card', resourceName: 'Card created' },
    { action: 'assigned', resourceType: 'card', resourceName: 'Card assigned' },
  ]

  let totalActivities = 0
  const userIdsList = Object.values(userIds)

  for (const [projectName, { id: projectId, userId }] of Object.entries(projectMap)) {
    try {
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i]
        const authorId = userIdsList[i % userIdsList.length]

        const { error } = await supabase.from('activities').insert({
          project_id: projectId,
          user_id: authorId,
          action: activity.action,
          resource_type: activity.resourceType,
          resource_id: `res-${Date.now()}-${i}`,
          resource_name: activity.resourceName,
        })

        if (error) throw error
        totalActivities++
      }

      console.log(`✓ Created activities for: ${projectName}`)
    } catch (error) {
      console.error(`✗ Error creating activities:`, error)
      throw error
    }
  }

  console.log(`✓ Total activities created: ${totalActivities}\n`)
  return totalActivities
}

async function comprehensiveSeedDatabase() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   🌱 FRONCORT DATABASE SEEDING STARTED 🌱      ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('\n')

  const stats: SeedStats = {
    users: 0,
    projects: 0,
    pages: 0,
    kanbanBoards: 0,
    kanbanColumns: 0,
    kanbanCards: 0,
    labels: 0,
    activities: 0,
  }

  try {
    // Step 1: Clear existing data
    await clearExistingData()

    // Step 2: Seed users
    const userIds = await seedUsers()
    stats.users = Object.keys(userIds).length

    // Step 3: Seed projects and members
    const projectMap = await seedProjects(userIds)
    stats.projects = Object.keys(projectMap).length

    // Step 4: Seed pages
    const pageIds = await seedPages(projectMap)
    stats.pages = Object.keys(pageIds).length

    // Step 5: Seed kanban boards
    const boardMap = await seedKanbanBoards(projectMap)
    stats.kanbanBoards = Object.keys(boardMap).length

    // Step 6: Seed kanban columns
    const columnMap = await seedKanbanColumns(boardMap)
    stats.kanbanColumns = BOARD_COLUMNS.length * stats.kanbanBoards

    // Step 7: Seed labels
    const labelMap = await seedLabels(projectMap)
    stats.labels = DEFAULT_LABELS.length * stats.projects

    // Step 8: Seed kanban cards with labels
    stats.kanbanCards = await seedKanbanCards(boardMap, columnMap, labelMap, projectMap, userIds)

    // Step 9: Seed activities
    stats.activities = await seedActivities(userIds, projectMap)

    // Display summary
    console.log('╔════════════════════════════════════════════════╗')
    console.log('║        ✅ SEEDING COMPLETED SUCCESSFULLY ✅     ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log('\n📊 DATABASE STATISTICS:\n')
    console.log(`  👥 Users:           ${stats.users}`)
    console.log(`  📁 Projects:        ${stats.projects}`)
    console.log(`  📄 Pages:           ${stats.pages}`)
    console.log(`  🎯 Kanban Boards:   ${stats.kanbanBoards}`)
    console.log(`  📋 Columns:         ${stats.kanbanColumns}`)
    console.log(`  🎴 Cards:           ${stats.kanbanCards}`)
    console.log(`  🏷️  Labels:          ${stats.labels}`)
    console.log(`  📊 Activities:      ${stats.activities}`)
    console.log('\n🔗 TEST CREDENTIALS:\n')

    for (const user of SEED_USERS) {
      console.log(`  Email:    ${user.email}`)
      console.log(`  Password: ${user.password}`)
      console.log('')
    }

    console.log('👉 You can now log in and start exploring!\n')
  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error)
    process.exit(1)
  }
}

comprehensiveSeedDatabase()
