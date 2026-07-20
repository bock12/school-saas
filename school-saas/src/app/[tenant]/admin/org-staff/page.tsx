import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { Users, Building2, School, ShieldCheck } from 'lucide-react';
import { OrgStaffClient } from './_components/org-staff-client';

export default async function OrgStaffPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();
  const orgId = profile.role === 'org_admin' ? (profile.tenant_id ?? org.id) : org.id;

  // All staff across the org and its schools
  const { data: orgProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at, last_login_at, department, job_title, staff_id, phone')
    .eq('tenant_id', orgId)
    .order('created_at', { ascending: false });

  // Child schools + their staff
  const { data: schools } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('parent_id', orgId)
    .eq('type', 'school')
    .order('name');

  const schoolIds = (schools ?? []).map((s) => s.id);
  const { data: schoolProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at, last_login_at, tenant_id, department, job_title, staff_id, phone')
    .in('tenant_id', schoolIds.length > 0 ? schoolIds : ['none'])
    .order('created_at', { ascending: false });

  const schoolById = Object.fromEntries((schools ?? []).map((s) => [s.id, s]));

  // Combine all staff with school info
  const allStaff = [
    ...(orgProfiles ?? []).map(p => ({ ...p, schoolName: org.name, schoolSlug: tenant, isOrgLevel: true })),
    ...(schoolProfiles ?? []).map(p => ({
      ...p,
      schoolName: schoolById[p.tenant_id ?? '']?.name ?? 'Unknown School',
      schoolSlug: schoolById[p.tenant_id ?? '']?.slug ?? '',
      isOrgLevel: false,
    })),
  ];

  return (
    <OrgStaffClient
      tenant={tenant}
      orgId={orgId}
      orgSlug={tenant}
      orgName={org.name}
      allStaff={allStaff}
      schools={schools ?? []}
    />
  );
}
