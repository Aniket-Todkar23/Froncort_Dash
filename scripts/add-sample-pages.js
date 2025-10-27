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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SAMPLE_PAGES = {
  'Product Roadmap Q1 2025': [
    {
      title: 'Q1 2025 Roadmap Overview',
      content: `<h1>Q1 2025 Product Roadmap</h1>
<p>This document outlines our strategic product initiatives for Q1 2025, including feature releases, performance improvements, and customer experience enhancements.</p>
<h2>Key Initiatives</h2>
<ul>
<li><strong>Mobile App Launch</strong> - Native iOS and Android applications with offline support</li>
<li><strong>Performance Optimization</strong> - 50% reduction in page load times</li>
<li><strong>Security Hardening</strong> - SOC 2 compliance and advanced threat detection</li>
<li><strong>AI Integration</strong> - Smart suggestions and automated task categorization</li>
</ul>
<h2>Timeline</h2>
<p><strong>Week 1-4:</strong> Foundation work, infrastructure setup</p>
<p><strong>Week 5-8:</strong> Feature development and integration</p>
<p><strong>Week 9-12:</strong> Testing, optimization, and launch preparation</p>`,
      order: 0,
    },
    {
      title: 'Feature Specifications',
      content: `<h1>Q1 Feature Specifications</h1>
<h2>Mobile Application</h2>
<p>Cross-platform native applications for iOS and Android with the following features:</p>
<ul>
<li>Real-time collaboration support</li>
<li>Offline mode with automatic sync</li>
<li>Push notifications</li>
<li>Biometric authentication</li>
</ul>
<h2>Performance Improvements</h2>
<ul>
<li>Database query optimization</li>
<li>Frontend code splitting</li>
<li>Image compression and CDN delivery</li>
<li>Caching strategies implementation</li>
</ul>
<h2>Security Enhancements</h2>
<ul>
<li>End-to-end encryption for sensitive data</li>
<li>Advanced access controls</li>
<li>Audit logging</li>
<li>Compliance reporting tools</li>
</ul>`,
      order: 1,
    },
    {
      title: 'Success Metrics',
      content: `<h1>Q1 2025 Success Metrics</h1>
<table border="1" cellpadding="8">
<tr><th>Metric</th><th>Target</th><th>Current</th></tr>
<tr><td>Page Load Time</td><td>&lt;1.5s</td><td>3.2s</td></tr>
<tr><td>Mobile App Downloads</td><td>50K</td><td>0</td></tr>
<tr><td>User Satisfaction Score</td><td>&gt;4.5/5</td><td>4.2/5</td></tr>
<tr><td>Security Compliance</td><td>SOC 2 Type II</td><td>In Progress</td></tr>
<tr><td>Feature Adoption</td><td>&gt;70%</td><td>N/A</td></tr>
</table>`,
      order: 2,
    },
  ],
  'Engineering Documentation': [
    {
      title: 'System Architecture',
      content: `<h1>System Architecture Overview</h1>
<h2>Architecture Diagram</h2>
<p>Our system follows a modern microservices architecture with the following components:</p>
<ul>
<li><strong>Frontend:</strong> Next.js with React, Tailwind CSS</li>
<li><strong>Backend API:</strong> Node.js with Express</li>
<li><strong>Database:</strong> PostgreSQL with Supabase</li>
<li><strong>Real-time:</strong> WebSocket with Socket.io</li>
<li><strong>Storage:</strong> AWS S3 for file storage</li>
<li><strong>Cache:</strong> Redis for session and data caching</li>
</ul>
<h2>Data Flow</h2>
<p>1. Client sends request to API Gateway</p>
<p>2. API Gateway routes to appropriate microservice</p>
<p>3. Microservice processes and queries database</p>
<p>4. Response cached and returned to client</p>
<h2>Security</h2>
<p>All communications use HTTPS/TLS 1.2+. JWT tokens handle authentication. Role-based access control (RBAC) manages authorization.</p>`,
      order: 0,
    },
    {
      title: 'API Documentation',
      content: `<h1>REST API Documentation</h1>
<h2>Authentication</h2>
<p>All API endpoints require authentication via JWT token in the Authorization header:</p>
<pre>Authorization: Bearer {token}</pre>
<h2>Base URL</h2>
<pre>https://api.froncort.com/v1</pre>
<h2>Common Endpoints</h2>
<h3>Projects</h3>
<ul>
<li><strong>GET /projects</strong> - List all projects</li>
<li><strong>POST /projects</strong> - Create new project</li>
<li><strong>GET /projects/:id</strong> - Get project details</li>
<li><strong>PUT /projects/:id</strong> - Update project</li>
<li><strong>DELETE /projects/:id</strong> - Delete project</li>
</ul>
<h3>Tasks</h3>
<ul>
<li><strong>GET /tasks</strong> - List tasks</li>
<li><strong>POST /tasks</strong> - Create task</li>
<li><strong>PUT /tasks/:id</strong> - Update task</li>
<li><strong>DELETE /tasks/:id</strong> - Delete task</li>
</ul>
<h2>Rate Limiting</h2>
<p>100 requests per minute per API key</p>`,
      order: 1,
    },
    {
      title: 'Database Schema',
      content: `<h1>Database Schema</h1>
<h2>Core Tables</h2>
<h3>users</h3>
<pre>
id: UUID (PK)
email: VARCHAR(255) UNIQUE
name: VARCHAR(255)
avatar: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
</pre>
<h3>projects</h3>
<pre>
id: UUID (PK)
name: VARCHAR(255)
description: TEXT
owner_id: UUID (FK → users)
created_at: TIMESTAMP
updated_at: TIMESTAMP
</pre>
<h3>kanban_cards</h3>
<pre>
id: UUID (PK)
board_id: UUID (FK → kanban_boards)
column_id: UUID (FK → kanban_columns)
title: VARCHAR(255)
description: TEXT
created_by: UUID (FK → users)
assignee_id: UUID (FK → users)
due_date: TIMESTAMP
created_at: TIMESTAMP
updated_at: TIMESTAMP
</pre>
<h3>pages</h3>
<pre>
id: UUID (PK)
project_id: UUID (FK → projects)
title: VARCHAR(255)
content: TEXT (HTML)
created_by: UUID (FK → users)
updated_by: UUID (FK → users)
created_at: TIMESTAMP
updated_at: TIMESTAMP
</pre>`,
      order: 2,
    },
  ],
  'Website Redesign': [
    {
      title: 'Design System',
      content: `<h1>Design System Guidelines</h1>
<h2>Color Palette</h2>
<ul>
<li><strong>Primary:</strong> #0066FF (Blue)</li>
<li><strong>Secondary:</strong> #00D4FF (Cyan)</li>
<li><strong>Success:</strong> #00B341 (Green)</li>
<li><strong>Warning:</strong> #FFA500 (Orange)</li>
<li><strong>Error:</strong> #FF3333 (Red)</li>
<li><strong>Neutral:</strong> #666666 (Gray)</li>
</ul>
<h2>Typography</h2>
<ul>
<li><strong>Primary Font:</strong> Inter</li>
<li><strong>Heading Sizes:</strong> H1: 32px, H2: 24px, H3: 20px</li>
<li><strong>Body Text:</strong> 16px regular, 14px small</li>
<li><strong>Line Height:</strong> 1.6 for body, 1.2 for headings</li>
</ul>
<h2>Spacing</h2>
<p>Use 8px base unit. Multiples: 8px, 16px, 24px, 32px, 48px, 64px</p>
<h2>Components</h2>
<ul>
<li>Buttons with 4 states: default, hover, active, disabled</li>
<li>Cards with consistent shadows and borders</li>
<li>Modals with backdrop blur</li>
<li>Forms with validation states</li>
</ul>`,
      order: 0,
    },
    {
      title: 'Wireframes & Mockups',
      content: `<h1>Website Wireframes</h1>
<h2>Homepage Structure</h2>
<ul>
<li>Hero section with call-to-action</li>
<li>Feature showcase grid (3 columns)</li>
<li>Customer testimonials carousel</li>
<li>Pricing table</li>
<li>Footer with links and social media</li>
</ul>
<h2>Product Page</h2>
<ul>
<li>Product image gallery</li>
<li>Detailed specifications</li>
<li>Reviews and ratings section</li>
<li>Related products section</li>
<li>Add to cart functionality</li>
</ul>
<h2>Dashboard</h2>
<ul>
<li>Sidebar navigation</li>
<li>Header with user menu</li>
<li>Main content area with data visualization</li>
<li>Right sidebar with filters</li>
</ul>`,
      order: 1,
    },
    {
      title: 'Responsive Design',
      content: `<h1>Responsive Design Guidelines</h1>
<h2>Breakpoints</h2>
<ul>
<li><strong>Mobile:</strong> &lt;768px</li>
<li><strong>Tablet:</strong> 768px - 1024px</li>
<li><strong>Desktop:</strong> &gt;1024px</li>
</ul>
<h2>Mobile Considerations</h2>
<ul>
<li>Touch-friendly buttons (min 44x44px)</li>
<li>Readable font sizes (min 16px)</li>
<li>Single column layout</li>
<li>Simplified navigation (hamburger menu)</li>
</ul>
<h2>Performance</h2>
<ul>
<li>Image optimization for different screen sizes</li>
<li>Lazy loading for images below fold</li>
<li>Minimal JavaScript bundle for mobile</li>
</ul>`,
      order: 2,
    },
  ],
  'Mobile App Development': [
    {
      title: 'Development Setup',
      content: `<h1>Mobile App Development Setup</h1>
<h2>Requirements</h2>
<ul>
<li>macOS 12+ or Windows 10+</li>
<li>Xcode 14+ (for iOS)</li>
<li>Android Studio 2022.1+ (for Android)</li>
<li>Node.js 16+</li>
<li>React Native 0.72+</li>
</ul>
<h2>Installation Steps</h2>
<ol>
<li>Clone the repository</li>
<li>Install dependencies: npm install</li>
<li>Setup iOS: cd ios && pod install</li>
<li>Setup Android: Configure ANDROID_HOME</li>
<li>Start dev server: npm start</li>
</ol>
<h2>Testing Devices</h2>
<ul>
<li>iOS Simulator (included with Xcode)</li>
<li>Android Emulator (included with Android Studio)</li>
<li>Physical devices via USB</li>
</ul>`,
      order: 0,
    },
    {
      title: 'App Features',
      content: `<h1>Mobile App Features</h1>
<h2>Core Features</h2>
<ul>
<li><strong>Authentication:</strong> Biometric and password-based login</li>
<li><strong>Projects:</strong> Browse and manage projects</li>
<li><strong>Tasks:</strong> View and update tasks on the go</li>
<li><strong>Collaboration:</strong> Real-time comments and reactions</li>
<li><strong>Notifications:</strong> Push notifications for updates</li>
</ul>
<h2>Offline Capabilities</h2>
<ul>
<li>Download projects for offline access</li>
<li>Queue changes made offline</li>
<li>Auto-sync when connection restored</li>
<li>Conflict resolution for concurrent edits</li>
</ul>
<h2>Performance</h2>
<ul>
<li>App size: &lt;100MB</li>
<li>Launch time: &lt;3 seconds</li>
<li>Memory usage: &lt;200MB during normal use</li>
</ul>`,
      order: 1,
    },
    {
      title: 'Testing Plan',
      content: `<h1>Mobile App Testing Strategy</h1>
<h2>Unit Tests</h2>
<p>Test individual functions and components. Target: 80% coverage using Jest</p>
<h2>Integration Tests</h2>
<p>Test component interactions and API communication using Detox</p>
<h2>E2E Tests</h2>
<p>Full user journey testing on both iOS and Android</p>
<h2>Performance Testing</h2>
<ul>
<li>Load testing with 1000+ concurrent users</li>
<li>Battery impact analysis</li>
<li>Memory leak detection</li>
<li>Network latency simulation</li>
</ul>
<h2>QA Checklist</h2>
<ul>
<li>Functionality on different screen sizes</li>
<li>Dark mode support</li>
<li>Accessibility compliance (WCAG 2.1)</li>
<li>Localization for 5+ languages</li>
</ul>`,
      order: 2,
    },
  ],
}

async function addSamplePages() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║    📚 ADDING SAMPLE DOCUMENTATION PAGES 📚    ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')

    if (projectsError) throw projectsError
    if (!projects || projects.length === 0) {
      console.error('❌ No projects found')
      process.exit(1)
    }

    // Get all users for created_by and updated_by
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')

    if (usersError) throw usersError
    const userIds = users?.map(u => u.id) || []

    if (userIds.length === 0) {
      console.error('❌ No users found')
      process.exit(1)
    }

    let totalPagesAdded = 0

    // Add pages for each project
    for (const project of projects) {
      const pageConfigs = SAMPLE_PAGES[project.name]

      if (!pageConfigs) {
        console.warn(`⚠️  No sample pages defined for "${project.name}"`)
        continue
      }

      console.log(`📌 Adding pages to "${project.name}"...`)

      for (const pageConfig of pageConfigs) {
        const creatorId = userIds[Math.floor(Math.random() * userIds.length)]

        const { data: page, error: pageError } = await supabase
          .from('pages')
          .insert({
            project_id: project.id,
            title: pageConfig.title,
            content: pageConfig.content,
            order: pageConfig.order,
            created_by: creatorId,
            updated_by: creatorId,
          })
          .select()
          .single()

        if (pageError) {
          console.error(`✗ Error adding page "${pageConfig.title}":`, pageError.message)
          continue
        }

        totalPagesAdded++
        console.log(`  ✓ Added: "${pageConfig.title}"`)
      }

      console.log('')
    }

    console.log('╔════════════════════════════════════════════════╗')
    console.log('║      ✅ PAGES ADDED SUCCESSFULLY ✅            ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log(`\n📚 Total pages added: ${totalPagesAdded}\n`)
  } catch (error) {
    console.error('❌ Failed to add sample pages:', error.message)
    process.exit(1)
  }
}

addSamplePages()
