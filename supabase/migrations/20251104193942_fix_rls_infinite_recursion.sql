-- Fix infinite recursion in RLS policies
-- Drop the problematic policy on project_members
DROP POLICY IF EXISTS "Users can view members of projects they are in" ON project_members;

-- Disable RLS on project_members since we're handling auth in the API layer
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
