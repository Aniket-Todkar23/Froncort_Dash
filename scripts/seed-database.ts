import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=')
    if (key && !key.startsWith('//') && !key.startsWith('#')) {
      process.env[key.trim()] = value?.trim().replace(/^['"]+|['"]+$/g, '') || ''
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

const SEED_USERS = [
  {
    email: 'john@example.com',
    password: 'john1234',
    name: 'John Doe',
  },
  {
    email: 'sarah@example.com',
    password: 'sarah1234',
    name: 'Sarah Smith',
  },
  {
    email: 'demo@froncort.com',
    password: 'demo1234',
    name: 'Demo User',
  },
]

async function seedDatabase() {
  console.log('Starting database seeding...')

  try {
    // Create users
    console.log('Creating users...')
    const userIds: Record<string, string> = {}

    for (const user of SEED_USERS) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { name: user.name },
        email_confirm: true,
      })

      if (error) {
        console.warn(`User ${user.email} might already exist:`, error.message)
        // Try to get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const found = existingUser?.users?.find((u) => u.email === user.email)
        if (found) {
          userIds[user.email] = found.id
          console.log(`✓ Found existing user: ${user.email}`)
        }
      } else if (data.user) {
        userIds[user.email] = data.user.id
        // Create user profile in users table
        const { error: userProfileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: user.email,
          name: user.name,
        })
        if (userProfileError && userProfileError.code !== '23505') {
          console.warn(`Failed to create user profile for ${user.email}:`, userProfileError.message)
        } else {
          console.log(`✓ Created user: ${user.email}`)
        }
      }
    }

    // Create projects
    console.log('\nCreating projects...')
    const projectIds: Record<string, string> = {}

    const projects = [
      {
        owner_id: userIds['john@example.com'],
        name: 'Product Roadmap Q1 2025',
        description: 'Quarterly planning and feature prioritization',
      },
      {
        owner_id: userIds['sarah@example.com'],
        name: 'Engineering Documentation',
        description: 'API docs, architecture guides, and technical specs',
      },
      {
        owner_id: userIds['demo@froncort.com'],
        name: 'Marketing Campaign 2025',
        description: 'Campaign planning, assets, and launch timeline',
      },
      {
        owner_id: userIds['demo@froncort.com'],
        name: 'Website Redesign Project',
        description: 'Complete redesign of company website with modern UI/UX',
      },
      {
        owner_id: userIds['demo@froncort.com'],
        name: 'Mobile App Development',
        description: 'Development and launch of iOS and Android mobile applications',
      },
    ]

    for (const project of projects) {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) {
        console.error(`Failed to create project ${project.name}:`, error)
      } else {
        projectIds[project.name] = data.id
        console.log(`✓ Created project: ${project.name}`)
      }
    }

    // Create pages
    console.log('\nCreating pages...')
    const pages = [
      {
        project_id: projectIds['Product Roadmap Q1 2025'],
        title: 'Getting Started Guide',
        content:
          '<h2>Welcome to Froncort</h2><p>Froncort is a collaborative project management tool that combines the best of Confluence and Jira.</p>',
        created_by: userIds['john@example.com'],
        updated_by: userIds['john@example.com'],
        order: 1,
      },
      {
        project_id: projectIds['Product Roadmap Q1 2025'],
        title: 'Sprint 24 Planning',
        content:
          '<h2>Sprint 24 - Oct 28 to Nov 10</h2><p>This sprint focuses on performance improvements and bug fixes.</p>',
        created_by: userIds['john@example.com'],
        updated_by: userIds['john@example.com'],
        order: 2,
      },
      {
        project_id: projectIds['Engineering Documentation'],
        title: 'API Reference',
        content:
          '<h2>Froncort API Reference</h2><p>Complete API documentation for Froncort integration.</p>',
        created_by: userIds['sarah@example.com'],
        updated_by: userIds['sarah@example.com'],
        order: 1,
      },
      {
        project_id: projectIds['Website Redesign Project'],
        title: 'Design System',
        content:
          '<h2>Design System Overview</h2><p>Comprehensive design system including colors, typography, and component library for the new website.</p>',
        created_by: userIds['demo@froncort.com'],
        updated_by: userIds['demo@froncort.com'],
        order: 1,
      },
      {
        project_id: projectIds['Website Redesign Project'],
        title: 'Development Roadmap',
        content:
          '<h2>Website Development Timeline</h2><p>Phase 1: Design finalization - Week 1-2<br/>Phase 2: Frontend development - Week 3-5<br/>Phase 3: Backend integration - Week 6<br/>Phase 4: Testing and deployment - Week 7-8</p>',
        created_by: userIds['demo@froncort.com'],
        updated_by: userIds['demo@froncort.com'],
        order: 2,
      },
      {
        project_id: projectIds['Mobile App Development'],
        title: 'Requirements & Specifications',
        content:
          '<h2>App Requirements</h2><p>Feature list: User authentication, Push notifications, Offline mode, Real-time sync, Analytics integration.</p>',
        created_by: userIds['demo@froncort.com'],
        updated_by: userIds['demo@froncort.com'],
        order: 1,
      },
      {
        project_id: projectIds['Mobile App Development'],
        title: 'Testing Plan',
        content:
          '<h2>QA & Testing Strategy</h2><p>Unit testing, Integration testing, E2E testing on both iOS and Android devices. Target: 85% code coverage.</p>',
        created_by: userIds['demo@froncort.com'],
        updated_by: userIds['demo@froncort.com'],
        order: 2,
      },
    ]

    for (const page of pages) {
      const { error } = await supabase.from('pages').insert(page)

      if (error) {
        console.error(`Failed to create page ${page.title}:`, error)
      } else {
        console.log(`✓ Created page: ${page.title}`)
      }
    }

    // Create Kanban boards
    console.log('\nCreating kanban boards...')
    const boardIds: Record<string, string> = {}

    for (const [projName, projId] of Object.entries(projectIds)) {
      const { data, error } = await supabase
        .from('kanban_boards')
        .insert({
          project_id: projId,
          name: 'Planning Board',
        })
        .select()
        .single()

      if (error) {
        console.error(`Failed to create board for ${projName}:`, error)
      } else {
        boardIds[projName] = data.id
        console.log(`✓ Created kanban board for: ${projName}`)
      }
    }

    // Create Kanban columns
    console.log('\nCreating kanban columns...')
    for (const boardId of Object.values(boardIds)) {
      const columns = [
        { board_id: boardId, name: 'To Do', order: 0 },
        { board_id: boardId, name: 'In Progress', order: 1 },
        { board_id: boardId, name: 'Done', order: 2 },
      ]

      const { error } = await supabase.from('kanban_columns').insert(columns)

      if (error) {
        console.error('Failed to create columns:', error)
      } else {
        console.log(`✓ Created columns for board: ${boardId}`)
      }
    }

    // Create Kanban cards
    console.log('\nCreating kanban cards...')
    const cardIds: Record<string, string[]> = {}

    // Get all columns for each board
    for (const [projName, boardId] of Object.entries(boardIds)) {
      const { data: columns, error: colError } = await supabase
        .from('kanban_columns')
        .select('id, name')
        .eq('board_id', boardId)

      if (colError || !columns) continue

      const todoColId = columns.find((c) => c.name === 'To Do')?.id
      const inProgressColId = columns.find((c) => c.name === 'In Progress')?.id
      const doneColId = columns.find((c) => c.name === 'Done')?.id

      const demoUserId = userIds['demo@froncort.com']
      const cards = [
        {
          board_id: boardId,
          column_id: todoColId,
          title: 'Define project scope',
          description: 'Outline project requirements and deliverables',
          order: 0,
          created_by: demoUserId,
        },
        {
          board_id: boardId,
          column_id: todoColId,
          title: 'Resource allocation',
          description: 'Assign team members and allocate budget',
          order: 1,
          created_by: demoUserId,
        },
        {
          board_id: boardId,
          column_id: inProgressColId,
          title: 'Setup infrastructure',
          description: 'Configure development and staging environments',
          order: 0,
          created_by: demoUserId,
        },
        {
          board_id: boardId,
          column_id: inProgressColId,
          title: 'Team kickoff meeting',
          description: 'Align team on goals and timeline',
          order: 1,
          created_by: demoUserId,
        },
        {
          board_id: boardId,
          column_id: doneColId,
          title: 'Project planning document',
          description: 'Comprehensive project plan completed',
          order: 0,
          created_by: demoUserId,
        },
      ]

      const { error: cardError } = await supabase
        .from('kanban_cards')
        .insert(cards)

      if (cardError) {
        console.error(`Failed to create cards for ${projName}:`, cardError)
      } else {
        console.log(`✓ Created kanban cards for: ${projName}`)
      }
    }

    // Create activity entries
    console.log('\nCreating activity entries...')
    const activities = [
      {
        project_id: projectIds['Engineering Documentation'],
        user_id: userIds['sarah@example.com'],
        resource_type: 'page',
        resource_id: 'api-ref-001',
        resource_name: 'API Reference',
        action: 'created',
      },
      {
        project_id: projectIds['Website Redesign Project'],
        user_id: userIds['demo@froncort.com'],
        resource_type: 'page',
        resource_id: 'design-sys-001',
        resource_name: 'Design System',
        action: 'created',
      },
      {
        project_id: projectIds['Mobile App Development'],
        user_id: userIds['demo@froncort.com'],
        resource_type: 'page',
        resource_id: 'app-req-001',
        resource_name: 'Requirements & Specifications',
        action: 'created',
      },
    ]

    for (const activity of activities) {
      const { error } = await supabase.from('activities').insert(activity)

      if (error) {
        console.error('Failed to create activity:', error)
      } else {
        console.log(`✓ Created activity: ${activity.resource_name} - ${activity.action}`)
      }
    }

    console.log('\n✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
