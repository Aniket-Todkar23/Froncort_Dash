-- This script fixes RLS policies to allow proper access to activities and users

-- Drop existing restrictive policy on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create new policy that allows users to view all users in shared projects
CREATE POLICY "Users can view other users in projects" ON users FOR SELECT
  USING (
    auth.uid()::text = id::text OR
    auth.uid()::text IN (
      SELECT pm1.user_id::text FROM project_members pm1
      INNER JOIN project_members pm2 ON pm1.project_id = pm2.project_id
      WHERE pm2.user_id::text = users.id::text
    )
  );

-- Drop existing policy on activities table
DROP POLICY IF EXISTS "Users can view activities in their projects" ON activities;

-- Create comprehensive policy for activities
CREATE POLICY "Users can view activities in their projects" ON activities FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT pm.user_id::text FROM project_members pm
      WHERE pm.project_id = activities.project_id
    ) OR
    auth.uid()::text IN (
      SELECT owner_id::text FROM projects WHERE id = activities.project_id
    )
  );

-- Allow users to insert activities in their projects
CREATE POLICY "Users can insert activities in their projects" ON activities FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT pm.user_id::text FROM project_members pm
      WHERE pm.project_id = project_id
    ) OR
    auth.uid()::text IN (
      SELECT owner_id::text FROM projects WHERE id = project_id
    )
  );

-- Optional: Grant public access for reading user names (useful for activity feeds)
-- This allows unauthenticated queries to fetch user info if needed
-- DROP POLICY IF EXISTS "Public can view user names" ON users;
-- CREATE POLICY "Public can view user names" ON users FOR SELECT
--   USING (true);
