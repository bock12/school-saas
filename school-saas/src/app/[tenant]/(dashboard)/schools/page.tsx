import { requireOrgAdmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import {
  School,
  Users,
  Globe,
  UserPlus,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { AddSchoolButton } from './_components/add-school-button';
import { AssignAdminButton } from './_components/assign-admin-button';

export default async function OrgSchoolsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const { profile, school: org } = await requireOrgAdmin(tenant);

  const supabase = await createClient();

  // Determine which org to scope to
  // An org_admin's tenant_id is the org itself; a super_admin visiting sees the current tenant
  const orgId = profile.role === 'org_admin' ? (profile.tenant_id ?? org.id) : org.id;

  const { data: schools } = await supabase
    .from('tenants')
    .select(`
      id, name, slug, status, type,
      student_count, teacher_count, created_at,
      plan_id
    `)
    .eq('parent_id', orgId)
    .eq('type', 'school')
    .order('name');

  // Fetch school admins for each school
  const schoolIds = (schools ?? []).map((s) => s.id);
  const { data: schoolAdmins } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, tenant_id')
    .in('tenant_id', schoolIds.length > 0 ? schoolIds : ['none'])
    .in('role', ['school_admin', 'org_admin']);

  const adminsBySchool = (schoolAdmins ?? []).reduce<Record<string, typeof schoolAdmins>>((acc, admin) => {
    if (!admin.tenant_id) return acc;
    if (!acc[admin.tenant_id]) acc[admin.tenant_id] = [];
    acc[admin.tenant_id]!.push(admin);
    return acc;
  }, {});

  // Org-level staff for the assign-admin picker
  const { data: orgStaff } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('tenant_id', orgId)
    .order('full_name');

  const statusConfig: Record<string, { label: string; cls: string }> = {
    active:       { label: 'Active',       cls: 'bg-emerald-500/15 text-emerald-400' },
    trial:        { label: 'Trial',        cls: 'bg-amber-500/15  text-amber-400' },
    suspended:    { label: 'Suspended',    cls: 'bg-red-500/15    text-red-400' },
    provisioning: { label: 'Provisioning', cls: 'bg-blue-500/15   text-blue-400' },
    past_due:     { label: 'Past Due',     cls: 'bg-orange-500/15 text-orange-400' },
  };

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Schools Directory</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Manage and monitor all schools within <span className="font-semibold text-[hsl(var(--text-primary))]">{org.name}</span>.
          </p>
        </div>
        <AddSchoolButton tenantSlug={tenant} orgId={orgId} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Schools',    value: (schools ?? []).length,                                              icon: School, color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Total Students',   value: (schools ?? []).reduce((s, sc) => s + (sc.student_count ?? 0), 0),  icon: Users,  color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { label: 'Total Teachers',   value: (schools ?? []).reduce((s, sc) => s + (sc.teacher_count ?? 0), 0),  icon: Users,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Schools',   value: (schools ?? []).filter(s => s.status === 'active').length,           icon: CheckCircle2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3 animate-fade-in">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schools Table */}
      <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">All Schools</h2>
          <span className="text-xs text-[hsl(var(--text-tertiary))]">{(schools ?? []).length} total</span>
        </div>

        {!schools || schools.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <School className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto opacity-40" />
            <p className="text-sm text-[hsl(var(--text-tertiary))]">No schools have been added to this organization yet.</p>
            <AddSchoolButton tenantSlug={tenant} orgId={orgId} />
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {schools.map((school, idx) => {
              const admins = adminsBySchool[school.id] ?? [];
              const status = statusConfig[school.status] ?? { label: school.status, cls: 'bg-zinc-500/15 text-zinc-400' };
              return (
                <div
                  key={school.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors animate-fade-in"
                  style={{ animationDelay: `${200 + idx * 40}ms` }}
                >
                  {/* School icon + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                      <School className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{school.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Added {new Date(school.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-tertiary))] flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{school.student_count ?? 0} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{school.teacher_count ?? 0} teachers</span>
                    </div>
                  </div>

                  {/* Admins */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {admins.length === 0 ? (
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] italic">No admin</span>
                    ) : (
                      admins.slice(0, 2).map((admin) => (
                        <div
                          key={admin.id}
                          title={`${admin.full_name} (${admin.role})`}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--info)/0.3)] flex items-center justify-center text-[9px] font-bold text-[hsl(var(--accent))]"
                        >
                          {(admin.full_name ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                      ))
                    )}
                    {admins.length > 2 && (
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))]">+{admins.length - 2}</span>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${status.cls}`}>
                    {status.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {school.slug && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ? 'https://' : 'http://'}${school.slug}.${process.env.NEXT_PUBLIC_APP_DOMAIN}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[11px] font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-3 h-3" /> Portal
                      </a>
                    )}
                    <AssignAdminButton
                      school={{ id: school.id, name: school.name, slug: school.slug }}
                      orgStaff={orgStaff ?? []}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
