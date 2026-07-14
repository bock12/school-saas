import { createClient } from '@/lib/supabase/client';
import { KpiMetric, RevenueDataPoint, ProvisioningActivity, Alert } from '../types/dashboard';
import { School, Users, DollarSign, AlertTriangle } from 'lucide-react';

// ---------------------------------------------------------------------------
// KPIs — derived from real tenants table aggregates
// ---------------------------------------------------------------------------
export const dashboardApi = {
  getKpis: async (): Promise<KpiMetric[]> => {
    const supabase = createClient();

    // Count all school-type tenants (active + trial)
    const { count: schoolCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'school');

    // Count suspended tenants
    const { count: suspendedCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'suspended');

    // Sum students across all tenants
    const { data: studentSum } = await supabase
      .from('tenants')
      .select('students_count');

    const totalStudents = (studentSum ?? []).reduce(
      (sum, r) => sum + (r.students_count ?? 0), 0
    );

    // Count new schools this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'school')
      .gte('created_at', startOfMonth.toISOString());

    const formatStudents = (n: number) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
      return String(n);
    };

    return [
      {
        id: 'kpi-1',
        title: 'Total Registered Schools',
        value: schoolCount ?? 0,
        trend: `+${newThisMonth ?? 0} this month`,
        trendDirection: 'up',
        icon: School,
      },
      {
        id: 'kpi-2',
        title: 'Platform MRR',
        value: '—',
        trend: 'Connect billing to show',
        trendDirection: 'neutral',
        icon: DollarSign,
      },
      {
        id: 'kpi-3',
        title: 'Total Students',
        value: formatStudents(totalStudents),
        trend: 'Across all schools',
        trendDirection: 'up',
        icon: Users,
      },
      {
        id: 'kpi-4',
        title: 'Suspended / At Risk',
        value: suspendedCount ?? 0,
        trend: suspendedCount ? 'Needs review' : 'All clear',
        trendDirection: suspendedCount ? 'down' : 'neutral',
        icon: AlertTriangle,
      },
    ];
  },

  // Revenue data — placeholder until a billing table is wired
  // We return tenant growth per month as a proxy
  getRevenueData: async (_timeRange: string = '6m'): Promise<RevenueDataPoint[]> => {
    const supabase = createClient();

    // Get monthly tenant creation counts for the last 6 months
    const { data } = await supabase
      .from('tenants')
      .select('created_at')
      .eq('type', 'school')
      .order('created_at', { ascending: true });

    if (!data || data.length === 0) return [];

    // Bucket by month
    const monthMap: Record<string, number> = {};
    data.forEach(row => {
      const d = new Date(row.created_at);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    });

    // Last 6 months only
    const months: RevenueDataPoint[] = Object.entries(monthMap)
      .slice(-6)
      .map(([name, tenants]) => ({
        name: name.split(' ')[0], // just "Jan", "Feb" etc.
        tenants,
        revenue: 0, // Replace when billing table exists
      }));

    return months;
  },

  // Provisioning feed — most recently created tenants
  getProvisioningFeed: async (): Promise<ProvisioningActivity[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, status, region, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      schoolName: row.name,
      plan: 'Unknown',   // plan_id is a UUID FK; resolve later
      geography: row.region ?? 'Unknown',
      status: row.status,
      timestamp: row.created_at,
      createdBy: 'System',
    }));
  },

  // Alerts — suspended/provisioning-stuck tenants
  getAlerts: async (): Promise<Alert[]> => {
    const supabase = createClient();

    const { data } = await supabase
      .from('tenants')
      .select('id, name, status, updated_at')
      .in('status', ['suspended', 'provisioning'])
      .order('updated_at', { ascending: false })
      .limit(10);

    if (!data || data.length === 0) return [];

    return data.map(row => ({
      id: row.id,
      title: row.status === 'suspended'
        ? `Suspended Tenant: ${row.name}`
        : `Provisioning Stalled: ${row.name}`,
      description: row.status === 'suspended'
        ? `This tenant has been suspended. Review billing or compliance.`
        : `This tenant has been in provisioning state since ${new Date(row.updated_at).toLocaleDateString()}.`,
      severity: row.status === 'suspended' ? 'critical' : 'warning',
      timestamp: row.updated_at,
    }));
  },
};
