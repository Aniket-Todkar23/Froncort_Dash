# Fixing Activities RLS Policies

The "Failed to fetch activities" error occurs because of overly restrictive Row Level Security (RLS) policies in Supabase.

## Quick Fix

Go to your Supabase dashboard and run the SQL script in `lib/supabase/fix-rls-policies-v2.sql`:

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `lib/supabase/fix-rls-policies-v2.sql` (NOT the v1)
4. Paste and run the script

## What Changed

### Users Table Policy
**Old:** Only users could see their own profile
**New:** Any authenticated user can see all user names (needed for activity feed)

### Activities Table Policy
**Old:** Only checked if user is a member of the project (caused recursion)
**New:** Simplified to directly check project_members table without infinite loops

### Activities Insert Policy
**New:** Added policy to allow users to create activities in their projects

## Why This Was Needed

The original policies caused:
1. **Infinite recursion error** - When checking if user was in a project via nested queries
2. **Can't read user names** - The RLS policy on users was too restrictive

The v2 fix:
- Simplifies the activities policy to avoid recursive lookups
- Allows reading all user names (still protected by auth requirement)
- Uses Supabase's built-in RLS filtering to protect data automatically

## Testing

After applying the fix:
1. Refresh the dashboard page
2. Activities should now load with user names displayed
3. Check browser console for any remaining errors

If still getting errors, ensure:
- User is authenticated
- User has been added to at least one project
- Supabase RLS policies were applied successfully
