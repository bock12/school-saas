import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — bypasses RLS.
 * ONLY use this on the server side for admin operations
 * like creating tenants and provisioning users.
 * 
 * NEVER import this in client components.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
