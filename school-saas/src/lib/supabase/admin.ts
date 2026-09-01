import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for privileged Supabase operations.`);
  }
  return value;
}

function requireServiceRoleKey() {
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const knownInvalidValues = new Set([
    'sb_secret_placeholder',
    'your_service_role_key_here',
  ]);

  if (knownInvalidValues.has(serviceRoleKey) || serviceRoleKey.toLowerCase().includes('placeholder')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is still set to a placeholder value.');
  }

  if (anonKey && serviceRoleKey === anonKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must not be the public anonymous key.');
  }

  return serviceRoleKey;
}

/**
 * Service-role / Admin Supabase client.
 * This intentionally fails fast if the service-role key is missing or invalid.
 */
export function createAdminClient() {
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireServiceRoleKey();

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, { ...options, cache: 'no-store' });
        },
      },
    }
  );
}
