-- This script fixes RLS policies without causing infinite recursion

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users in projects" ON users;

-- Create simple policy for users - allow viewing any user (activities need this)
CREATE POLICY "Users can view all user names" ON users FOR SELECT
  USING (true);

-- Drop and recreate activities policy (simpler version)
DROP POLICY IF EXISTS "Users can view activities in their projects" ON activities;

CREATE POLICY "Users can view activities in their projects" ON activities FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert activities
DROP POLICY IF EXISTS "Users can insert activities in their projects" ON activities;

CREATE POLICY "Users can insert activities in their projects" ON activities FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ) AND
    user_id = auth.uid()
  );
