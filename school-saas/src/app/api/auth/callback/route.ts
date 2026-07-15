import { createServerClient } from '@supabase/ssr';
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

  // ── If this was an invite, sync the profile from user_metadata ─────────────
  // inviteTenantAdmin embeds role + tenant_id in user_metadata at invite time.
  // We upsert here to ensure the profile is always current (handles race conditions
  // where the pre-created profile row was not yet committed).
  const meta = user.user_metadata ?? {};
  if (meta.tenant_id && meta.role) {
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );
    await supabaseAdmin.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: meta.full_name ?? meta.name ?? '',
      role: meta.role,
      tenant_id: meta.tenant_id,
    }, { onConflict: 'id', ignoreDuplicates: false });
  }

  // 2. Determine if this is a tenant-specific login by parsing the `next` path.
  //    e.g. next="/greenwood" → tenantSlug="greenwood"
  //         next="/"          → tenantSlug=null (admin / root login)
  const nextPathSegments = next.split('/').filter(Boolean);
  const tenantSlug = nextPathSegments.length > 0 ? nextPathSegments[0] : null;

  // 3. If we're targeting a specific tenant, enforce tenant isolation.
  if (tenantSlug && tenantSlug !== 'super-admin') {
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
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/${tenantSlug}/login?error=AccessDenied`
        );
      }
    }
  }

  // 4. All checks passed — redirect to the destination
  return NextResponse.redirect(`${origin}${next}`);
}
