import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { BillingClient } from './_components/billing-client';
import { CreditCard } from 'lucide-react';

export default async function BillingPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();
  const orgId = profile.role === 'org_admin' ? (profile.tenant_id ?? org.id) : org.id;

  // Fetch org with plan
  const { data: orgData } = await supabase
    .from('tenants')
    .select('id, name, status, plan_id, created_at')
    .eq('id', orgId)
    .single();

  // Fetch subscription plan details
  const { data: plan } = orgData?.plan_id
    ? await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', orgData.plan_id)
        .single()
    : { data: null };

  // Fetch all plans for comparison
  const { data: allPlans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_monthly');

  // Count child schools
  const { count: schoolCount } = await supabase
    .from('tenants')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', orgId)
    .eq('type', 'school');

  // Count staff
  const schoolIds = await supabase
    .from('tenants')
    .select('id')
    .eq('parent_id', orgId)
    .eq('type', 'school');
  const ids = (schoolIds.data ?? []).map(s => s.id);

  const { count: staffCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .in('tenant_id', ids.length > 0 ? [orgId, ...ids] : [orgId]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Billing & Plans</h1>
        </div>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Manage your subscription plan, usage, and billing for <span className="font-semibold text-[hsl(var(--text-primary))]">{org.name}</span>.
        </p>
      </div>

      <BillingClient
        orgId={orgId}
        currentPlan={plan}
        allPlans={allPlans ?? []}
        usage={{
          schools: schoolCount ?? 0,
          maxSchools: plan?.max_schools ?? 1,
          staff: staffCount ?? 0,
          maxStaff: plan?.max_staff ?? 10,
          students: 0,
          maxStudents: plan?.max_students ?? 100,
        }}
        orgStatus={orgData?.status ?? 'active'}
        joinedAt={orgData?.created_at ?? new Date().toISOString()}
      />
    </div>
  );
}
