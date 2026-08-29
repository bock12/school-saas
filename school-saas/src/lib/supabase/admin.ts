import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role / Admin Supabase client.
 * Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY if SUPABASE_SERVICE_ROLE_KEY is missing or invalid.
 */
export function createAdminClient() {
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const isValidServiceKey =
    rawKey &&
    rawKey !== 'sb_secret_placeholder' &&
    rawKey !== 'your_service_role_key_here' &&
    !rawKey.toLowerCase().includes('placeholder');

  const serviceKey = isValidServiceKey ? rawKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
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
