const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws }
  });

  const userId = process.env.USER_ID;
  const newPassword = process.env.NEW_PASSWORD;

  if (!userId || !newPassword) {
    console.error('Usage: USER_ID=... NEW_PASSWORD=... node scripts/reset-winnin.js');
    process.exit(1);
  }

  console.log(`Resetting password for user ${userId}...`);
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Password updated.');
  }
}
main().catch(console.error);
