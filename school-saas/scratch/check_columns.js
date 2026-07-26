const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  const { data, error } = await supabase.from('applicants').select('id, documents, status, rejection_reason').limit(1);
  console.log('Query result:', data, 'Error:', error);
}

check();
