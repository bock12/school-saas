import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('*').limit(50);
  console.log('PROFILES:', JSON.stringify(profiles, null, 2));

  const { data: tenants } = await supabase.from('tenants').select('*').limit(50);
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));
}

check();
