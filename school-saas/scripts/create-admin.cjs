/**
 * create-admin.cjs
 *
 * Creates a Supabase Auth user + matching profiles row for a school admin.
 * Run AFTER seed-tenant.cjs so the tenant already exists.
 *
 * Usage:
 *   node scripts/create-admin.cjs
 *
 * Credentials created:
 *   Email:    admin@greenwood.edu
 *   Password: Admin1234!
 *   Tenant:   school-a (Greenwood High)
 *   Role:     school_admin
 */

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config({ path: '.env.local' });

const TENANT_SLUG   = 'school-a';
const ADMIN_EMAIL   = 'admin@greenwood.edu';
const ADMIN_PASSWORD = 'Admin1234!';
const ADMIN_NAME    = 'School Administrator';
const ADMIN_ROLE    = 'school_admin';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  // Service-role client bypasses RLS so we can write to auth.users + profiles
  // Pass ws as WebSocket transport for Node.js < 22 compatibility
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  // 1. Resolve the tenant
  console.log(`Looking up tenant "${TENANT_SLUG}"...`);
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', TENANT_SLUG)
    .single();

  if (tenantErr || !tenant) {
    console.error(`❌  Tenant "${TENANT_SLUG}" not found. Run seed-tenant.cjs first.`);
    process.exit(1);
  }
  console.log(`   Found: ${tenant.name} (${tenant.id})`);

  // 2. Create (or retrieve) the Supabase Auth user
  console.log(`\nCreating auth user ${ADMIN_EMAIL}...`);
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // skip email confirmation for dev seeding
  });

  if (authErr) {
    // If the user already exists Supabase returns a 422 with "already registered"
    if (authErr.message?.toLowerCase().includes('already registered') || authErr.status === 422) {
      console.log('   ℹ️  Auth user already exists — skipping creation.');

      // Fetch existing user so we have their ID
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('❌  Could not find existing user. Aborting.');
        process.exit(1);
      }
      await upsertProfile(supabase, existing.id, tenant.id);
    } else {
      console.error('❌  Failed to create auth user:', authErr.message);
      process.exit(1);
    }
  } else {
    console.log(`   ✅ Auth user created: ${authData.user.id}`);
    await upsertProfile(supabase, authData.user.id, tenant.id);
  }

  console.log('\n✅  Done!');
  console.log('─'.repeat(40));
  console.log(`  URL:      http://localhost:3000/${TENANT_SLUG}/login`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('─'.repeat(40));
}

async function upsertProfile(supabase, userId, tenantId) {
  console.log('Upserting profile row...');
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      tenant_id: tenantId,
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
