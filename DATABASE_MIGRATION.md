# Database Migration Guide

This guide explains how to migrate from mock data to Supabase database and keep everything synchronized.

## Setup Steps

### 1. Verify Supabase Setup
- Ensure you have a Supabase project created
- Verify `.env.local` has:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

### 2. Deploy Database Schema
- Go to Supabase SQL Editor
- Run the SQL schema from SUPABASE_SETUP.md
- This creates all tables with RLS policies

### 3. Seed Initial Data
```bash
npm run seed
```

This creates:
- Test users (john@example.com, sarah@example.com, demo@froncort.com)
- Sample projects
- Sample pages, kanban boards, and activities

### 4. Run the Application
```bash
npm run dev
```

### 5. Login with Test Credentials
- **Email**: `demo@froncort.com`
- **Password**: `demo1234`

Or use:
- **Email**: `john@example.com` / `sarah@example.com`
- **Password**: `john1234` / `sarah1234`

## Data Synchronization

### Projects
- **Source**: `hooks/useProjectsDb.ts`
- **Real-time**: Yes, uses Supabase subscriptions
- **Create/Update/Delete**: Via Supabase API

### Pages (Documentation)
- **Source**: `lib/supabase/hooks/usePages.ts`
- **Real-time**: Yes, subscriptions enabled
- **Create/Update/Delete**: Via Supabase API
- **Local Cache**: Shared pages store for offline access

### Kanban Board
- **Source**: `hooks/use-kanban.ts` (already implemented)
- **Real-time**: Yes
- **Drag-and-Drop**: Updates Supabase immediately

### Activity Feed
- **Source**: `hooks/use-activity.ts` (already implemented)
- **Logging**: Every action creates activity records
- **Real-time**: Yes, subscriptions enabled

### Project Settings
- **Update via**: Supabase API
- **Sync**: Real-time updates across browser tabs

## Key Files

### Hooks
- `hooks/useProjectsDb.ts` - Fetch projects with real-time sync
- `lib/supabase/hooks/usePages.ts` - Page operations
- `hooks/use-kanban.ts` - Kanban board operations
- `hooks/use-activity.ts` - Activity logging

### Auth
- `lib/supabase/auth.ts` - Authentication functions

### Database Scripts
- `scripts/seed-database.ts` - Initial data population

## Real-Time Features

All major operations trigger real-time updates:

1. **Projects Update** - Updates across all tabs
2. **Pages Create/Edit** - Immediate reflection in documentation tab
3. **Kanban Card Moves** - Live updates for all users
4. **Activities** - Feed updates in real-time

## Troubleshooting

### Users Not Loading
- Check Supabase RLS policies allow user access
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct

### Projects Showing as Empty
- Run `npm run seed` to populate test data
- Check user ID matches in database

### Real-time Not Working
- Verify Supabase real-time is enabled (Dashboard > Database > Replication)
- Check browser console for connection errors

## Testing the Integration

1. Create a new project in-app
2. Verify it appears in Supabase projects table
3. Create a new page/documentation entry
4. Check it syncs to database
5. Open app in another tab - updates should appear automatically
6. Drag cards on Kanban board - verify changes persist

## Next Steps

- Implement collaborative editing with Tiptap real-time features
- Add user invitations and project sharing
- Set up webhooks for external integrations
- Implement backup and export functionality
