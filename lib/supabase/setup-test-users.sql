-- ============================================================================
-- FRONCORT TEST USERS SETUP SCRIPT
-- Run this entire script in your Supabase SQL Editor
-- No manual UUID replacement needed - it does it automatically!
-- ============================================================================

-- Step 1: Create auth users if they don't exist
-- (Note: You still need to create these in Supabase Auth UI first)
-- Go to: Authentication > Users > Create new user
-- User 1: alice@example.com / Alice123!@#
-- User 2: bob@example.com / Bob123!@#

-- Step 2: Add users to users table with auto UUID detection
DO $$
DECLARE
  alice_id UUID;
  bob_id UUID;
  first_project_id UUID;
BEGIN
  -- Get Alice's UUID from auth.users
  SELECT id INTO alice_id FROM auth.users WHERE email = 'alice@example.com' LIMIT 1;
  
  -- Get Bob's UUID from auth.users
  SELECT id INTO bob_id FROM auth.users WHERE email = 'bob@example.com' LIMIT 1;
  
  -- Get the first project (or create a test one)
  SELECT id INTO first_project_id FROM projects LIMIT 1;
  
  -- If no project exists, create one
  IF first_project_id IS NULL THEN
    INSERT INTO projects (name, description, owner_id, created_at, updated_at)
    SELECT 'Test Project', 'Project for testing collaboration', id, NOW(), NOW()
    FROM users LIMIT 1
    RETURNING id INTO first_project_id;
  END IF;
  
  -- Insert Alice if not exists
  IF alice_id IS NOT NULL THEN
    INSERT INTO users (id, email, name, avatar, created_at, updated_at)
    VALUES (alice_id, 'alice@example.com', 'Alice Johnson', NULL, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = 'Alice Johnson',
      email = 'alice@example.com',
      updated_at = NOW();
    
    -- Add Alice to project
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (first_project_id, alice_id, 'editor', NOW())
    ON CONFLICT (project_id, user_id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Alice user not found in auth.users. Please create alice@example.com first in Authentication > Users';
  END IF;
  
  -- Insert Bob if not exists
  IF bob_id IS NOT NULL THEN
    INSERT INTO users (id, email, name, avatar, created_at, updated_at)
    VALUES (bob_id, 'bob@example.com', 'Bob Smith', NULL, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = 'Bob Smith',
      email = 'bob@example.com',
      updated_at = NOW();
    
    -- Add Bob to project
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (first_project_id, bob_id, 'editor', NOW())
    ON CONFLICT (project_id, user_id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Bob user not found in auth.users. Please create bob@example.com first in Authentication > Users';
  END IF;
  
  -- Display results
  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE 'Alice ID: %', alice_id;
  RAISE NOTICE 'Bob ID: %', bob_id;
  RAISE NOTICE 'Project ID: %', first_project_id;
  
END $$;

-- Step 3: Verify setup
SELECT '=== USERS CREATED ===' as status;
SELECT id, email, name, created_at FROM users 
WHERE email IN ('alice@example.com', 'bob@example.com')
ORDER BY created_at DESC;

SELECT '=== PROJECT MEMBERS ===' as status;
SELECT pm.id, u.email, u.name, pm.role, pm.joined_at
FROM project_members pm
JOIN users u ON pm.user_id = u.id
WHERE u.email IN ('alice@example.com', 'bob@example.com')
ORDER BY pm.joined_at DESC;

SELECT '=== TEST CREDENTIALS ===' as status;
SELECT 
  'alice@example.com' as email,
  'Alice123!@#' as password,
  'Alice Johnson' as name
UNION ALL
SELECT 
  'bob@example.com' as email,
  'Bob123!@#' as password,
  'Bob Smith' as name;

-- ============================================================================
-- INSTRUCTIONS:
-- 
-- 1. First, create the auth users manually:
--    - Go to Supabase Dashboard > Authentication > Users
--    - Click "Create new user"
--    - Email: alice@example.com, Password: Alice123!@#
--    - Email: bob@example.com, Password: Bob123!@#
--
-- 2. Then paste THIS ENTIRE SCRIPT into Supabase SQL Editor
--    - The script will automatically find their UUIDs and set everything up
--
-- 3. Test credentials:
--    - User 1: alice@example.com / Alice123!@#
--    - User 2: bob@example.com / Bob123!@#
--
-- ============================================================================
