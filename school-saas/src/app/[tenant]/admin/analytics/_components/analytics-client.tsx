'use client';

import { useMemo } from 'react';
import { School, Users, CheckCircle2, XCircle, BarChart3, TrendingUp } from 'lucide-react';

interface SchoolRow {
  id: string;
  name: string;
  status: string;
  student_count: number | null;
  teacher_count: number | null;
  created_at: string;
}

interface AnalyticsClientProps {
  schools: SchoolRow[];
  roleCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  activeCount: number;
  inactiveCount: number;
  orgName: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  org_admin:    { label: 'Org Admin',    color: '#6366f1' },
  school_admin: { label: 'School Admin', color: '#3b82f6' },
  teacher:      { label: 'Teacher',      color: '#10b981' },
  student:      { label: 'Student',      color: '#8b5cf6' },
  parent:       { label: 'Parent',       color: '#f59e0b' },
  super_admin:  { label: 'Super Admin',  color: '#ec4899' },
};

const STATUS_COLORS: Record<string, { bar: string; text: string }> = {
  active:       { bar: 'bg-emerald-500', text: 'text-emerald-400' },
  trial:        { bar: 'bg-amber-500',   text: 'text-amber-400' },
  suspended:    { bar: 'bg-red-500',     text: 'text-red-400' },
  provisioning: { bar: 'bg-blue-500',    text: 'text-blue-400' },
  past_due:     { bar: 'bg-orange-500',  text: 'text-orange-400' },
};

function BarChartSimple({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))]">
      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function AnalyticsClient({
  schools, roleCounts, statusCounts, activeCount, inactiveCount, orgName
}: AnalyticsClientProps) {
  const totalUsers = activeCount + inactiveCount;
  const totalStudents = schools.reduce((s, sc) => s + (sc.student_count ?? 0), 0);
  const totalTeachers = schools.reduce((s, sc) => s + (sc.teacher_count ?? 0), 0);

  const roleEntries = useMemo(() => Object.entries(roleCounts)
    .filter(([k]) => k !== 'super_admin' || roleCounts[k]! > 0)
    .sort((a, b) => b[1] - a[1]), [roleCounts]);
  
  const maxRoleCount = Math.max(...roleEntries.map(([, v]) => v), 1);
  const maxStudentCount = Math.max(...schools.map(s => s.student_count ?? 0), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Schools',   value: schools.length, icon: School,       color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Total Students',  value: totalStudents,  icon: Users,        color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { label: 'Total Teachers',  value: totalTeachers,  icon: TrendingUp,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Users',     value: totalUsers,     icon: BarChart3,    color: 'text-amber-400',   bg: 'bg-amber-500/10' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-5 flex items-center gap-4 animate-fade-in">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{card.value.toLocaleString()}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown by Role */}
        <div className="glass-card p-6 space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Users by Role</h2>
          {roleEntries.length === 0 ? (
            <p className="text-xs text-[hsl(var(--text-tertiary))]">No user data available yet.</p>
          ) : roleEntries.map(([role, count]) => {
            const cfg = ROLE_LABELS[role] ?? { label: role, color: '#6b7280' };
            return (
              <div key={role} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-primary))]">{cfg.label}</span>
                  <span className="text-xs font-bold" style={{ color: cfg.color }}>{count}</span>
                </div>
                <BarChartSimple value={count} max={maxRoleCount} color={cfg.color} />
              </div>
            );
          })}
          <div className="pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{activeCount} Active</span>
            <span className="flex items-center gap-1.5 text-zinc-400"><XCircle className="w-3.5 h-3.5" />{inactiveCount} Inactive</span>
          </div>
        </div>

        {/* School Status Breakdown */}
        <div className="glass-card p-6 space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Schools by Status</h2>
          {Object.entries(statusCounts).length === 0 ? (
            <p className="text-xs text-[hsl(var(--text-tertiary))]">No schools added yet.</p>
          ) : Object.entries(statusCounts).map(([status, count]) => {
            const cfg = STATUS_COLORS[status] ?? { bar: 'bg-zinc-500', text: 'text-zinc-400' };
            const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0;
            return (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-primary))] capitalize">{status}</span>
                  <span className={`text-xs font-bold ${cfg.text}`}>{count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[hsl(var(--bg-tertiary))]">
                  <div className={`h-2 rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Schools by Students */}
        <div className="glass-card p-6 space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Top Schools by Students</h2>
          {schools.length === 0 ? (
            <p className="text-xs text-[hsl(var(--text-tertiary))]">No schools added yet.</p>
          ) : [...schools].sort((a, b) => (b.student_count ?? 0) - (a.student_count ?? 0)).slice(0, 6).map(school => (
            <div key={school.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--text-primary))] truncate max-w-[150px]" title={school.name}>{school.name}</span>
                <span className="text-xs font-bold text-[hsl(var(--accent))]">{school.student_count ?? 0}</span>
              </div>
              <BarChartSimple value={school.student_count ?? 0} max={maxStudentCount} color="hsl(250, 90%, 65%)" />
            </div>
          ))}
        </div>
      </div>

      {/* School Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">School-by-School Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['School Name', 'Status', 'Students', 'Teachers', 'Added'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-[hsl(var(--text-secondary))]">No schools in this organization yet.</td>
                </tr>
              ) : schools.map(school => {
                const stCfg = STATUS_COLORS[school.status] ?? { text: 'text-zinc-400', bar: '' };
                return (
                  <tr key={school.id} className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                          <School className="w-4 h-4 text-[hsl(var(--accent))]" />
                        </div>
                        <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{school.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold capitalize ${stCfg.text}`}>{school.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--text-primary))]">{(school.student_count ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--text-primary))]">{(school.teacher_count ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">
                      {new Date(school.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
