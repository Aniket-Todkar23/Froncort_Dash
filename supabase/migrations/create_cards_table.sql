-- Create cards table for kanban board
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  assignee_id TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index on project_id for faster queries
CREATE INDEX idx_cards_project_id ON public.cards(project_id);
CREATE INDEX idx_cards_column_id ON public.cards(column_id);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view cards in their projects
CREATE POLICY "Users can view cards in their projects"
  ON public.cards FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert cards in their projects
CREATE POLICY "Users can insert cards in their projects"
  ON public.cards FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- RLS Policy: Users can update cards in their projects
CREATE POLICY "Users can update cards in their projects"
  ON public.cards FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
    )
  );

-- RLS Policy: Users can delete cards in their projects
CREATE POLICY "Users can delete cards in their projects"
  ON public.cards FOR DELETE
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
