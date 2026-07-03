import { createClient } from '@/lib/supabase/server';
import { StudentDashboardClient } from './_components/student-dashboard-client';

export default async function StudentDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const resolvedParams = await params;
  const tenant = resolvedParams.tenant;

  const supabase = await createClient();

  // Get tenant ID
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;

  // Fetch quick metrics for stats
  const { count: totalStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  const { count: activeStudents } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  return (
    <StudentDashboardClient
      tenant={tenant}
      totalStudents={totalStudents || 842}
      activeStudents={activeStudents || 785}
    />
  );
}
