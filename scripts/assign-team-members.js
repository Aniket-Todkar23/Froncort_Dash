const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function assignTeamMembers() {
  console.log('Starting team member assignment...\n')

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')

    if (usersError) throw usersError
    if (users.length < 2) {
      console.error('Need at least 2 users to assign to projects')
      process.exit(1)
    }

    console.log(`Found ${users.length} users:`)
    users.forEach((u, i) => console.log(`  ${i + 1}. ${u.name}`))
    console.log()

    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')

    if (projectsError) throw projectsError
    console.log(`Found ${projects.length} projects:`)
    projects.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`))
    console.log()

    // Assign members to projects (2-3 per project)
    let assignmentCount = 0
    for (const project of projects) {
      // Randomly select 2-3 users for this project
      const membersCount = Math.floor(Math.random() * 2) + 2 // 2 or 3
      const selectedUsers = users
        .sort(() => Math.random() - 0.5)
        .slice(0, membersCount)

      for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i]
        const role = i === 0 ? 'admin' : 'member' // First user is admin

        const { error } = await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            user_id: user.id,
            role,
            assigned_by: users[0].id,
          })

        if (error) {
          if (error.message.includes('duplicate key')) {
            console.log(
              `  ⚠️  ${user.name} already assigned to ${project.name}`
            )
          } else {
            console.error(`  ❌ Error assigning ${user.name}: ${error.message}`)
          }
        } else {
          console.log(
            `  ✅ ${user.name} assigned to ${project.name} as ${role}`
          )
          assignmentCount++
        }
      }
    }

    console.log(`\n✅ Successfully assigned ${assignmentCount} team members!\n`)

    // Show assignment summary
    const { data: assignments } = await supabase
      .from('project_members')
      .select('project:projects(name), user:users(name), role')

    console.log('Assignment Summary:')
    for (const assignment of assignments) {
      console.log(
        `  • ${assignment.user.name} - ${assignment.project.name} (${assignment.role})`
      )
    }

    console.log('\n🎉 Team members assigned successfully!')
  } catch (error) {
    console.error('Error assigning team members:', error)
    process.exit(1)
  }
}

assignTeamMembers()
