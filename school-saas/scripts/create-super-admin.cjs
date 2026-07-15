/**
 * create-super-admin.cjs
 *
 * Creates a Supabase Auth user + matching profiles row for a super admin.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-super-admin.cjs
 *
 * Credentials created:
 *   Email:    superadmin@schoolsaas.com
 *   Password: SuperAdmin1234!
 *   Role:     super_admin
 */

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const ADMIN_EMAIL   = 'superadmin@schoolsaas.com';
const ADMIN_PASSWORD = 'SuperAdmin1234!';
const ADMIN_NAME    = 'Super Admin';
const ADMIN_ROLE    = 'super_admin';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    process.exit(1);
  }

  // Service-role client bypasses RLS so we can write to auth.users + profiles
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  // 1. Create (or retrieve) the Supabase Auth user
  console.log(`\nCreating auth user ${ADMIN_EMAIL}...`);
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // skip email confirmation for dev seeding
  });

  if (authErr) {
    if (authErr.message?.toLowerCase().includes('already registered') || authErr.status === 422) {
      console.log('   ℹ️  Auth user already exists — skipping creation.');

      // Fetch existing user so we have their ID
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('❌  Could not find existing user. Aborting.');
        process.exit(1);
      }
      await upsertProfile(supabase, existing.id);
    } else {
      console.error('❌  Failed to create auth user:', authErr.message);
      process.exit(1);
    }
  } else {
    console.log(`   ✅ Auth user created: ${authData.user.id}`);
    await upsertProfile(supabase, authData.user.id);
  }

  console.log('\n✅  Done!');
  console.log('─'.repeat(40));
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('─'.repeat(40));
}

async function upsertProfile(supabase, userId) {
  console.log('Upserting profile row...');
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      tenant_id: null,
      full_name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: ADMIN_ROLE,
      is_active: true,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('❌  Failed to upsert profile:', error.message);
    process.exit(1);
  }
  console.log('   ✅ Profile row upserted.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
