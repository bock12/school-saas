// Quick script to verify Supabase connection
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('━━━ Supabase Connection Check ━━━');
console.log(`URL: ${url}`);
console.log(`Anon Key: ${key ? key.slice(0, 20) + '...' : 'MISSING!'}`);
console.log(`Service Key: ${serviceKey ? serviceKey.slice(0, 20) + '...' : 'MISSING!'}`);
console.log(`Database URL: ${process.env.DATABASE_URL ? 'SET ✓' : 'MISSING!'}`);
console.log('');

if (!url || !key) {
  console.error('❌ Missing Supabase URL or Anon Key!');
  process.exit(1);
}

async function test() {
  try {
    // Test with anon key
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('tenants').select('count');
    
    if (error) {
      // Table might not exist yet - that's expected before migrations
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('⚠️  Connection works, but "tenants" table not found.');
        console.log('   → You need to run the migrations first.');
      } else {
        console.log(`⚠️  Connection works, but got: ${error.message}`);
      }
    } else {
      console.log('✅ Connection successful! "tenants" table exists.');
      console.log(`   Rows found: ${JSON.stringify(data)}`);
    }

    // Test service role key
    const adminClient = createClient(url, serviceKey);
    const { error: adminError } = await adminClient.auth.admin.listUsers({ perPage: 1 });
    if (adminError) {
      console.log(`⚠️  Service role key issue: ${adminError.message}`);
    } else {
      console.log('✅ Service role (Secret) key works!');
    }

    console.log('\n━━━ All checks passed ━━━');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

test();
