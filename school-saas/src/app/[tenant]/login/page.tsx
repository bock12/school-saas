import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TenantLoginForm } from './login-form';

export default async function TenantLoginPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const supabase = await createClient();

  // ── If already logged in and belongs to this tenant, skip login ──
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const { data: school } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenant)
      .single();

    if (profile && school && profile.tenant_id === school.id) {
      redirect(`/${tenant}`);
    }
  }

  // ── Fetch real school name from DB (admin client bypasses RLS for anon visitors) ──
  const adminSupabase = createAdminClient();
  const { data: school } = await adminSupabase
    .from('tenants')
    .select('id, name')
    .eq('slug', tenant)
    .single();

  const tenantName =
    school?.name ||
    tenant.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return <TenantLoginForm tenantSlug={tenant} tenantName={tenantName} schoolId={school?.id ?? ''} />;
}
