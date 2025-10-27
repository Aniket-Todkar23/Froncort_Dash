require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_CARDS = [
  {
    id: 'card-1',
    project_id: 'proj-1',
    column_id: 'col-1',
    title: 'Design login page mockups',
    description: 'Create high-fidelity mockups for the new login flow',
    order: 1,
    created_at: new Date('2024-10-20').toISOString(),
    updated_at: new Date('2024-10-27').toISOString(),
  },
  {
    id: 'card-2',
    project_id: 'proj-1',
    column_id: 'col-2',
    title: 'Implement authentication API',
    description: 'Build the backend for user authentication',
    order: 1,
    created_at: new Date('2024-10-18').toISOString(),
    updated_at: new Date('2024-10-25').toISOString(),
  },
  {
    id: 'card-3',
    project_id: 'proj-1',
    column_id: 'col-3',
    title: 'Write user guide documentation',
    description: 'Complete documentation for end users',
    order: 1,
    created_at: new Date('2024-10-15').toISOString(),
    updated_at: new Date('2024-10-27').toISOString(),
  },
  {
    id: 'card-4',
    project_id: 'proj-1',
    column_id: 'col-1',
    title: 'Bug: Mobile navigation not responsive',
    description: 'Navigation menu breaks on mobile devices below 600px',
    order: 2,
    created_at: new Date('2024-10-24').toISOString(),
    updated_at: new Date('2024-10-26').toISOString(),
  },
  {
    id: 'card-5',
    project_id: 'proj-1',
    column_id: 'col-1',
    title: 'Implement dark mode toggle',
    description: 'Add dark/light mode switcher to the app',
    order: 3,
    created_at: new Date('2024-10-22').toISOString(),
    updated_at: new Date('2024-10-26').toISOString(),
  },
  {
    id: 'card-6',
    project_id: 'proj-1',
    column_id: 'col-2',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing',
    order: 2,
    created_at: new Date('2024-10-19').toISOString(),
    updated_at: new Date('2024-10-25').toISOString(),
  },
];

async function seedCards() {
  try {
    console.log('🌱 Starting to seed cards...');

    // Clear existing cards for proj-1
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('project_id', 'proj-1');

    if (deleteError) {
      console.error('Error clearing existing cards:', deleteError);
    } else {
      console.log('✓ Cleared existing cards');
    }

    // Insert new cards
    const { data, error } = await supabase
      .from('cards')
      .insert(SEED_CARDS);

    if (error) {
      console.error('Error inserting cards:', error);
      process.exit(1);
    }

    console.log('✓ Successfully seeded', SEED_CARDS.length, 'cards');
    console.log('Cards:', SEED_CARDS.map(c => ({ id: c.id, title: c.title, column: c.column_id })));
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedCards();
