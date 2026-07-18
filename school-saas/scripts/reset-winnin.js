const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  });

  console.log('Resetting password for winnin@school.com...');
  const { data, error } = await supabase.auth.admin.updateUserById(
    'e00b21d7-6087-4a54-be11-1180d8922a5f',
    { password: 'Admin1234!' }
  );

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Password updated to: Admin1234!');
  }
}
main().catch(console.error);
