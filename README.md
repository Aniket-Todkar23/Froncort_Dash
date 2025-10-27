# Froncort - Collaborative Project Management Tool

A full-stack project management application combining Confluence-style collaborative documentation with Jira-style Kanban boards.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm run start
```

## 📋 Features

### ✅ Implemented

#### 1. **Authentication System**
- Login/Signup pages with mock authentication
- Demo mode for quick access
- User profile management
- Role-based access control (Owner, Admin, Editor, Viewer)

#### 2. **Dashboard & Navigation**
- Central hub with project overview
- Quick statistics (projects, tasks, team members)
- Recent activity feed
- Responsive sidebar navigation
- Project switcher with expandable menu

#### 3. **Project Management**
- Multiple projects support
- Project-specific settings
- Isolated pages and boards per project
- Shared team members across projects

#### 4. **Documentation Editor** (In Progress)
- Rich-text editing with Tiptap
- Real-time collaboration support
- Markdown shortcuts
- @mentions for team members
- Version history tracking
- Auto-save functionality
- Hierarchical page organization

#### 5. **Kanban Board** (Planned)
- Drag-and-drop task management
- Configurable columns (To Do, In Progress, Done)
- Card details and inline editing
- Labels and assignees
- Due date tracking
- Link cards to documentation

#### 6. **Activity Feed** (Planned)
- Real-time activity tracking
- User action logging
- Filterable by user, resource type, date
- Recent updates view

#### 7. **Version Control** (Planned)
- Automatic version creation
- Version comparison with diffs
- Restore previous versions
- Author and timestamp tracking

#### 8. **Notifications** (Planned)
- Toast notifications for @mentions
- Assignment notifications
- Notification queue/summary
- Real-time updates

#### 9. **Theme System**
- Light/Dark mode toggle
- System theme detection
- Persistent theme preference
- shadcn/ui component library

## 📁 Project Structure

```
froncort/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [projectId]/
│   │       ├── page.tsx (project overview)
│   │       ├── docs/ (documentation editor)
│   │       ├── board/ (kanban board)
│   │       ├── activity/ (activity feed)
│   │       └── settings/ (project settings)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/ (Rich-text editor components)
│   ├── kanban/ (Kanban board components)
│   ├── activity/ (Activity feed components)
│   ├── navigation/ (Sidebar, header, breadcrumbs)
│   ├── ui/ (shadcn/ui components)
│   ├── permissions/ (RBAC components)
│   └── providers/ (Theme provider)
├── hooks/
│   ├── use-permissions.ts
│   ├── use-editor.ts (Editor state - TODO)
│   ├── use-versions.ts (Version management - TODO)
│   └── [other hooks]
├── lib/
│   ├── stores/ (Zustand stores)
│   │   ├── user-store.ts
│   │   ├── project-store.ts
│   │   └── ui-store.ts
│   ├── types/ (TypeScript interfaces)
│   ├── utils/ (Utilities)
│   ├── constants/ (Constants and seed data)
│   └── supabase/ (Supabase client - TODO)
└── public/
```

## 🏗️ State Management

### Zustand Stores

**User Store** (`lib/stores/user-store.ts`)
- Current user
- Authentication status
- User role

**Project Store** (`lib/stores/project-store.ts`)
- Projects list
- Current project
- Project operations (add, update, delete)

**UI Store** (`lib/stores/ui-store.ts`)
- Theme preference
- Sidebar state
- Active tab
- Selected card
- Version history visibility

## 🎨 Design System

Built with **shadcn/ui** and **Tailwind CSS**

### Colors
- **Primary**: Blue-600 (CTAs, links)
- **Secondary**: Gray-500 (text, borders)
- **Success**: Green-500
- **Warning**: Amber-500
- **Error**: Red-500

### Components
- Button (multiple variants)
- Input
- Card
- (More coming: Dialog, Sheet, Avatar, Badge, etc.)

## 🔐 Permissions & Roles

| Role   | Edit | Delete | Manage Members | View Activity | View Versions | Assign Cards |
|--------|------|--------|----------------|---------------|---------------|--------------|
| Owner  | ✓    | ✓      | ✓              | ✓             | ✓             | ✓            |
| Admin  | ✓    | ✓      | ✓              | ✓             | ✓             | ✓            |
| Editor | ✓    | ✗      | ✗              | ✓             | ✓             | ✓            |
| Viewer | ✗    | ✗      | ✗              | ✓             | ✓             | ✗            |

## 📊 Seed Data

The application comes with pre-loaded seed data:

### Projects
1. **Product Roadmap Q1 2025** - Quarterly planning
2. **Engineering Documentation** - API docs and technical specs
3. **Marketing Campaign 2025** - Campaign planning and assets

### Users
- John Doe (Owner)
- Sarah Smith (Admin)
- Mike Johnson (Editor)
- Emily Davis (Viewer)

### Pages
- Getting Started Guide
- Sprint 24 Planning
- API Reference

### Kanban Cards
- Design mockups (To Do)
- API implementation (In Progress)
- Documentation (Done)
- Mobile navigation bug (To Do)

## 🚧 Implementation Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Next.js 14 & TypeScript
- [x] Tailwind CSS & shadcn/ui
- [x] Theme system with next-themes
- [x] Authentication (mock)
- [x] State management (Zustand)

### Phase 2: Core Features (In Progress)
- [ ] Collaborative Editor (Tiptap integration)
- [ ] Real-time presence and cursors
- [ ] Version control system
- [ ] Kanban board with DnD
- [ ] Activity feed

### Phase 3: Secondary Features
- [ ] Project settings & member management
- [ ] Notification system
- [ ] Advanced search
- [ ] API documentation

### Phase 4: Polish & Deployment
- [ ] Seed data enhancement
- [ ] Error boundaries
- [ ] Loading states
- [ ] Responsive design optimization
- [ ] Testing
- [ ] Vercel deployment

## 💾 Database Schema (Planned)

Using **Supabase** PostgreSQL:

```sql
-- Users
CREATE TABLE users (...)

-- Projects
CREATE TABLE projects (...)

-- Project Members
CREATE TABLE project_members (...)

-- Pages
CREATE TABLE pages (...)

-- Page Versions
CREATE TABLE page_versions (...)

-- Kanban Boards
CREATE TABLE kanban_boards (...)

-- Kanban Columns
CREATE TABLE kanban_columns (...)

-- Kanban Cards
CREATE TABLE kanban_cards (...)

-- Labels
CREATE TABLE labels (...)

-- Activity
CREATE TABLE activities (...)

-- Notifications
CREATE TABLE notifications (...)
```

## 🔗 Real-time Features (Planned)

### Supabase Integration
- Presence tracking (live cursors)
- Real-time updates
- Change subscriptions
- Activity logging

### WebSocket Events
- Document edits
- Card movements
- Member joins
- @mentions

## 📝 Testing

```bash
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
npm run build      # Production build
```

## 🚀 Deployment

Optimized for **Vercel**:

```bash
# Automatic deployment from git
# Environment variables configured in Vercel dashboard
```

## 📦 Dependencies

### Core
- Next.js 14
- React 18
- TypeScript 5

### State & Data
- Zustand (state management)
- Sonner (toast notifications)
- date-fns (date formatting)

### UI Components
- shadcn/ui
- Radix UI primitives
- Tailwind CSS
- Lucide React (icons)

### Editor (Planned)
- Tiptap (rich-text editor)
- Y.js (collaborative editing)

### Drag & Drop (Planned)
- dnd-kit

## 🎯 Key Features to Implement Next

1. **Collaborative Editor**
   - [ ] Tiptap integration
   - [ ] Rich text formatting toolbar
   - [ ] Markdown shortcuts
   - [ ] @mentions dropdown
   - [ ] Real-time collaboration with Yjs
   - [ ] Live cursor indicators
   - [ ] Conflict resolution

2. **Kanban Board**
   - [ ] dnd-kit setup
   - [ ] Smooth drag animations
   - [ ] Inline card editing
   - [ ] Card detail panel
   - [ ] Drag over animations

3. **Version Control**
   - [ ] Auto-versioning
   - [ ] Version list UI
   - [ ] Diff viewer
   - [ ] Restore functionality

4. **Activity Feed**
   - [ ] Real-time updates
   - [ ] Filter controls
   - [ ] Infinite scroll
   - [ ] Activity formatting

## 📞 Support

For questions or issues, please create an issue in the repository.

## 📄 License

MIT
