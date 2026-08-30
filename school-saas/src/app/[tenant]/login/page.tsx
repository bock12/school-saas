import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPgPool } from '@/lib/db/pg-fallback';
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
      .select('tenant_id, requires_password_change')
      .eq('id', user.id)
      .single();

    const { data: school } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenant)
      .single();

    if (profile && school && profile.tenant_id === school.id && !profile.requires_password_change) {
      redirect(`/${tenant}/dashboard`);
    }
  }

  // ── Fetch real school name from DB ──
  let school: { id: string; name: string } | null = null;
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT id, name FROM tenants WHERE slug = $1 LIMIT 1', [tenant]);
      if (res.rows.length > 0) {
        school = res.rows[0];
      }
    } catch (err) {
      console.warn('[TenantLoginPage] PG query failed:', err);
    }
  }

  if (!school) {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('tenants')
      .select('id, name')
      .eq('slug', tenant)
      .maybeSingle();
    school = data;
  }

  const tenantName =
    school?.name ||
    tenant.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return <TenantLoginForm tenantSlug={tenant} tenantName={tenantName} schoolId={school?.id ?? ''} />;
}
