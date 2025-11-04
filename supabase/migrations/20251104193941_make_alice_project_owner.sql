-- Make Alice project owner for all projects
DO $$
DECLARE
  alice_id UUID;
  project_rec RECORD;
BEGIN
  -- Get Alice's UUID from users table
  SELECT id INTO alice_id FROM users WHERE email = 'alice@example.com' LIMIT 1;
  
  IF alice_id IS NULL THEN
    RAISE NOTICE 'Error: Alice user not found in users table (alice@example.com)';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found Alice with ID: %', alice_id;
  
  -- Update all projects to have Alice as owner
  UPDATE projects SET owner_id = alice_id;
  
  RAISE NOTICE 'Updated all projects to have Alice as owner';
  
  -- For each project, ensure Alice is in project_members with 'owner' role
  FOR project_rec IN SELECT id FROM projects
  LOOP
    INSERT INTO project_members (project_id, user_id, role, joined_at)
    VALUES (project_rec.id, alice_id, 'owner', NOW())
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'owner';
  END LOOP;
  
  RAISE NOTICE 'Ensured Alice is member with owner role in all projects';
  
END $$;
