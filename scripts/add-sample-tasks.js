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

// Enhanced task templates with more details
const SAMPLE_TASKS = {
  'Product Roadmap Q1 2025': [
    {
      column: 'To Do',
      tasks: [
        { title: 'Finalize Q1 roadmap', description: 'Complete product roadmap planning for Q1 2025', priority: 'High' },
        { title: 'Conduct market research', description: 'Research competitive landscape and market trends', priority: 'High' },
        { title: 'Create user personas', description: 'Develop detailed user personas based on research', priority: 'Medium' },
        { title: 'Define success metrics', description: 'Establish KPIs and success criteria for Q1', priority: 'Medium' },
      ]
    },
    {
      column: 'In Progress',
      tasks: [
        { title: 'Design new landing page', description: 'Redesign landing page with new brand guidelines', priority: 'High' },
        { title: 'Plan sprint schedule', description: 'Create sprint planning calendar for Q1', priority: 'Medium' },
        { title: 'Gather stakeholder feedback', description: 'Collect feedback from key stakeholders', priority: 'Medium' },
      ]
    },
    {
      column: 'Review',
      tasks: [
        { title: 'Review market analysis report', description: 'Peer review of market analysis findings', priority: 'Medium' },
        { title: 'Approve budget allocation', description: 'Get executive approval for Q1 budget', priority: 'High' },
      ]
    },
    {
      column: 'Done',
      tasks: [
        { title: 'Executive briefing', description: 'Present Q1 plans to executives', priority: 'High' },
        { title: 'Team kickoff meeting', description: 'Launch Q1 with full team alignment', priority: 'High' },
      ]
    }
  ],
  'Engineering Documentation': [
    {
      column: 'To Do',
      tasks: [
        { title: 'Document API endpoints', description: 'Create comprehensive API endpoint documentation', priority: 'High' },
        { title: 'Write deployment guide', description: 'Document deployment procedures and best practices', priority: 'High' },
        { title: 'Create troubleshooting guide', description: 'Document common issues and solutions', priority: 'Medium' },
      ]
    },
    {
      column: 'In Progress',
      tasks: [
        { title: 'Write architecture overview', description: 'Document system architecture and components', priority: 'High' },
        { title: 'Create database schema docs', description: 'Document database tables and relationships', priority: 'High' },
        { title: 'Setup documentation site', description: 'Configure and deploy documentation website', priority: 'Medium' },
      ]
    },
    {
      column: 'Review',
      tasks: [
        { title: 'Review API documentation', description: 'Peer review API docs for accuracy', priority: 'High' },
        { title: 'Check code examples', description: 'Verify all code examples work correctly', priority: 'Medium' },
      ]
    },
    {
      column: 'Done',
      tasks: [
        { title: 'Publish getting started guide', description: 'Release quick start guide for developers', priority: 'High' },
        { title: 'Update README', description: 'Update project README with latest info', priority: 'Medium' },
      ]
    }
  ],
  'Website Redesign': [
    {
      column: 'To Do',
      tasks: [
        { title: 'Create wireframes', description: 'Design wireframes for all key pages', priority: 'High' },
        { title: 'Finalize color palette', description: 'Define final color scheme and typography', priority: 'High' },
        { title: 'Plan responsive breakpoints', description: 'Define responsive design breakpoints', priority: 'Medium' },
      ]
    },
    {
      column: 'In Progress',
      tasks: [
        { title: 'Build homepage design', description: 'Create high-fidelity homepage mockups', priority: 'High' },
        { title: 'Design product pages', description: 'Design product listing and detail pages', priority: 'High' },
        { title: 'Create component library', description: 'Build reusable UI component library', priority: 'Medium' },
      ]
    },
    {
      column: 'Review',
      tasks: [
        { title: 'Get design approval', description: 'Obtain stakeholder approval on designs', priority: 'High' },
        { title: 'A/B test designs', description: 'Conduct user testing on design variations', priority: 'Medium' },
      ]
    },
    {
      column: 'Done',
      tasks: [
        { title: 'Handoff to development', description: 'Transfer designs to development team', priority: 'High' },
        { title: 'Create style guide', description: 'Document design system and guidelines', priority: 'Medium' },
      ]
    }
  ],
  'Mobile App Development': [
    {
      column: 'To Do',
      tasks: [
        { title: 'Setup development environment', description: 'Configure iOS and Android dev environments', priority: 'High' },
        { title: 'Create data models', description: 'Define data structures and models', priority: 'High' },
        { title: 'Plan API integration', description: 'Design API integration strategy', priority: 'Medium' },
      ]
    },
    {
      column: 'In Progress',
      tasks: [
        { title: 'Implement authentication', description: 'Build user authentication system', priority: 'High' },
        { title: 'Create main UI screens', description: 'Develop main app screens and navigation', priority: 'High' },
        { title: 'Setup push notifications', description: 'Configure push notification service', priority: 'Medium' },
      ]
    },
    {
      column: 'Review',
      tasks: [
        { title: 'Internal testing', description: 'Conduct internal QA testing', priority: 'High' },
        { title: 'Performance optimization', description: 'Optimize app performance and battery usage', priority: 'Medium' },
      ]
    },
    {
      column: 'Done',
      tasks: [
        { title: 'Beta release', description: 'Launch beta version to testers', priority: 'High' },
        { title: 'Submit to app stores', description: 'Submit to iOS App Store and Google Play', priority: 'High' },
      ]
    }
  ]
}

async function addSampleTasks() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║     📝 ADDING SAMPLE TASKS TO BOARDS 📝       ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    // Get all boards with their projects
    const { data: boards, error: boardsError } = await supabase
      .from('kanban_boards')
      .select('id, project_id, name')

    if (boardsError) throw boardsError
    if (!boards || boards.length === 0) {
      console.error('❌ No kanban boards found')
      process.exit(1)
    }

    // Get all projects to find their names
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, owner_id')

    if (projectsError) throw projectsError

    // Get all users for assignment
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')

    if (usersError) throw usersError
    const userIds = users?.map(u => u.id) || []

    let totalTasksAdded = 0

    // For each board, add sample tasks
    for (const board of boards) {
      const project = projects.find(p => p.id === board.project_id)
      const projectName = project?.name
      const taskConfig = SAMPLE_TASKS[projectName]

      if (!taskConfig) {
        console.warn(`⚠️  No sample tasks defined for ${projectName}`)
        continue
      }

      console.log(`📌 Adding tasks to "${projectName}"...`)

      // Get columns for this board
      const { data: columns, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('id, name, order')
        .eq('board_id', board.id)
        .order('order')

      if (columnsError) throw columnsError

      // Add tasks to each column
      for (const columnConfig of taskConfig) {
        const column = columns.find(c => c.name === columnConfig.column)
        if (!column) {
          console.warn(`⚠️  Column "${columnConfig.column}" not found`)
          continue
        }

        for (let i = 0; i < columnConfig.tasks.length; i++) {
          const taskTemplate = columnConfig.tasks[i]
          const assigneeId = userIds[i % userIds.length]

          const { data: card, error: cardError } = await supabase
            .from('kanban_cards')
            .insert({
              board_id: board.id,
              column_id: column.id,
              title: taskTemplate.title,
              description: taskTemplate.description,
              order: i,
              created_by: project.owner_id,
              assignee_id: assigneeId,
              due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single()

          if (cardError) throw cardError

          // Add label based on priority
          const { data: labels } = await supabase
            .from('labels')
            .select('id')
            .eq('project_id', board.project_id)
            .eq('name', taskTemplate.priority === 'High' ? 'Bug' : 'Feature')
            .limit(1)

          if (labels && labels.length > 0) {
            await supabase.from('card_labels').insert({
              card_id: card.id,
              label_id: labels[0].id,
            })
          }

          totalTasksAdded++
        }

        console.log(`  ✓ Added ${columnConfig.tasks.length} tasks to "${columnConfig.column}"`)
      }

      console.log('')
    }

    console.log('╔════════════════════════════════════════════════╗')
    console.log('║      ✅ SAMPLE TASKS ADDED SUCCESSFULLY ✅     ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log(`\n📊 Total tasks added: ${totalTasksAdded}\n`)
  } catch (error) {
    console.error('❌ Failed to add sample tasks:', error.message)
    process.exit(1)
  }
}

addSampleTasks()
