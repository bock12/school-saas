import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateAndSyncInvitedProfile } from '@/lib/auth/callback-sync';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore: called from a Server Component with read-only cookies.
            // The middleware session refresh handles persistence.
          }
        },
      },
    }
  );

  // 1. Exchange the OAuth/Magic Link code for a session
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData.user) {
    return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
  }

  const user = sessionData.user;

  // ── Establish and validate trusted invitation/provisioning source ───────────
  // NEVER trust user_metadata.role or user_metadata.tenant_id as authoritative authorization data.
  // Authoritative authorization state is strictly validated against the server database.
  await validateAndSyncInvitedProfile(user, createAdminClient);

  // 2. Determine if this is a tenant-specific login by parsing the `next` path.
  //    e.g. next="/greenwood" → tenantSlug="greenwood"
  //         next="/"          → tenantSlug=null (admin / root login)
  const nextPathSegments = next.split('/').filter(Boolean);
  const tenantSlug = nextPathSegments.length > 0 ? nextPathSegments[0] : null;

  // 3. If we're targeting a specific tenant, enforce tenant isolation.
  //    Skip the check entirely for special routes like `set-password`.
  const lastSegment = nextPathSegments[nextPathSegments.length - 1];
  const isSpecialRoute = lastSegment === 'set-password';

  if (tenantSlug && tenantSlug !== 'super-admin' && !isSpecialRoute) {
    // Fetch the user's profile to get their role and tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // No profile found — sign out and bounce to the tenant login
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/${tenantSlug}/login?error=ProfileNotFound`
      );
    }

    // Super admins can access any tenant — skip tenant isolation check
    if (profile.role !== 'super_admin') {
      // Resolve the target school's id from its slug
      const { data: school, error: schoolError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

      if (schoolError || !school) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/${tenantSlug}/login?error=SchoolNotFound`
        );
      }

      // ── TENANT ISOLATION CHECK ────────────────────────────────
      if (profile.tenant_id !== school.id) {
        let isParentAdmin = false;
        
        if (profile.role === 'org_admin') {
          const { data: tenantCheck } = await supabase
            .from('tenants')
            .select('parent_id')
            .eq('id', school.id)
            .single();
            
          if (tenantCheck && tenantCheck.parent_id === profile.tenant_id) {
            isParentAdmin = true;
          }
        }

        if (!isParentAdmin) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/${tenantSlug}/login?error=AccessDenied`
          );
        }
      }
    }
  }

  // 4. All checks passed — redirect to the destination
  return NextResponse.redirect(`${origin}${next}`);
}
