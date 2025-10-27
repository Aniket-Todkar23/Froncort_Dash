# Collaborative Editing & Task Management Setup Guide

This guide walks you through setting up real-time collaborative editing with cursor tracking and task management in Froncort.

## Prerequisites

- Supabase project with Realtime enabled
- Two separate browser profiles or windows
- Project with at least 2 members

## Step 1: Enable Supabase Realtime

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** > **Realtime** (or **Database**)
3. Ensure **Realtime** is **Enabled**
4. Make sure realtime is enabled for the tables you'll use

## Step 2: Apply RLS Policies (if not already done)

Run the SQL from `lib/supabase/fix-rls-policies-v2.sql` in your Supabase SQL editor to fix any RLS issues.

## Step 3: Create Test Users

### Option A: Via Supabase Dashboard (Recommended for Testing)

1. Go to **Authentication** > **Users**
2. Click **Create new user**
3. Create User 1:
   - Email: `alice@example.com`
   - Password: `Alice123!@#`
4. Create User 2:
   - Email: `bob@example.com`
   - Password: `Bob123!@#`

### Option B: Via SQL

1. Get the UUIDs from the auth.users you just created:
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. Run the script `lib/supabase/create-test-users.sql` with your actual UUIDs:
   - Replace `alice-uuid-here` with Alice's actual UUID
   - Replace `bob-uuid-here` with Bob's actual UUID
   - Replace `project-uuid-here` with your project's UUID

## Step 4: Set Up Project Membership

Both users need to be members of the same project:

1. Sign in as User 1 (Alice)
2. Create a new project (or use an existing one)
3. Go to Project Settings > Members
4. Add User 2 (Bob) as a member with "Editor" role

## Step 5: Test Collaborative Editing

### Window Setup
```
Browser Tab 1 (Alice)          Browser Tab 2 (Bob)
─────────────────────────      ────────────────────
Login: alice@example.com       Login: bob@example.com
Navigate to same page          Navigate to same page
```

### Test Real-Time Cursors
1. In Alice's tab, click in the editor
2. Position cursor at a specific location
3. **In Bob's tab**: You should see a colored cursor labeled "Alice Johnson" at that position
4. Move Alice's cursor - Bob should see it update in real-time

### Test Content Synchronization
1. In Alice's tab, type: "Hello from Alice"
2. **In Bob's tab**: Content should appear automatically
3. In Bob's tab, continue typing: " and Bob"
4. **In Alice's tab**: Bob's additions should appear without refreshing

### Test Simultaneous Editing
1. In Alice's tab: Position cursor at position 5, type "X"
2. Simultaneously in Bob's tab: Position cursor at position 15, type "Y"
3. Both edits should merge correctly without conflicts

## Step 6: Test Task Management

### Create Task
1. Navigate to **Board** view
2. In the first column, click **Add Task**
3. Enter title: "Test Task"
4. **In other user's tab**: Task should appear automatically

### Edit Task
1. Click on a task to edit it
2. Change the title or description
3. **In other user's tab**: Changes should sync in real-time

### Move Task
1. Drag a task to another column
2. **In other user's tab**: Task position should update immediately

### Delete Task
1. Click delete on a task
2. **In other user's tab**: Task disappears

## Features Implemented

### ✅ Real-Time Collaboration
- **Cursor Tracking**: See where other users are typing with color-coded cursors
- **Presence Indicators**: "Editing with: [User Name]" shows active editors
- **Live Content Sync**: Changes appear instantly across all clients
- **User Colors**: Each user gets a unique color for easy identification

### ✅ Task Management
- **Create Tasks**: Add new cards to kanban columns
- **Edit Tasks**: Modify task title and description
- **Move Tasks**: Drag between columns with automatic sync
- **Delete Tasks**: Remove completed or unwanted tasks
- **Database Sync**: All changes persist to Supabase

### ✅ Activity Tracking
- Page creation logged
- Page edits tracked
- Task changes recorded
- User attribution for all actions

## File Structure

```
hooks/
├── use-realtime-collaboration.ts  # Real-time sync with Supabase
├── use-tasks.ts                   # Task CRUD operations
└── use-activity.ts                # Activity logging

components/editor/
├── remote-cursors.tsx             # Cursor and presence UI
└── collaborative-editor.tsx       # Main editor with toolbar

app/(dashboard)/[projectId]/docs/[pageId]/page.tsx
├── Integrated real-time collaboration
└── Activity logging for all changes
```

## Troubleshooting

### Cursors Not Appearing
1. Check Supabase Realtime is enabled
2. Verify both users are in the same project
3. Check browser console for errors
4. Make sure page IDs are identical for both users

### Content Not Syncing
1. Check RLS policies are applied correctly
2. Ensure both users have "Editor" role in project
3. Check network tab - realtime messages should appear
4. Try refreshing the page

### Task Updates Not Showing
1. Verify kanban_cards table permissions
2. Check if users are project members
3. Look at browser console for Supabase errors
4. Try clearing browser cache

## Performance Notes

- Real-time updates are sent via Supabase Realtime WebSocket
- Cursor positions update multiple times per second
- Content changes debounce for 3 seconds before saving to DB
- Up to 100 concurrent users per channel supported by default

## Security Considerations

⚠️ **Development Only**: These test credentials are for development
- Change passwords before production
- Implement proper authentication
- Use environment variables for secrets
- Enable all RLS policies
- Audit user permissions regularly

## Next Steps

1. Test with multiple simultaneous users
2. Monitor Supabase Realtime usage
3. Consider implementing Operational Transformation (OT) or CRDT for advanced conflict resolution
4. Add user presence avatars
5. Implement task assignment features
6. Add comment/thread collaboration

## Advanced: Implementing CRDT (Optional)

For more advanced conflict resolution, consider:

1. **Yjs**: Shared types for collaborative editing
2. **Automerge**: JSON-like data structure with automatic merging
3. **Quill Delta**: Operational transformation for text

These handle complex simultaneous edits better than simple last-write-wins.

## Support

If you encounter issues:

1. Check browser console for errors
2. Review Supabase logs
3. Verify RLS policies are correct
4. Test with fresh browser session
5. Check network connectivity
