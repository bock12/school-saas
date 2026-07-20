import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsClient } from './_components/analytics-client';
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);
  const supabase = await createClient();

  const orgId = profile.role === 'org_admin' ? (profile.tenant_id ?? org.id) : org.id;

  // Fetch child schools with stats
  const { data: schools } = await supabase
    .from('tenants')
    .select('id, name, status, student_count, teacher_count, created_at')
    .eq('parent_id', orgId)
    .eq('type', 'school')
    .order('name');

  // All school IDs
  const schoolIds = (schools ?? []).map(s => s.id);

  // Staff breakdown by role across org + schools
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('role, is_active, tenant_id')
    .in('tenant_id', schoolIds.length > 0 ? [orgId, ...schoolIds] : [orgId]);

  // Role counts
  const roleCounts = (allProfiles ?? []).reduce<Record<string, number>>((acc, p) => {
    if (!p.role) return acc;
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {});

  // Active vs inactive
  const activeCount = (allProfiles ?? []).filter(p => p.is_active).length;
  const inactiveCount = (allProfiles ?? []).length - activeCount;

  // School status breakdown
  const statusCounts = (schools ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Analytics</h1>
        </div>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Organization-wide insights across all schools in <span className="font-semibold text-[hsl(var(--text-primary))]">{org.name}</span>.
        </p>
      </div>

      <AnalyticsClient
        schools={schools ?? []}
        roleCounts={roleCounts}
        statusCounts={statusCounts}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        orgName={org.name}
      />
    </div>
  );
}
