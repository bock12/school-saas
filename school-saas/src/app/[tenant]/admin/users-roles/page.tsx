import { requireTenantUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { UsersRolesClient } from './_components/users-roles-client';

export default async function UsersRolesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school } = await requireTenantUser(tenant);
  const supabase = await createClient();

  let orgId = school.id;
  let isOrgLevel = school.type === 'organization' || profile.role === 'org_admin';

  // If the user is an org admin, they can see all users in the org and child schools.
  // If they are a school admin, they only see users in their school.
  let allProfiles: any[] = [];
  let schoolsMap: Record<string, any> = {};

  if (isOrgLevel) {
    // Determine the actual org ID if the tenant itself is a school but the user is org_admin
    orgId = profile.tenant_id ?? school.id;

    const [{ data: orgProfiles }, { data: schools }] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', orgId)
        .order('created_at', { ascending: false }),
      supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('parent_id', orgId)
        .eq('type', 'school')
    ]);

    const childSchools = schools ?? [];
    childSchools.forEach(s => { schoolsMap[s.id] = s; });

    const schoolIds = childSchools.map((s) => s.id);
    const { data: schoolProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('tenant_id', schoolIds.length > 0 ? schoolIds : ['none'])
      .order('created_at', { ascending: false });

    allProfiles = [
      ...(orgProfiles ?? []).map(p => ({ ...p, schoolName: school.name, schoolSlug: tenant, isOrgLevel: true })),
      ...(schoolProfiles ?? []).map(p => ({
        ...p,
        schoolName: schoolsMap[p.tenant_id ?? '']?.name ?? 'Unknown',
        schoolSlug: schoolsMap[p.tenant_id ?? '']?.slug ?? '',
        isOrgLevel: false,
      })),
    ];
  } else {
    // School level only
    const { data: schoolProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', school.id)
      .order('created_at', { ascending: false });
      
    allProfiles = (schoolProfiles ?? []).map(p => ({
      ...p,
      schoolName: school.name,
      schoolSlug: tenant,
      isOrgLevel: false,
    }));
  }

  return (
    <UsersRolesClient 
      tenantSlug={tenant} 
      profiles={allProfiles} 
      isOrgAdmin={profile.role === 'org_admin' || profile.role === 'super_admin'}
    />
  );
}
