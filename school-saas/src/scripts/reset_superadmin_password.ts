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

  console.log('--- Resetting SuperAdmin Password ---');
  const userId = 'b6696f8d-3c4e-4526-9269-c9d23e01279f';
  const newPassword = 'SuperAdmin2026!';

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
    user_metadata: { role: 'super_admin', requires_password_change: false }
  });

  if (error) {
    console.error('Password reset failed:', error);
  } else {
    console.log('Password successfully reset to:', newPassword);
    console.log('User metadata updated:', data.user.user_metadata);
  }
}

main().catch(console.error);
