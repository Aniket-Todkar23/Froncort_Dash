# Froncort Implementation Guide

## 🎯 Current Status

✅ **Phase 1 Complete:**
- Next.js 14 with TypeScript setup
- Tailwind CSS & shadcn/ui configuration
- Theme system (light/dark mode)
- State management (Zustand stores)
- Mock authentication system
- Dashboard layout with navigation
- Seed data loaded

🚧 **Next Steps:** Implement collaborative editor and Kanban board

---

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd "C:\Users\aptod\OneDrive\Desktop\Froncort"
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Login

- **Email:** Any email (e.g., `test@example.com`)
- **Password:** Any password
- OR click **"Enter Demo Mode"** for instant access

### 4. Explore the App

1. **Dashboard** - View projects and recent activity
2. **Sidebar** - Click project name to expand menu
3. **Theme Toggle** - Click moon icon in header for dark mode

---

## 🎨 Page Structure Overview

### Implemented Pages

```
/
├── /login (Login page)
├── /signup (Signup page - create as copy of login)
└── /dashboard
    ├── / (Projects overview)
    ├── /[projectId]/ (Project home)
    ├── /[projectId]/docs (Documentation list)
    ├── /[projectId]/docs/[pageId] (Editor - PRIORITY)
    ├── /[projectId]/board (Kanban board - PRIORITY)
    ├── /[projectId]/activity (Activity feed)
    └── /[projectId]/settings (Project settings)
```

---

## 🔧 Next Priority: Collaborative Editor

### Files to Create

**1. `components/editor/collaborative-editor.tsx`**
```typescript
// Main editor component with Tiptap
// Features:
// - Rich text editing
// - Toolbar with formatting options
// - Real-time collaboration placeholder
// - Auto-save indicators
```

**2. `components/editor/editor-toolbar.tsx`**
```typescript
// Formatting toolbar with buttons for:
// - Bold, Italic, Underline
// - Headings (H1, H2, H3)
// - Lists (bullet, numbered, checklist)
// - Links, Images, Code blocks, Tables
// - @mentions
```

**3. `hooks/use-editor.ts`**
```typescript
// Editor state management
// - Current content
// - Save status
// - Undo/Redo
// - Presence tracking
```

**4. `app/(dashboard)/[projectId]/docs/page.tsx`**
```typescript
// Docs listing page with page tree navigation
// - Hierarchical page display
// - Create new page button
// - Sort/filter options
```

**5. `app/(dashboard)/[projectId]/docs/[pageId]/page.tsx`**
```typescript
// Main editor page
// - Left: Page tree sidebar
// - Center: Editor with toolbar
// - Right: Version history panel & metadata
```

### Implementation Steps for Editor

1. **Install Tiptap dependencies:**
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-mention @tiptap/extension-link @tiptap/extension-image
   ```

2. **Create `hooks/use-editor.ts`:**
   - State: content, isSaving, lastSaved
   - Methods: updateContent(), saveContent(), undo(), redo()
   - Auto-save with debounce (3s)

3. **Create `components/editor/collaborative-editor.tsx`:**
   - Initialize Tiptap editor
   - Add extensions (Link, Image, Mention)
   - Handle onChange events
   - Show save indicator

4. **Create `components/editor/editor-toolbar.tsx`:**
   - Button group for formatting
   - Dividers between sections
   - Tooltip on hover

5. **Create page listing at `/[projectId]/docs`:**
   - Tree view of pages
   - Add/delete/rename options

6. **Create editor page at `/[projectId]/docs/[pageId]`:**
   - Load page from store/API
   - Render editor with toolbar
   - Show version history panel

---

## 🏗️ Next Priority: Kanban Board

### Files to Create

**1. `components/kanban/board.tsx`**
```typescript
// Main board container
// - Columns layout (horizontal scrollable)
// - Add column button
```

**2. `components/kanban/column.tsx`**
```typescript
// Droppable column component
// - Column header with count
// - List of cards
// - Add card button
```

**3. `components/kanban/card.tsx`**
```typescript
// Draggable card component
// - Title, description preview
// - Labels, assignee, due date
// - Click to open detail panel
```

**4. `components/kanban/card-detail-panel.tsx`**
```typescript
// Side panel for card details
// - Title (editable)
// - Description (rich text)
// - Labels selector
// - Assignee dropdown
// - Due date picker
// - Link to page
// - Delete button
```

**5. `hooks/use-kanban.ts`**
```typescript
// Board state management
// - Cards by column
// - Move card between columns
// - Update card properties
```

**6. `app/(dashboard)/[projectId]/board/page.tsx`**
```typescript
// Kanban board page
// - Render board with columns and cards
// - Handle drag-and-drop
// - Inline editing
```

### Implementation Steps for Kanban

1. **Install dnd-kit dependencies:**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Create `hooks/use-kanban.ts`:**
   - Store cards by column ID
   - Move card method
   - Update card method

3. **Create `components/kanban/board.tsx`:**
   - DndContext wrapper
   - Loop through columns
   - Render Column components

4. **Create `components/kanban/column.tsx`:**
   - Droppable container
   - Map cards in column
   - Visual drop target

5. **Create `components/kanban/card.tsx`:**
   - Draggable item
   - Card display with labels/assignee
   - Click handler for detail panel

6. **Create `components/kanban/card-detail-panel.tsx`:**
   - Sheet component from shadcn/ui
   - Form fields for card properties
   - Save/delete handlers

7. **Create board page:**
   - Load board data
   - Render Board component
   - Handle DnD events

---

## 📝 Version Control System

### Files to Create

**1. `hooks/use-versions.ts`**
```typescript
// Version management
// - Get versions list
// - Get version content
// - Restore version
// - Compare versions
```

**2. `components/versions/version-history-panel.tsx`**
```typescript
// Right sidebar showing version list
// - Timeline of versions
// - Click to preview
// - Restore button
```

**3. `components/versions/version-diff-view.tsx`**
```typescript
// Side-by-side diff view
// - Old version vs current
// - Highlighting changes
// - Green for additions, red for deletions
```

### Implementation

1. Create versions panel in editor right sidebar
2. Store versions in Zustand when page is saved
3. Implement diff comparison logic
4. Show side-by-side diff viewer

---

## 🔔 Activity Feed

### Files to Create

**1. `hooks/use-activity.ts`**
```typescript
// Activity tracking
// - Get activities for project
// - Filter by user/type/date
// - Real-time updates
```

**2. `components/activity/activity-feed.tsx`**
```typescript
// Main feed component
// - List of activities
// - Infinite scroll
// - Real-time updates
```

**3. `components/activity/activity-item.tsx`**
```typescript
// Single activity entry
// - User avatar & name
// - Action description
// - Resource link
// - Relative timestamp
```

**4. `components/activity/activity-filters.tsx`**
```typescript
// Filter controls
// - By user dropdown
// - By action type
// - Date range picker
```

**5. `app/(dashboard)/[projectId]/activity/page.tsx`**
```typescript
// Activity page
// - Filters at top
// - Activity feed
// - Infinite scroll
```

---

## ⚙️ Project Settings

### Files to Create

**1. `app/(dashboard)/[projectId]/settings/page.tsx`**
```typescript
// Settings page with tabs:
// - General (name, description, avatar)
// - Members (list, invite, roles)
// - Permissions (matrix view)
// - Board columns (add/edit/delete)
```

**2. `components/settings/members-section.tsx`**
```typescript
// Team members management
// - List with roles
// - Invite form
// - Role selector
// - Remove button
```

**3. `components/settings/permissions-matrix.tsx`**
```typescript
// Visual permission matrix
// - Roles vs Actions
// - Checkmarks for allowed
```

---

## 🎓 Implementation Checklist

### Phase 2: Core Features (Editor & Board)

- [ ] Create Tiptap editor component
- [ ] Add editor toolbar with buttons
- [ ] Create page listing view
- [ ] Create editor page with layout
- [ ] Add auto-save functionality
- [ ] Create Kanban board component
- [ ] Add dnd-kit drag-and-drop
- [ ] Create card detail panel
- [ ] Add inline card editing
- [ ] Create version history UI
- [ ] Implement diff viewer

### Phase 3: Secondary Features

- [ ] Create activity feed
- [ ] Add activity filters
- [ ] Build project settings
- [ ] Implement member management
- [ ] Add permissions matrix display

### Phase 4: Polish

- [ ] Add error boundaries
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Start production build
npm run start
```

---

## 📚 File Templates

### Page Template

```typescript
// app/(dashboard)/[projectId]/section/page.tsx
'use client'

import { useProjectStore } from '@/lib/stores/project-store'
import { usePermissions } from '@/hooks/use-permissions'

export default function SectionPage({ params }: { params: { projectId: string } }) {
  const { currentProject } = useProjectStore()
  const permissions = usePermissions()

  if (!currentProject) {
    return <div>Project not found</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Section Title</h1>
      
      {/* Content here */}
    </div>
  )
}
```

### Component Template

```typescript
// components/section/component.tsx
'use client'

import { cn } from '@/lib/utils/cn'
import React from 'react'

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props here
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {/* Content here */}
    </div>
  )
}
```

### Hook Template

```typescript
// hooks/use-feature.ts
import { useCallback, useState } from 'react'

export function useFeature() {
  const [state, setState] = useState<Type | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const action = useCallback(async () => {
    setLoading(true)
    try {
      // Logic here
      setState(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  return { state, loading, error, action }
}
```

---

## 🔗 API Routes (Future)

When implementing backend:

```
/api/projects
  - GET (list)
  - POST (create)
  
/api/projects/[id]
  - GET (detail)
  - PATCH (update)
  - DELETE

/api/projects/[id]/pages
  - GET (list)
  - POST (create)

/api/projects/[id]/pages/[pageId]
  - GET (detail)
  - PATCH (update)
  - DELETE

/api/projects/[id]/boards
  - GET
  - PATCH

/api/projects/[id]/activity
  - GET (with filters)
```

---

## 📖 Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tiptap](https://tiptap.dev)
- [dnd-kit](https://docs.dndkit.com)
- [date-fns](https://date-fns.org)

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### TypeScript Errors
```bash
npm run typecheck
```

---

## 💡 Pro Tips

1. **Use shadcn/ui components** - They're pre-styled and accessible
2. **Keep hooks focused** - One concern per hook
3. **Use Zustand stores** - For global state like projects, user, UI
4. **Add error boundaries** - Wrap sections that can fail
5. **TypeScript strict mode** - Catch errors early
6. **Test permissions early** - Different roles should see different UIs

---

Good luck with the implementation! 🚀
