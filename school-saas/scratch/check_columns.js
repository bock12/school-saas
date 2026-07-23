const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yhrvmppfwjxninvbblrt.supabase.co',
  'sb_secret_S-xLstmx_tZGeSoRJnD-Tw_iG5YzWD2'
);

async function check() {
  const { data, error } = await supabase.from('applicants').select('id, documents, status, rejection_reason').limit(1);
  console.log('Query result:', data, 'Error:', error);
}

check();
