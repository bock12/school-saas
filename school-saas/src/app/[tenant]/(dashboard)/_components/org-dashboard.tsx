import {
  School,
  Users,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserPlus,
  DollarSign,
  Activity,
  Clock,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/super-admin/stat-card';
import { createClient } from '@/lib/supabase/server';
import { AddSchoolButton } from '../schools/_components/add-school-button';

interface OrgDashboardProps {
  tenant: string;
  orgId: string;
  orgName: string;
}

const recentActivity = [
  { id: '1', icon: School,    text: 'Greenwood Primary School enrolled 18 new students', time: '2 hrs ago',  color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { id: '2', icon: UserPlus,  text: 'New school admin invited to Riverside Academy',    time: '5 hrs ago',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: '3', icon: DollarSign,text: 'Monthly billing processed for all 4 schools',      time: '1 day ago',  color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  { id: '4', icon: Activity,  text: 'Attendance rate org-wide: 92.4% this week',        time: '1 day ago',  color: 'text-purple-400',  bg: 'bg-purple-500/10' },
];

export async function OrgDashboard({ tenant, orgId, orgName }: OrgDashboardProps) {
  const supabase = await createClient();
  // Note: on subdomain-based routing (albert-academy.localhost),
  // the URL path is always relative to "/". The proxy handles the /[tenant] rewrite.
  // So links must be /schools, NOT /albert-academy/schools.
  const basePath = '';

  // Fetch child schools
  const { data: schools, count: schoolCount } = await supabase
    .from('tenants')
    .select('id, name, slug, status, student_count, teacher_count, created_at', { count: 'exact' })
    .eq('parent_id', orgId)
    .eq('type', 'school')
    .order('name');

  // Aggregate org-wide KPIs from child schools
  const totalStudents = (schools ?? []).reduce((s, sc) => s + (sc.student_count ?? 0), 0);
  const totalTeachers = (schools ?? []).reduce((s, sc) => s + (sc.teacher_count ?? 0), 0);

  // Org-level admins count
  const { count: adminCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', orgId)
    .in('role', ['org_admin', 'school_admin']);

  const kpis = [
    { title: 'Total Schools',   value: (schoolCount ?? 0).toString(), icon: School,   trend: 0,  trendLabel: 'Active schools',    accentColor: 'hsl(217, 91%, 60%)' },
    { title: 'Org-Wide Students', value: totalStudents.toString(),    icon: Users,    trend: 3,  trendLabel: 'Across all schools', accentColor: 'hsl(250, 90%, 65%)' },
    { title: 'Org-Wide Teachers', value: totalTeachers.toString(),    icon: Activity, trend: 1,  trendLabel: 'Active staff',       accentColor: 'hsl(142, 71%, 45%)' },
    { title: 'Administrators',   value: (adminCount ?? 0).toString(), icon: Users,    trend: 0,  trendLabel: 'Org & school admins',accentColor: 'hsl(38, 92%, 50%)'  },
  ];

  const statusColors: Record<string, string> = {
    active:       'bg-emerald-500/15 text-emerald-400',
    trial:        'bg-amber-500/15  text-amber-400',
    suspended:    'bg-red-500/15    text-red-400',
    provisioning: 'bg-blue-500/15   text-blue-400',
    past_due:     'bg-orange-500/15 text-orange-400',
  };

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Organization Dashboard</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Welcome to <span className="font-semibold text-[hsl(var(--text-primary))]">{orgName}</span>
            {' '}— here&apos;s the overview across all your schools.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`${basePath}/reports`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </Link>
          <AddSchoolButton orgId={orgId} tenantSlug={tenant} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((card, i) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            trendLabel={card.trendLabel}
            accentColor={card.accentColor}
            delay={i * 50}
          />
        ))}
      </div>

      {/* Schools list + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Schools Directory */}
        <div className="lg:col-span-2 glass-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Schools</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{schoolCount ?? 0} schools in this organization</p>
            </div>
            <Link
              href={`${basePath}/schools`}
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {!schools || schools.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <School className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto opacity-50" />
                <p className="text-sm text-[hsl(var(--text-tertiary))]">No schools provisioned yet.</p>
                <Link
                  href={`${basePath}/schools`}
                  className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--accent))] hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add your first school
                </Link>
              </div>
            ) : (
              schools.map((school) => (
                <div key={school.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                    <School className="w-4.5 h-4.5 text-[hsl(var(--accent))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{school.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-2 mt-0.5">
                      <Users className="w-3 h-3" />
                      {school.student_count ?? 0} students · {school.teacher_count ?? 0} teachers
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusColors[school.status] ?? 'bg-zinc-500/15 text-zinc-400'}`}>
                    {school.status}
                  </span>
                  {school.slug && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ? 'https://' : 'http://'}${school.slug}.${process.env.NEXT_PUBLIC_APP_DOMAIN}`}
                      className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--accent))] hover:underline flex-shrink-0"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="w-3 h-3" />
                      Portal
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div>
              <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Activity</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Organization-wide events</p>
            </div>
          </div>
          <div className="p-3 space-y-1">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors">
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[hsl(var(--text-primary))] leading-relaxed">{activity.text}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Quick Actions bar */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add School',      href: `${basePath}/schools`,    icon: School,    color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' },
            { label: 'Invite Admin',    href: `${basePath}/org-staff`,  icon: UserPlus,  color: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' },
            { label: 'View Reports',   href: `${basePath}/reports`,    icon: TrendingUp,color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' },
            { label: 'Org Settings',   href: `${basePath}/settings`,   icon: CheckCircle2, color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="glass-card p-4 flex items-center gap-3 group hover:border-[hsl(var(--border-hover))] transition-all animate-fade-in"
                style={{ animationDelay: `${400 + i * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))]">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
