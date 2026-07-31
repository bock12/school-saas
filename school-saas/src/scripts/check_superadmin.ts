// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import ws from 'ws';

const envPath = 'c:/Users/SAHR/OneDrive - DreamDay Technology/Documents/SchoolSaas/school-saas/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) {
    env[key.trim()] = val.join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  console.log('--- Checking Tenants ---');
  const { data: tenants, error: tErr } = await supabase.from('tenants').select('id, name, slug, parent_id');
  if (tErr) console.error('Tenant error:', tErr);
  console.log('Tenants:', tenants);

  console.log('\n--- Checking Profiles ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, email, full_name, role, tenant_id');
  if (pErr) console.error('Profiles error:', pErr);
  console.log('Profiles:', profiles);

  console.log('\n--- Checking Auth Users ---');
  const { data: usersData, error: uErr } = await supabase.auth.admin.listUsers();
  if (uErr) console.error('Users error:', uErr);
  usersData?.users?.forEach(u => {
    console.log(`User email: "${u.email}" | ID: ${u.id} | Metadata:`, u.user_metadata);
  });
}

main().catch(console.error);
