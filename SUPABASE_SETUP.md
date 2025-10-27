# Supabase Setup Guide for Froncort

## 🔐 Connection Details

**Project URL:** `https://uyrgjrnfmuookcrhtifu.supabase.co`
**Database:** `postgresql://postgres:froncort@25@db.uyrgjrnfmuookcrhtifu.supabase.co:5432/postgres`

---

## 📋 Setup Steps

### Step 1: Set Up Database Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `froncort`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `lib/supabase/schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

**Expected Result:** All tables created with indexes and RLS policies enabled

✅ Tables created:
- users
- projects
- project_members
- pages
- page_versions
- kanban_boards
- kanban_columns
- kanban_cards
- card_labels
- labels
- activities
- notifications

---

### Step 2: Configure Environment Variables

Your `.env.local` file is already created with:
```
NEXT_PUBLIC_SUPABASE_URL=https://uyrgjrnfmuookcrhtifu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
DATABASE_URL=postgresql://postgres:froncort@25@db.uyrgjrnfmuookcrhtifu.supabase.co:5432/postgres
```

**To find your ANON KEY:**
1. Go to Supabase Dashboard
2. Click **Settings** (bottom left)
3. Select **API**
4. Copy the **anon** public key
5. Update `.env.local` with the actual key

---

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - SSR support
- `@tiptap/react` & extensions - Rich text editor
- `@dnd-kit/*` - Drag & drop
- Radix UI components - Pre-styled components

---

### Step 4: Seed Database with Sample Data

Create `lib/supabase/seed.ts`:

```typescript
import { getSupabaseClient } from './client'

export async function seedDatabase() {
  const supabase = getSupabaseClient()

  // Create users
  const { data: users } = await supabase.from('users').insert([
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    // ... more users
  ]).select()

  // Create projects
  const { data: projects } = await supabase.from('projects').insert([
    {
      id: 'proj-1',
      name: 'Product Roadmap Q1 2025',
      description: 'Quarterly planning',
      owner_id: 'user-1',
    },
    // ... more projects
  ]).select()

  // ... continue with other tables
}
```

---

## 🔄 Real-Time Subscriptions

Supabase provides real-time updates via WebSockets:

```typescript
const supabase = getSupabaseClient()

// Subscribe to page changes
const subscription = supabase
  .from('pages')
  .on('*', (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

---

## 🛡️ Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Users:** Can view their own profile
- **Projects:** Can view projects they're members of
- **Pages:** Can view pages in their projects
- **Cards:** Can view cards in their projects
- **Activities:** Can view activities in their projects
- **Notifications:** Can view their own notifications

✅ This is automatically enforced at the database level!

---

## 📊 Database Schema Overview

```
┌─────────────────────────────────────────┐
│              USERS                      │
│  id, email, name, avatar, timestamps    │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼─────────┐  ┌──────────────────┐
│   PROJECTS      │  │ PROJECT_MEMBERS  │
│                 │  │ (role: owner/...) │
│ id, name, desc  │  │                  │
└────────┬────────┘  └──────────────────┘
         │
    ┌────┴────────────────────────────────┐
    │                                     │
┌───▼─────────────┐          ┌───────────▼────────┐
│     PAGES       │          │  KANBAN_BOARDS     │
│ (hierarchical)  │          │                    │
└────────┬────────┘          └─────────┬──────────┘
         │                             │
    ┌────▼────────────┐           ┌────▼──────────────┐
    │ PAGE_VERSIONS   │           │ KANBAN_COLUMNS    │
    │                 │           │                   │
    └─────────────────┘           └────┬──────────────┘
                                       │
                                   ┌───▼─────────┐
                                   │ KANBAN_CARDS│
                                   └───┬─────────┘
                                       │
                                   ┌───▼─────────┐
                                   │ CARD_LABELS │
                                   └─────────────┘

┌──────────────────────────────────────────────┐
│  ACTIVITIES & NOTIFICATIONS                  │
│  (for real-time updates and notifications)   │
└──────────────────────────────────────────────┘
```

---

## 🧪 Testing the Connection

### Test 1: Simple Query

```typescript
import { getSupabaseClient } from '@/lib/supabase/client'

async function testConnection() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('users').select('*').limit(1)
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful:', data)
  }
}
```

### Test 2: Insert Data

```typescript
async function testInsert() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('users').insert([
    {
      email: 'test@example.com',
      name: 'Test User',
    }
  ]).select()
  
  console.log(error ? 'Insert failed' : 'Insert successful')
}
```

---

## 🔄 Real-Time Collaboration Setup

### Presence (Live Cursors)

```typescript
// Track user presence in page
const channel = supabase.channel(`page:${pageId}`)

channel.on('presence', { event: 'sync' }, () => {
  const presence = channel.presenceState()
  console.log('Active users:', presence)
}).subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: userId,
      cursor_position: cursorPos,
    })
  }
})
```

### Broadcast (Real-time Edits)

```typescript
// Send edit event
channel.send({
  type: 'broadcast',
  event: 'page_updated',
  payload: { content, updatedBy: userId }
})

// Listen for edits
channel.on('broadcast', { event: 'page_updated' }, (payload) => {
  console.log('Page updated by:', payload.payload.updatedBy)
})
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection refused"
**Solution:** Check internet connection and Supabase status page

### Issue 2: "ANON_KEY not found"
**Solution:** Verify `.env.local` has the correct key from Supabase Settings

### Issue 3: "RLS policy violation"
**Solution:** Ensure user is added to project_members for that project

### Issue 4: "Table does not exist"
**Solution:** Re-run the SQL schema from `lib/supabase/schema.sql`

---

## 📚 Useful Supabase Commands

```bash
# Link project (if using CLI)
supabase link --project-ref uyrgjrnfmuookcrhtifu

# Pull database schema
supabase db pull

# Push migrations
supabase db push

# View logs
supabase logs --project-ref uyrgjrnfmuookcrhtifu
```

---

## 🚀 Next Steps

1. ✅ Copy `.env.local` with connection string
2. ⏳ Run schema.sql in Supabase SQL Editor
3. ⏳ Install dependencies: `npm install`
4. ⏳ Seed database with sample data
5. ⏳ Test connection in app
6. ⏳ Implement collaborative features

---

## 📖 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)

---

Good luck! 🚀
