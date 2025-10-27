# Froncort Pages Reference Guide

## 📍 URL Structure & Features

### Authentication Pages

#### `/login` ✅ Implemented
**Path:** `app/(auth)/login/page.tsx`

**Features:**
- Email/password form
- Demo mode button
- Link to signup
- Mock authentication
- Toast notifications
- Redirect to dashboard on success

**User Story:** User arrives at Froncort, logs in with any credentials or clicks demo mode

---

#### `/signup` ⏳ TODO
**Path:** `app/(auth)/signup/page.tsx`

**Features:**
- Registration form (email, password, name)
- Validation
- Terms & conditions checkbox
- Link to login
- Redirect to onboarding

---

### Dashboard Pages

#### `/dashboard` ✅ Partially Implemented
**Path:** `app/(dashboard)/page.tsx`

**Layout:**
- Header with greeting
- Three stats cards (projects, tasks, team)
- Projects grid with 3 seed projects
- Recent activity section

**Features:**
- Display all user's projects
- Quick statistics
- Recent activities
- Create project button
- Project cards show: name, description, member count
- Click card to go to project

**Components Used:**
- Card, CardHeader, CardTitle, CardContent
- Button
- Stats from seed data

---

#### `/dashboard/[projectId]` ⏳ TODO (Project Overview)
**Path:** `app/(dashboard)/[projectId]/page.tsx`

**Layout:**
- Project name and description
- Quick links section
- Team members with roles
- Project statistics

**Features:**
- Display project details
- Show team members
- Quick stats (pages, cards, activity)
- Links to docs and board
- Edit project (Admin+)

---

### Documentation Pages

#### `/dashboard/[projectId]/docs` ⏳ TODO (Docs List)
**Path:** `app/(dashboard)/[projectId]/docs/page.tsx`

**Layout:**
- Left: Collapsible page tree/sidebar
- Center: Page list or tree view
- Top: "+ New Page" button

**Features:**
- Hierarchical page structure
- Create/rename/delete pages (with permissions)
- Search pages
- Sort by date/title
- Click page to view/edit

**Components to Create:**
- `PageTree` - Tree view of pages
- `PageListItem` - Individual page in list

---

#### `/dashboard/[projectId]/docs/[pageId]` ⏳ TODO (Editor) - PRIORITY
**Path:** `app/(dashboard)/[projectId]/docs/[pageId]/page.tsx`

**Layout:**
- Left (20%): Page tree sidebar
- Center (60%): Rich text editor with toolbar
- Right (20%): Version history + metadata

**Features:**
- **Editor:**
  - Rich text formatting (Bold, Italic, Underline)
  - Headings (H1, H2, H3)
  - Lists (bullet, numbered, checklist)
  - Tables, code blocks, links, images
  - @mentions with autocomplete
  - Markdown shortcuts
  
- **Toolbar:**
  - Formatting buttons in groups
  - Text color picker
  - Emoji picker
  
- **Auto-save:**
  - "Saving..." indicator
  - "Saved at X:XX" timestamp
  - Debounced save (3s after stop typing)
  
- **Metadata (Right panel):**
  - Created by: [Name]
  - Last edited: [Time]
  - Contributors: [Avatars]
  
- **Version History:**
  - Timeline of versions
  - Click to view diff
  - Restore button

**Permissions:**
- Viewer: Read-only, disabled edit
- Editor+: Full editing
- Admin+: Can delete page

**Components to Create:**
- `CollaborativeEditor` - Main editor with Tiptap
- `EditorToolbar` - Formatting buttons
- `VersionHistoryPanel` - Right sidebar
- `VersionDiffView` - Side-by-side comparison

---

### Kanban Board Pages

#### `/dashboard/[projectId]/board` ⏳ TODO (Kanban) - PRIORITY
**Path:** `app/(dashboard)/[projectId]/board/page.tsx`

**Layout:**
- Top: Filters and view options
- Center: Horizontal scrollable kanban board

**Columns (Default):**
1. To Do
2. In Progress
3. Done

**Features:**
- **Board:**
  - Drag-and-drop cards between columns
  - Smooth animations
  - Visual drop targets
  
- **Cards:**
  - Title (bold)
  - Description preview (first 2 lines)
  - Labels (colored tags)
  - Assignee avatar
  - Due date (with color: red overdue, yellow soon, gray future)
  - Comment count (optional)
  
- **Card Click:**
  - Open detail panel (slide-over from right)
  - Can edit inline
  - Or click card to open detail panel
  
- **Column Header:**
  - Column name (editable for Admin+)
  - Card count
  - Add column button (Admin+)
  
- **Filters:**
  - By assignee (multi-select)
  - By label
  - By due date
  - Search by title
  
- **Permissions:**
  - Viewer: View only, no drag
  - Editor+: Create, move, edit cards
  - Admin+: Configure columns

**Components to Create:**
- `Board` - Main container
- `Column` - Droppable column
- `Card` - Draggable card
- `CardDetailPanel` - Slide-over details
- `CardDetailForm` - Edit fields

---

### Activity Feed Pages

#### `/dashboard/[projectId]/activity` ⏳ TODO (Activity Feed)
**Path:** `app/(dashboard)/[projectId]/activity/page.tsx`

**Layout:**
- Top: Filter controls
- Center: Timeline of activities

**Activity Types:**
- "John edited page 'API Docs'"
- "Sarah moved card 'Bug Fix' to Done"
- "Mike mentioned you in 'Sprint Planning'"
- "Emily joined the project"

**Each Activity Shows:**
- User avatar
- User name
- Action description
- Link to resource
- Relative timestamp ("5 mins ago")
- Optional preview of change

**Filters:**
- By user (dropdown/multi-select)
- By action type (created, edited, moved, mentioned, joined)
- By resource type (page, card, member)
- By date range (calendar picker)
- Clear all button

**Real-time:**
- New activities appear at top
- Unread indicator (bold or highlight)
- Auto-refresh every 5 seconds (or via WebSocket)
- "No activities" state

**Pagination:**
- Infinite scroll
- Load more button (optional)

**Components to Create:**
- `ActivityFeed` - Main feed
- `ActivityItem` - Individual activity
- `ActivityFilters` - Filter controls
- `ActivityEmptyState` - No activities message

---

### Settings Pages

#### `/dashboard/[projectId]/settings` ⏳ TODO (Project Settings)
**Path:** `app/(dashboard)/[projectId]/settings/page.tsx`

**Access:** Admin+ only (show 403 for Viewer/Editor)

**Layout:**
- Left: Tab navigation
- Right: Tab content

**Tabs:**

##### 1. General
- Project name (text input)
- Description (textarea)
- Avatar upload
- Archive project (red button)
- Delete project (red button with confirmation)

##### 2. Members
- Members list:
  - Avatar | Name | Email | Role dropdown | Remove button
  
- Invite section:
  - Email input
  - Role selector (Owner, Admin, Editor, Viewer)
  - Send invite button
  - Shows mock "Invite sent" toast

##### 3. Permissions
- Permission matrix table:
  - Rows: Roles (Owner, Admin, Editor, Viewer)
  - Columns: Actions (Delete, Manage Members, Edit Pages, View Activity, etc.)
  - Cells: Checkmarks or X

##### 4. Board (Optional)
- Configure kanban columns:
  - List of columns with drag to reorder
  - Edit column name
  - Delete column (with confirmation)
  - Add column button
  
- Default labels:
  - Bug, Feature, Urgent, Design, Backend, Frontend, Docs
  - Color picker for each
  - Add/remove labels

**Components to Create:**
- `SettingsTabs` - Tab navigation
- `GeneralSettings` - Project info
- `MembersSection` - Team management
- `PermissionsMatrix` - Role/action matrix
- `BoardSettings` - Column configuration

---

### User Settings Pages

#### `/settings` ⏳ TODO (User Profile)
**Path:** `app/settings/page.tsx` (if shared across projects)
Or within dashboard

**Features:**
- Profile information:
  - Avatar upload
  - Display name (editable)
  - Email (display)
  - Bio/role (optional)
  
- Notification preferences:
  - Email notifications toggle
  - In-app notifications toggle
  - Mention notifications
  - Assignment notifications
  - Daily/weekly digest
  
- Appearance:
  - Theme selector (Light/Dark/System)
  - Language preference
  
- Account:
  - Change password
  - Two-factor authentication (optional)
  - Sign out all devices
  - Delete account (with confirmation)

---

## 🏗️ Data Flow Diagram

```
┌─────────────┐
│   Login     │ ──→ Demo Mode or Email/Password
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD LAYOUT                        │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌────────────────────────────────────────┐ │
│ │   SIDEBAR    │ │       HEADER + PAGE CONTENT            │ │
│ │              │ │ ┌────────────────────────────────────┐ │ │
│ │ • Projects   │ │ │  /dashboard (Projects Grid)        │ │ │
│ │   - Overview │ │ │  /docs (Page List)                 │ │ │
│ │   - Docs     │ │ │  /docs/[id] (Editor) ⭐ PRIORITY  │ │ │
│ │   - Board    │ │ │  /board (Kanban) ⭐ PRIORITY      │ │ │
│ │   - Activity │ │ │  /activity (Feed)                  │ │ │
│ │   - Settings │ │ │  /settings (Config)                │ │ │
│ │              │ │ └────────────────────────────────────┘ │ │
│ └──────────────┘ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
RootLayout
├── ThemeProvider
└── DashboardLayout (conditional)
    ├── Sidebar
    │   ├── Logo
    │   ├── ProjectList
    │   │   └── ProjectItem (expandable)
    │   │       ├── Overview link
    │   │       ├── Docs link
    │   │       ├── Board link
    │   │       ├── Activity link
    │   │       └── Settings link
    │   └── Footer
    ├── DashboardHeader
    │   ├── Search
    │   ├── Notifications
    │   ├── Theme toggle
    │   └── User menu
    └── MainContent
        ├── /dashboard page
        │   ├── WelcomeSection
        │   ├── StatsCards
        │   ├── ProjectsGrid
        │   └── ActivityFeed
        │
        ├── /docs page
        │   ├── PageTree
        │   └── PageList
        │
        ├── /docs/[id] page ⭐
        │   ├── PageTree (sidebar)
        │   ├── Editor with Toolbar
        │   └── VersionHistoryPanel
        │
        ├── /board page ⭐
        │   ├── Filters
        │   └── Board
        │       ├── Column
        │       │   └── Card (draggable)
        │       └── Column...
        │
        ├── /activity page
        │   ├── ActivityFilters
        │   └── ActivityFeed
        │       └── ActivityItem
        │
        └── /settings page
            ├── SettingsTabs
            ├── GeneralTab
            ├── MembersTab
            ├── PermissionsTab
            └── BoardTab
```

---

## 🚀 Implementation Priority

### Phase 2 (Weeks 1-2): Core Features
1. ⭐ Editor page (`/docs/[pageId]`) - 40% of work
2. ⭐ Kanban board (`/board`) - 30% of work
3. Project overview (`/[projectId]`) - 10%
4. Docs listing (`/docs`) - 10%
5. Version history panel - 10%

### Phase 3 (Week 3): Secondary Features
1. Activity feed (`/activity`) - 30%
2. Project settings (`/settings`) - 40%
3. Permissions enforcement - 30%

### Phase 4 (Week 4): Polish
1. Error boundaries
2. Loading states
3. Empty states
4. Responsive design
5. Accessibility
6. Performance

---

## 🎯 Key User Flows to Test

### Flow 1: Write Documentation
```
Login → Dashboard → Click Project 
→ Click Docs → Click Page 
→ Edit Content → Auto-save works
→ See version history → Light/dark mode works
```

### Flow 2: Manage Tasks
```
Login → Dashboard → Click Project 
→ Click Board → Drag card to new column
→ Click card → Edit inline → Save
→ See updated activity feed
```

### Flow 3: Check Permissions
```
Login as Viewer → Board shows (no drag)
→ Docs show (read-only buttons)
→ Settings hidden → Logout
→ Login as Admin → All features available
```

---

Good luck building Froncort! 🚀
