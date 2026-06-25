import { StatCard } from '@/components/super-admin/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  ArrowRight,
  Clock,
  BookOpen,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from './_components/dashboard-charts';

// Demo data for charts until we build real aggregations
const attendanceData = [
  { day: 'Mon', rate: 94 },
  { day: 'Tue', rate: 91 },
  { day: 'Wed', rate: 96 },
  { day: 'Thu', rate: 88 },
  { day: 'Fri', rate: 93 },
  { day: 'Sat', rate: 0 },
  { day: 'Sun', rate: 0 },
];

const feeData = [
  { month: 'Jan', collected: 45000, pending: 12000 },
  { month: 'Feb', collected: 52000, pending: 8000 },
  { month: 'Mar', collected: 48000, pending: 15000 },
  { month: 'Apr', collected: 61000, pending: 6000 },
  { month: 'May', collected: 55000, pending: 10000 },
  { month: 'Jun', collected: 63000, pending: 4000 },
];

const upcomingEvents = [
  { id: '1', title: 'Mid-Term Exams Begin', date: 'Jul 1, 2026', type: 'exam' },
  { id: '2', title: 'Parent-Teacher Meeting', date: 'Jul 5, 2026', type: 'meeting' },
  { id: '3', title: 'Sports Day', date: 'Jul 12, 2026', type: 'event' },
  { id: '4', title: 'Term 2 Report Cards', date: 'Jul 20, 2026', type: 'report' },
];

export default async function SchoolDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const resolvedParams = await params;
  const tenant = resolvedParams.tenant;
  const basePath = `/${tenant}`;
  
  const supabase = await createClient();

  // 1. Get tenant details
  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;

  // 2. Fetch Aggregates
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true); // only active students

  const { count: teacherCount } = await supabase
    .from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  // 3. Fetch Recent Students
  const { data: recentStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name, is_active, admitted_at')
    .eq('tenant_id', tenantId)
    .order('admitted_at', { ascending: false })
    .limit(4);

  // 4. Fetch Attendance for today
  const today = new Date().toISOString().split('T')[0];
  const { count: attendancePresentCount } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('date', today)
    .eq('status', 'present');

  const attendanceRate = studentCount && studentCount > 0 
    ? Math.round(((attendancePresentCount || 0) / studentCount) * 100)
    : 0;

  // 5. Fetch Total Fees Collected
  const { data: feePayments } = await supabase
    .from('fee_payments')
    .select('amount')
    .eq('tenant_id', tenantId);

  const totalFeesCollected = (feePayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  const formattedFees = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalFeesCollected);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
            Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Welcome back to {tenantData?.name || 'your school'}! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/students`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={(studentCount || 0).toString()}
          icon={Users}
          trend={0}
          trendLabel="Active enrollments"
          accentColor="hsl(250, 90%, 65%)"
          delay={0}
        />
        <StatCard
          title="Total Teachers"
          value={(teacherCount || 0).toString()}
          icon={GraduationCap}
          trend={0}
          trendLabel="Active staff"
          accentColor="hsl(142, 71%, 45%)"
          delay={50}
        />
        <StatCard
          title="Attendance Today"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          trend={0}
          trendLabel={`${attendancePresentCount || 0} present`}
          accentColor="hsl(38, 92%, 50%)"
          delay={100}
        />
        <StatCard
          title="Fees Collected"
          value={formattedFees}
          icon={Wallet}
          trend={0}
          trendLabel="Total collected"
          accentColor="hsl(217, 91%, 60%)"
          delay={150}
        />
      </div>

      {/* Charts Row */}
      <DashboardCharts 
        attendanceData={attendanceData} 
        feeData={feeData} 
        basePath={basePath} 
      />

      {/* Bottom Row: Recent Students + Events */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Students */}
        <div className="xl:col-span-2 glass-card animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                Recently Admitted
              </h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                Latest student admissions
              </p>
            </div>
            <Link
              href={`${basePath}/students`}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Student', 'Class', 'Status', 'Admitted'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentStudents?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-[hsl(var(--text-tertiary))]">
                      No recent students found.
                    </td>
                  </tr>
                ) : (
                  recentStudents?.map((student) => (
                    <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{student.first_name} {student.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                          <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                          Unassigned
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={student.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                          <Clock className="w-3 h-3" />
                          {new Date(student.admitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const typeColors: Record<string, string> = {
                exam: 'bg-red-500/15 text-red-400',
                meeting: 'bg-blue-500/15 text-blue-400',
                event: 'bg-emerald-500/15 text-emerald-400',
                report: 'bg-purple-500/15 text-purple-400',
              };
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors">
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${typeColors[event.type]}`}>
                    {event.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">{event.title}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Mark Attendance', desc: 'Today\'s attendance', href: `${basePath}/attendance`, icon: CalendarCheck, color: 'emerald' },
          { label: 'Enter Grades', desc: 'Current term grades', href: `${basePath}/grades`, icon: BarChart3, color: 'accent' },
          { label: 'Manage Classes', desc: 'Sections & enrollments', href: `${basePath}/classes`, icon: BookOpen, color: 'amber' },
          { label: 'Collect Fees', desc: 'Invoices & payments', href: `${basePath}/fees`, icon: Wallet, color: 'blue' },
        ].map((action, i) => (
          <Link
            key={action.label}
            href={action.href}
            className="glass-card p-4 flex items-center gap-3 group hover:border-[hsl(var(--accent)/0.3)] transition-all animate-fade-in"
            style={{ animationDelay: `${400 + i * 50}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              action.color === 'emerald' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' :
              action.color === 'amber' ? 'bg-amber-500/10 group-hover:bg-amber-500/20' :
              action.color === 'blue' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' :
              'bg-[hsl(var(--accent)/0.1)] group-hover:bg-[hsl(var(--accent)/0.2)]'
            }`}>
              <action.icon className={`w-5 h-5 ${
                action.color === 'emerald' ? 'text-emerald-400' :
                action.color === 'amber' ? 'text-amber-400' :
                action.color === 'blue' ? 'text-blue-400' :
                'text-[hsl(var(--accent))]'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{action.label}</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))] group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
