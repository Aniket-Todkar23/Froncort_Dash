-- Seed test cards for proj-1
DELETE FROM cards WHERE project_id = 'proj-1';

INSERT INTO cards (id, project_id, column_id, title, description, "order", created_at, updated_at) VALUES
('card-1', 'proj-1', 'col-1', 'Design login page mockups', 'Create high-fidelity mockups for the new login flow', 1, '2024-10-20T00:00:00Z', '2024-10-27T00:00:00Z'),
('card-2', 'proj-1', 'col-2', 'Implement authentication API', 'Build the backend for user authentication', 1, '2024-10-18T00:00:00Z', '2024-10-25T00:00:00Z'),
('card-3', 'proj-1', 'col-3', 'Write user guide documentation', 'Complete documentation for end users', 1, '2024-10-15T00:00:00Z', '2024-10-27T00:00:00Z'),
('card-4', 'proj-1', 'col-1', 'Bug: Mobile navigation not responsive', 'Navigation menu breaks on mobile devices below 600px', 2, '2024-10-24T00:00:00Z', '2024-10-26T00:00:00Z'),
('card-5', 'proj-1', 'col-1', 'Implement dark mode toggle', 'Add dark/light mode switcher to the app', 3, '2024-10-22T00:00:00Z', '2024-10-26T00:00:00Z'),
('card-6', 'proj-1', 'col-2', 'Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing', 2, '2024-10-19T00:00:00Z', '2024-10-25T00:00:00Z');
