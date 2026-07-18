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
  UserCheck,
  UsersRound,
  Layers,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Trophy,
  Bell,
  Zap,
  Brain,
  FileText,
  Megaphone,
  CalendarDays,
  Activity,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from './_components/dashboard-charts';
import { OrgDashboard } from './_components/org-dashboard';

// ── Demo data for charts and feeds ───────────────────────────────
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
  { id: '1', title: 'Mid-Term Exams Begin', date: 'Jul 7, 2026', type: 'exam' },
  { id: '2', title: 'Parent-Teacher Meeting', date: 'Jul 10, 2026', type: 'meeting' },
  { id: '3', title: 'Sports Day', date: 'Jul 17, 2026', type: 'event' },
  { id: '4', title: 'Term 2 Report Cards', date: 'Jul 25, 2026', type: 'report' },
  { id: '5', title: 'Staff Training Day', date: 'Jul 28, 2026', type: 'training' },
];

const recentActivities = [
  { id: '1', icon: UserPlus, text: 'New student admission: Amara Johnson (Grade 9)', time: '5 min ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: '2', icon: DollarSign, text: 'Fee payment received from David Okafor — $850', time: '23 min ago', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: '3', icon: ClipboardList, text: 'Leave request submitted by Mr. James Mwangi', time: '1 hr ago', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: '4', icon: CheckCircle2, text: 'Grade 10A attendance marked — 93% present', time: '2 hrs ago', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: '5', icon: Bell, text: 'Announcement sent to all parents re: Sports Day', time: '3 hrs ago', color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

const quickActions = [
  { label: 'Admit Student', href: '/admissions', icon: UserPlus, color: 'emerald' },
  { label: 'Register Staff', href: '/staff', icon: UsersRound, color: 'blue' },
  { label: 'Record Payment', href: '/finance', icon: DollarSign, color: 'amber' },
  { label: 'Send Announcement', href: '/communication', icon: Megaphone, color: 'purple' },
  { label: 'Generate Report', href: '/reports', icon: FileText, color: 'teal' },
  { label: 'Mark Attendance', href: '/attendance', icon: CalendarCheck, color: 'green' },
  { label: 'Approve Requests', href: '/approvals', icon: ClipboardList, color: 'orange' },
  { label: 'Schedule Event', href: '/events', icon: CalendarDays, color: 'pink' },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Brain, color: 'indigo' },
];

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400',
  purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400',
  teal: 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-400',
  green: 'bg-green-500/10 hover:bg-green-500/20 text-green-400',
  orange: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400',
  indigo: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400',
  accent: 'bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))]',
};

export default async function SchoolDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const resolvedParams = await params;
  const tenant = resolvedParams.tenant;
  const basePath = `/${tenant}`;

  const supabase = await createClient();

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('id, name, type')
    .eq('slug', tenant)
    .single();

  const tenantId = tenantData?.id;

  // ── Branch: if this is an Organization portal, render Org Dashboard ──────
  if (tenantData?.type === 'organization') {
    return (
      <OrgDashboard
        tenant={tenant}
        orgId={tenantId ?? ''}
        orgName={tenantData.name ?? tenant}
      />
    );
  }

  // ── Below: School Dashboard (unchanged) ──────────────────────────────────
  // Parallel fetches for core KPIs
  const [
    { count: studentCount },
    { count: teacherCount },
    { data: feePayments },
    { count: attendancePresentCount },
  ] = await Promise.all([
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
    supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
    supabase.from('fee_payments').select('amount').eq('tenant_id', tenantId),
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', new Date().toISOString().split('T')[0])
      .eq('status', 'present'),
  ]);

  const { data: recentStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name, is_active, admitted_at')
    .eq('tenant_id', tenantId)
    .order('admitted_at', { ascending: false })
    .limit(5);

  const totalFeesCollected = (feePayments || []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const formattedFees = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalFeesCollected);

  const attendanceRate =
    studentCount && studentCount > 0
      ? Math.round(((attendancePresentCount || 0) / studentCount) * 100)
      : 0;

  // Demo values for KPIs not yet in DB
  const demoKpis = {
    parents: 312,
    staffAttendance: 96,
    classes: 24,
    pendingAdmissions: 17,
    pendingApprovals: 5,
    outstandingFees: 28400,
    upcomingExams: 3,
    eventsThisWeek: 2,
  };

  const kpiCards = [
    {
      title: 'Total Students',
      value: (studentCount || 0).toString(),
      icon: Users,
      trend: 4,
      trendLabel: 'Active enrollments',
      accentColor: 'hsl(250, 90%, 65%)',
    },
    {
      title: 'Total Teachers',
      value: (teacherCount || 0).toString(),
      icon: GraduationCap,
      trend: 2,
      trendLabel: 'Active staff',
      accentColor: 'hsl(142, 71%, 45%)',
    },
    {
      title: 'Total Parents',
      value: demoKpis.parents.toString(),
      icon: UserCheck,
      trend: 1,
      trendLabel: 'Registered guardians',
      accentColor: 'hsl(217, 91%, 60%)',
    },
    {
      title: 'Student Attendance',
      value: `${attendanceRate}%`,
      icon: CalendarCheck,
      trend: attendanceRate > 90 ? 2 : -3,
      trendLabel: `${attendancePresentCount || 0} present today`,
      accentColor: 'hsl(38, 92%, 50%)',
    },
    {
      title: 'Staff Attendance',
      value: `${demoKpis.staffAttendance}%`,
      icon: Activity,
      trend: 1,
      trendLabel: 'Staff present today',
      accentColor: 'hsl(168, 76%, 42%)',
    },
    {
      title: 'Total Classes',
      value: demoKpis.classes.toString(),
      icon: Layers,
      trend: 0,
      trendLabel: 'Active class sections',
      accentColor: 'hsl(280, 87%, 65%)',
    },
    {
      title: 'Pending Admissions',
      value: demoKpis.pendingAdmissions.toString(),
      icon: UserPlus,
      trend: 0,
      trendLabel: 'Awaiting review',
      accentColor: 'hsl(38, 92%, 50%)',
    },
    {
      title: 'Pending Approvals',
      value: demoKpis.pendingApprovals.toString(),
      icon: ClipboardList,
      trend: 0,
      trendLabel: 'Requires action',
      accentColor: 'hsl(0, 84%, 60%)',
    },
    {
      title: 'Fees Collected',
      value: formattedFees,
      icon: Wallet,
      trend: 12,
      trendLabel: 'Total this term',
      accentColor: 'hsl(142, 71%, 45%)',
    },
    {
      title: 'Outstanding Fees',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(demoKpis.outstandingFees),
      icon: DollarSign,
      trend: -5,
      trendLabel: 'Remaining balances',
      accentColor: 'hsl(0, 84%, 60%)',
    },
    {
      title: 'Upcoming Exams',
      value: demoKpis.upcomingExams.toString(),
      icon: BarChart3,
      trend: 0,
      trendLabel: 'Next 30 days',
      accentColor: 'hsl(250, 90%, 65%)',
    },
    {
      title: 'Events This Week',
      value: demoKpis.eventsThisWeek.toString(),
      icon: Trophy,
      trend: 0,
      trendLabel: 'Scheduled activities',
      accentColor: 'hsl(168, 76%, 42%)',
    },
  ];

  const typeColors: Record<string, string> = {
    exam: 'bg-red-500/15 text-red-400',
    meeting: 'bg-blue-500/15 text-blue-400',
    event: 'bg-emerald-500/15 text-emerald-400',
    report: 'bg-purple-500/15 text-purple-400',
    training: 'bg-amber-500/15 text-amber-400',
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Dashboard</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Welcome back to{' '}
            <span className="font-medium text-[hsl(var(--text-primary))]">
              {tenantData?.name || 'your school'}
            </span>
            ! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`${basePath}/reports`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </Link>
          <Link
            href={`${basePath}/admissions`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Admit Student</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Grid — 2 cols mobile, 3 tablet, 4 desktop, 6 xl ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpiCards.map((card, i) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            trendLabel={card.trendLabel}
            accentColor={card.accentColor}
            delay={i * 40}
          />
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <DashboardCharts
        attendanceData={attendanceData}
        feeData={feeData}
        basePath={basePath}
      />

      {/* ── Middle Row: Recent Students + Activities + Events ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recently Admitted */}
        <div className="lg:col-span-1 glass-card animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                Recent Admissions
              </h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Latest students</p>
            </div>
            <Link
              href={`${basePath}/students`}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {!recentStudents || recentStudents.length === 0 ? (
              <p className="text-center text-sm text-[hsl(var(--text-tertiary))] py-6">
                No recent admissions.
              </p>
            ) : (
              recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(student.admitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <StatusBadge status={student.is_active ? 'active' : 'inactive'} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1 glass-card animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                Recent Activity
              </h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Latest events</p>
            </div>
            <Link
              href={`${basePath}/audit-logs`}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors"
                >
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[hsl(var(--text-primary))] leading-relaxed">
                      {activity.text}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1 glass-card animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">
                Upcoming Events
              </h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">This month</p>
            </div>
            <Link
              href={`${basePath}/events`}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors"
              >
                <div
                  className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${typeColors[event.type] || 'bg-zinc-500/15 text-zinc-400'}`}
                >
                  {event.type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] leading-tight">
                    {event.title}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Assistant Teaser ─────────────────────────────────────── */}
      <div
        className="glass-card p-5 animate-fade-in relative overflow-hidden"
        style={{ animationDelay: '450ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--accent)/0.05)] to-[hsl(var(--info)/0.05)] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-[hsl(var(--accent))]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2">
              AI Administration Assistant
              <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-[10px] font-bold uppercase tracking-wider">
                Beta
              </span>
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
              Summarize attendance trends, detect at-risk students, generate reports, draft emails, forecast enrollment, and more — powered by AI.
            </p>
          </div>
          <Link
            href={`${basePath}/ai-assistant`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--info))] text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Zap className="w-4 h-4" />
            Open Assistant
          </Link>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-9 gap-3">
          {quickActions.map((action, i) => {
            const colorClass = colorMap[action.color] || colorMap.accent;
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={`${basePath}${action.href}`}
                className="glass-card p-3.5 flex flex-col items-center gap-2.5 group hover:border-[hsl(var(--border-hover))] transition-all animate-fade-in text-center"
                style={{ animationDelay: `${500 + i * 40}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] leading-tight">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
