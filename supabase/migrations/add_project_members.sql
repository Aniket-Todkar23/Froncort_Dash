-- Create project_members table for team assignments
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- Enable RLS on project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memberships
CREATE POLICY "Users can view their project memberships"
  ON project_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view members of projects they belong to
CREATE POLICY "Users can view members of assigned projects"
  ON project_members
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Project owners and admins can manage members
CREATE POLICY "Project owners/admins can manage members"
  ON project_members
  FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update RLS for projects table to restrict access to assigned members only
DROP POLICY IF EXISTS "Enable project read access for members" ON projects;
DROP POLICY IF EXISTS "Enable project write access for members" ON projects;

-- New policies for projects - only visible to assigned members
CREATE POLICY "Projects visible to assigned members"
  ON projects
  FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins/owners can update"
  ON projects
  FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only project owners can delete"
  ON projects
  FOR DELETE
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Update kanban_boards, kanban_columns, kanban_cards to use project membership for access
DROP POLICY IF EXISTS "Kanban boards visible to project members" ON kanban_boards;
DROP POLICY IF EXISTS "Kanban columns visible to project members" ON kanban_columns;
DROP POLICY IF EXISTS "Kanban cards visible to project members" ON kanban_cards;

-- Kanban Boards RLS - restrict to project members
CREATE POLICY "Kanban boards visible to project members"
  ON kanban_boards
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Kanban Columns RLS - restrict to project members
CREATE POLICY "Kanban columns visible to project members"
  ON kanban_columns
  FOR SELECT
  USING (
    id IN (
      SELECT id FROM kanban_columns 
      INNER JOIN kanban_boards ON kanban_columns.board_id = kanban_boards.id
      WHERE kanban_boards.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

-- Kanban Cards RLS - restrict to project members
CREATE POLICY "Kanban cards visible to project members"
  ON kanban_cards
  FOR SELECT
  USING (
    id IN (
      SELECT id FROM kanban_cards 
      INNER JOIN kanban_columns ON kanban_cards.column_id = kanban_columns.id
      INNER JOIN kanban_boards ON kanban_columns.board_id = kanban_boards.id
      WHERE kanban_boards.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

-- Similar for pages (documentation)
DROP POLICY IF EXISTS "Pages visible to project members" ON pages;

CREATE POLICY "Pages visible to project members"
  ON pages
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Function to auto-assign project creator as owner
CREATE OR REPLACE FUNCTION auto_assign_project_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, assigned_by)
  VALUES (NEW.id, auth.uid(), 'owner', auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign owner when project is created
DROP TRIGGER IF EXISTS project_owner_trigger ON projects;
CREATE TRIGGER project_owner_trigger
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION auto_assign_project_owner();
