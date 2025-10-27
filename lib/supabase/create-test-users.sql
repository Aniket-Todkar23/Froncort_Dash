-- This SQL script creates test users for collaborative editing testing
-- Run this in your Supabase SQL editor after creating the auth users

-- First, create the users in the users table
-- These should match the auth.users you create in Supabase Auth

-- You need to create auth users first via Supabase Dashboard > Authentication > Users
-- Then use the generated UIDs to insert into the users table

-- Example UUIDs - replace with actual values from your auth.users
-- To find the actual UUIDs: SELECT id, email FROM auth.users;

INSERT INTO users (id, email, name, avatar, created_at, updated_at) VALUES
  ('alice-uuid-here', 'alice@example.com', 'Alice Johnson', null, NOW(), NOW()),
  ('bob-uuid-here', 'bob@example.com', 'Bob Smith', null, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add users to a project as members
-- Replace 'project-uuid-here' with an actual project ID
INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES
  ('project-uuid-here', 'alice-uuid-here', 'editor', NOW()),
  ('project-uuid-here', 'bob-uuid-here', 'editor', NOW())
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Verify users were created
SELECT 'Users created:' as status;
SELECT id, email, name FROM users WHERE email IN ('alice@example.com', 'bob@example.com');

-- Verify project members
SELECT 'Project members added:' as status;
SELECT pm.id, pm.user_id, u.name, pm.role FROM project_members pm
JOIN users u ON pm.user_id = u.id
WHERE u.email IN ('alice@example.com', 'bob@example.com');
