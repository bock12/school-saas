import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TenantSidebar } from '@/components/tenant/sidebar';
import { TenantTopbar } from '@/components/tenant/topbar';

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const supabase = await createClient();

  // ── 1. Verify the user is authenticated ───────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${tenant}/login`);
  }

  // ── 2. Fetch the user's profile and verify tenant membership ──
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Profile missing — sign out and send to login
    await supabase.auth.signOut();
    redirect(`/${tenant}/login`);
  }

  // ── 3. Resolve the tenant and enforce isolation ────────────────
  const { data: school } = await supabase
    .from('tenants')
    .select('id, name, primary_color, logo_url')
    .eq('slug', tenant)
    .single();

  // Cross-tenant access check: user's profile must belong to this school
  if (!school || profile.tenant_id !== school.id) {
    await supabase.auth.signOut();
    redirect(`/${tenant}/login`);
  }

  // ── 4. Build display name ──────────────────────────────────────
  const displayName =
    profile.full_name ||
    user.email?.split('@')[0] ||
    'School User';

  const tenantName =
    school.name ||
    tenant.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <TenantSidebar
        tenantSlug={tenant}
        tenantName={tenantName}
        primaryColor={school.primary_color || '#6366f1'}
      />
      <div className="ml-[260px] transition-all duration-300">
        <TenantTopbar
          tenantSlug={tenant}
          tenantName={tenantName}
          userName={displayName}
          userRole={profile.role}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
