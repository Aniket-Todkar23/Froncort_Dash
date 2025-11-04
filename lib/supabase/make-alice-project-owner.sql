-- ============================================================================
-- MAKE ALICE PROJECT OWNER FOR ALL PROJECTS
-- ============================================================================

DO $$
DECLARE
  alice_id UUID;
  project_rec RECORD;
BEGIN
  -- Get Alice's UUID from auth.users or users table
  SELECT id INTO alice_id FROM users WHERE email = 'alice@example.com' LIMIT 1;
  
  IF alice_id IS NULL THEN
    RAISE NOTICE '❌ Error: Alice user not found in users table (alice@example.com)';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Found Alice with ID: %', alice_id;
  
  -- Update all projects to have Alice as owner
  UPDATE projects SET owner_id = alice_id;
  
  RAISE NOTICE '✅ Updated all projects to have Alice as owner';
  
  -- For each project, ensure Alice is in project_members with 'owner' role
  FOR project_rec IN SELECT id FROM projects
  LOOP
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (project_rec.id, alice_id, 'owner', NOW())
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'owner';
  END LOOP;
  
  RAISE NOTICE '✅ Ensured Alice is member with owner role in all projects';
  
  -- Display results
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
  
END $$;

-- Verify the changes
SELECT '=== PROJECTS WITH ALICE AS OWNER ===' as status;
SELECT 
  p.id,
  p.name,
  u.email,
  u.name,
  p.created_at
FROM projects p
JOIN users u ON p.owner_id = u.id
WHERE u.email = 'alice@example.com'
ORDER BY p.created_at DESC;

SELECT '=== PROJECT MEMBERS ===' as status;
SELECT 
  p.name as project_name,
  u.email,
  u.name,
  pm.role,
  pm.joined_at
FROM project_members pm
JOIN projects p ON pm.project_id = p.id
JOIN users u ON pm.user_id = u.id
WHERE u.email = 'alice@example.com'
ORDER BY p.name;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Make sure Alice user exists: alice@example.com
-- 2. Run this script in Supabase SQL Editor
-- 3. All projects will be updated to have Alice as owner
-- ============================================================================
