/**
 * diagnose-auth.cjs
 * Checks the actual state of auth user + profile in the DB.
 * Run: node scripts/diagnose-auth.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config({ path: '.env.local' });

const ADMIN_EMAIL = 'admin@greenwood.edu';
const TENANT_SLUG = 'school-a';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌  Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  // 1. Check tenant
  console.log('─── Tenant ───────────────────────────────');
  const { data: tenant, error: te } = await supabase
    .from('tenants')
    .select('id, name, slug, status')
    .eq('slug', TENANT_SLUG)
    .single();

  if (te || !tenant) {
    console.error('❌  Tenant not found:', te?.message);
  } else {
    console.log('✅  Tenant:', tenant.name, '|', tenant.id, '|', tenant.status);
  }

  // 2. Check auth user
  console.log('\n─── Auth User ────────────────────────────');
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUser = users?.users?.find(u => u.email === ADMIN_EMAIL);

  if (!authUser) {
    console.error('❌  Auth user not found for email:', ADMIN_EMAIL);
  } else {
    console.log('✅  Auth user:', authUser.id, '|', authUser.email, '| confirmed:', authUser.email_confirmed_at ? 'yes' : 'no');
  }

  // 3. Check profile
  if (authUser) {
    console.log('\n─── Profile Row ──────────────────────────');
    const { data: profile, error: pe } = await supabase
      .from('profiles')
      .select('id, full_name, role, tenant_id, is_active')
      .eq('id', authUser.id)
      .single();

    if (pe || !profile) {
      console.error('❌  Profile NOT FOUND for user id:', authUser.id);
      console.error('   Error:', pe?.message);
      console.log('\n   → Re-running profile upsert...');
      if (tenant) {
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: authUser.id,
          tenant_id: tenant.id,
          full_name: 'School Administrator',
          email: ADMIN_EMAIL,
          role: 'school_admin',
          is_active: true,
        }, { onConflict: 'id' });

        if (upsertErr) {
          console.error('❌  Upsert failed:', upsertErr.message);
        } else {
          console.log('✅  Profile upserted! Try logging in again.');
        }
      }
    } else {
      console.log('✅  Profile found:', profile.full_name, '|', profile.role);
      console.log('   tenant_id in profile:', profile.tenant_id);
      console.log('   tenant_id of school-a:', tenant?.id);
      console.log('   Match:', profile.tenant_id === tenant?.id ? '✅ YES' : '❌ NO — MISMATCH!');
    }
  }

  // 4. RLS test — simulate the client-side query using anon key
  console.log('\n─── RLS Simulation (anon → signIn → profile query) ───');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anonClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: 'Admin1234!',
  });

  if (signInErr) {
    console.error('❌  Sign-in failed:', signInErr.message);
  } else {
    console.log('✅  Sign-in OK, user id:', signInData.user?.id);

    const { data: p, error: pe } = await anonClient
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', signInData.user?.id)
      .single();

    if (pe || !p) {
      console.error('❌  Profile query FAILED via RLS:', pe?.message, pe?.code, pe?.details);
    } else {
      console.log('✅  Profile query OK via RLS:', p.role, '| tenant_id:', p.tenant_id);
    }

    await anonClient.auth.signOut();
  }

  console.log('\n─── Done ─────────────────────────────────');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
