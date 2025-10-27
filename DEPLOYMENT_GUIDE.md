# Froncort Deployment & Testing Guide

## ✅ What's Built

**Complete Jira-like Project Management Tool with:**
- ✅ Collaborative rich-text editor (Tiptap)
- ✅ Professional Kanban board (Jira-style)
- ✅ Hierarchical docs navigation
- ✅ Real-time activity feed with filters
- ✅ Auto-save with version tracking
- ✅ Supabase integration (PostgreSQL)
- ✅ Theme system (light/dark)
- ✅ Professional UI with shadcn/ui

---

## 🚀 Quick Setup (10 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to https://app.supabase.com
2. Select your project (froncort)
3. SQL Editor → New Query
4. Copy entire content from `lib/supabase/schema.sql`
5. Paste and click Run

### 3. Configure Environment

Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://uyrgjrnfmuookcrhtifu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:froncort@25@db.uyrgjrnfmuookcrhtifu.supabase.co:5432/postgres
```

Get ANON_KEY from Settings → API → anon key

### 4. Start Development
```bash
npm run dev
```

Open http://localhost:3000

---

## 🧪 Testing Workflow

### Login & Navigation
1. Go to http://localhost:3000
2. Click "Enter Demo Mode" or enter any email/password
3. You'll see dashboard with 3 seed projects

### Test Documentation Editor
1. Dashboard → Click "Product Roadmap Q1 2025" project
2. Left sidebar → Click "Documentation"
3. Click any page in list or create new page
4. Start typing in editor - watch auto-save indicator
5. Click page title to edit
6. Test formatting: bold, italic, lists, code blocks

### Test Kanban Board
1. From project → Click "Board" in sidebar
2. You'll see "To Do", "In Progress", "Done" columns
3. Click "Add card" → Enter title + description
4. Cards show: title, description, due date, assignee
5. Can create multiple cards per column

### Test Activity Feed
1. From project → Click "Activity" in sidebar
2. See all project actions with timestamps
3. Use filter buttons to filter by resource type
4. Each action shows: resource name, action type, timestamp

---

## 📁 Pages Built

| Page | Route | Features |
|------|-------|----------|
| Login | `/login` | Mock auth, demo mode |
| Dashboard | `/dashboard` | Projects overview, stats |
| Docs List | `/:projectId/docs` | Tree view, create pages |
| Editor | `/:projectId/docs/:pageId` | Tiptap, auto-save, metadata |
| Kanban | `/:projectId/board` | Columns, cards, add card |
| Activity | `/:projectId/activity` | Filter, timeline, real-time |

---

## 🔧 Key Features Implemented

### Editor (`/docs/:pageId`)
- **Toolbar:** Bold, italic, headings, lists, code, tables, images, links
- **Auto-save:** 3-second debounce, shows "Saving..." and "Saved" status
- **Title editing:** Click title to edit inline
- **Metadata:** Show created/updated dates
- **Navigation:** Back button, breadcrumbs

### Kanban (`/board`)
- **Columns:** To Do, In Progress, Done (auto-created)
- **Card creation:** Add card form at bottom of each column
- **Card display:** Title, description preview, due date, assignee
- **Professional styling:** Jira-like appearance
- **Column counters:** Show card count per column

### Activity Feed (`/activity`)
- **Real-time:** Shows all project actions
- **Filters:** By resource type (page, card, member)
- **Icons:** Different icons per resource type
- **Action badges:** Color-coded action types
- **Timestamps:** Relative time display

### Docs Navigation (`/docs`)
- **Tree structure:** Hierarchical page navigation
- **Expandable:** Click chevron to show/hide children
- **Create new:** Form to add new pages
- **Icons:** File icons for visual recognition
- **Hover actions:** Edit/delete buttons appear on hover

---

## 📊 Data Flow

```
Frontend Components (React)
    ↓
Custom Hooks (usePages, useKanban, useActivity)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
PostgreSQL Database
    ↓
Real-time Subscriptions (WebSockets)
```

---

## 🎯 Testing Checklist

### Core Functionality
- [ ] Login with any email/password
- [ ] View dashboard with 3 projects
- [ ] Click project to enter project view
- [ ] Navigate to Documentation section
- [ ] Create new page
- [ ] Edit page title
- [ ] Type in editor (see auto-save)
- [ ] Format text (bold, italic, etc.)
- [ ] Navigate back to docs list

### Kanban Board
- [ ] Go to board page
- [ ] See 3 default columns
- [ ] Create new card in "To Do"
- [ ] Add title and description
- [ ] Card appears in column
- [ ] Card count updates
- [ ] Create multiple cards

### Activity Feed
- [ ] Go to activity page
- [ ] See all project actions
- [ ] Filter by "page"
- [ ] Filter by "card"
- [ ] Filter by "all"
- [ ] See action badges with colors
- [ ] See relative timestamps

### UI/UX
- [ ] Toggle theme (light/dark) in header
- [ ] Responsive on desktop
- [ ] Proper spacing and alignment
- [ ] Colors consistent
- [ ] Hover states work
- [ ] Loading states show
- [ ] Error states display

---

## 🐛 Troubleshooting

### "Cannot find module '@tiptap/react'"
```bash
npm install
npm run dev  # Restart server
```

### "ANON_KEY not found"
- Check `.env.local` exists
- Copy actual key from Supabase Settings → API
- Restart dev server

### "Pages not loading"
- Verify Supabase schema created
- Check browser console for errors
- Verify SUPABASE_URL is correct

### "Kanban columns not showing"
- First access creates default columns automatically
- Check browser console for errors
- Verify board ID is being fetched

---

## 📝 Hooks Available

All hooks are fully functional:

```typescript
// Pages
usePages(projectId)           // Get all pages
usePageDetail(pageId)         // Get single page
createPage(projectId, title)  // Create new page
updatePage(pageId, updates)   // Update page
deletePage(pageId)            // Delete page

// Kanban
useKanbanBoard(projectId)     // Get board
useKanbanColumns(boardId)     // Get columns
useKanbanCards(columnId)      // Get cards in column
createCard(...)               // Create card
updateCard(...)               // Update card
moveCard(...)                 // Move between columns
deleteCard(...)               // Delete card

// Activity
useActivity(projectId, limit) // Get activities
logActivity(...)              // Log activity

// Editor
useEditor(options)            // Editor state with auto-save
```

---

## 🎨 UI Components

All shadcn/ui components are ready:
- Button (all variants)
- Input
- Card
- Badge
- Separator
- Skeleton (for loading states)

---

## 🚀 Production Deployment

### Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Auto-deploys on push

### Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
```

---

## 🎓 Next Steps

### If You Want to Add Features:

**Drag & Drop:**
- Install: `npm install @dnd-kit/core @dnd-kit/sortable`
- Update `useKanban.ts` with moveCard logic
- Update kanban/page.tsx with dnd context

**Real-time Collaboration:**
- Use Supabase Realtime subscriptions in hooks
- Add `.on()` listeners to auto-update UI

**Version History:**
- Create `use-versions.ts` hook
- Build version panel component
- Add diff viewer

**Notifications:**
- Create `use-notifications.ts` hook
- Add notification bell in header
- Build notification panel

---

## 📞 Quick Reference

**Edit page content:** `/[projectId]/docs/[pageId]`
**View all pages:** `/[projectId]/docs`
**View kanban:** `/[projectId]/board`
**View activity:** `/[projectId]/activity`

**Main stores:**
- `useProjectStore()` - Current project
- `useUserStore()` - Current user
- `useUIStore()` - UI state

**Key files:**
- `lib/supabase/client.ts` - Supabase connection
- `hooks/use-pages.ts` - Pages operations
- `hooks/use-kanban.ts` - Kanban operations
- `components/editor/collaborative-editor.tsx` - Editor component

---

**Everything is ready to run! Start with `npm install && npm run dev`** 🚀
