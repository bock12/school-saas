/**
 * Super Admin Password Reset Script
 * Run: node scripts/reset-superadmin.js
 * 
 * This resets the super admin credentials using the Supabase Auth Admin API.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local
 */

const fs = require('fs');
const path = require('path');

// Manual .env.local loader (no dotenv dependency needed)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: class { constructor() {} addEventListener() {} removeEventListener() {} close() {} } }
});

const NEW_EMAIL    = process.env.NEW_EMAIL || 'superadmin@schoolsaas.com';
const NEW_PASSWORD = process.env.NEW_PASSWORD || process.env.SUPERADMIN_PASSWORD;

if (!NEW_PASSWORD) {
  console.error('❌  Missing NEW_PASSWORD or SUPERADMIN_PASSWORD in environment variables');
  process.exit(1);
}

async function resetSuperAdmin() {
  console.log('\n🔍  Searching for existing super admin account...');

  // 1. Try to find by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) { console.error('❌  Failed to list users:', listErr.message); process.exit(1); }

  const existing = users.find(u =>
    u.email === NEW_EMAIL ||
    (u.user_metadata?.role === 'super_admin') ||
    (u.app_metadata?.role === 'super_admin')
  );

  if (existing) {
    console.log(`✅  Found existing super admin: ${existing.email} (${existing.id})`);

    // 2. Update password + email
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, role: 'super_admin' },
      app_metadata:  { ...existing.app_metadata,  role: 'super_admin' }
    });

    if (updateErr) {
      console.error('❌  Failed to update super admin:', updateErr.message);
      process.exit(1);
    }

    console.log('\n🎉  Super admin credentials successfully reset!');
  } else {
    console.log('ℹ️   No existing super admin found — creating new account...');

    // 3. Create brand new super admin user
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Super Administrator', role: 'super_admin' },
      app_metadata:  { role: 'super_admin' }
    });

    if (createErr) {
      console.error('❌  Failed to create super admin:', createErr.message);
      process.exit(1);
    }

    console.log(`\n🎉  Super admin account created! (ID: ${newUser.user?.id})`);
  }

  // 4. Ensure super_admins table record exists
  const { error: upsertErr } = await supabase
    .from('super_admins')
    .upsert({ email: NEW_EMAIL, name: 'Super Administrator' }, { onConflict: 'email' });

  if (upsertErr) {
    console.warn('⚠️   Could not upsert super_admins table (may not exist or already set):', upsertErr.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login URL : http://localhost:3000/super-admin/login');
  console.log(`  Email     : ${NEW_EMAIL}`);
  console.log(`  Password  : [CONFIGURED VIA ENV]`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️   IMPORTANT: Change this password immediately after first login!\n');
}

resetSuperAdmin().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
