'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UsersRound, Briefcase, UserPlus, Users, GraduationCap, Shield, Layers, BookOpen,
  CalendarCheck, Clock, BarChart3, DollarSign, FileText, ClipboardList, Award,
  LayoutGrid, ArrowUpRight, ChevronRight, Plus, Download, CheckSquare, Settings, AlertTriangle
} from 'lucide-react';

export default function StaffDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const kpis = [
    { label: 'Total Employees', value: 84, change: '+2.4%', up: true, icon: UsersRound, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Active Staff', value: 78, change: '+1.2%', up: true, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Teachers', value: 48, change: '0', up: true, icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Non-Teaching Staff', value: 36, change: '+2', up: true, icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Staff on Leave', value: 4, change: '-1', up: false, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'New Employees', value: 6, change: '+3', up: true, icon: UserPlus, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Contracts Expiring', value: 3, subtitle: 'Next 30 days', icon: ClipboardList, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Vacant Positions', value: 5, subtitle: '2 active postings', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Attendance Today', value: '95.2%', change: '+0.5%', up: true, icon: CalendarCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Performance Reviews Due', value: 12, subtitle: 'Annual Appraisals', icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  ];

  const quickActions = [
    { label: 'Add Staff', desc: 'Register new employee record', href: `/${tenant}/staff/employees`, icon: UserPlus, primary: true },
    { label: 'Start Recruitment', desc: 'Publish a job vacancy', href: `/${tenant}/staff/recruitment`, icon: Briefcase },
    { label: 'Assign Role', desc: 'Configure system roles', href: `/${tenant}/staff/bulk`, icon: Settings },
    { label: 'Assign Department', desc: 'Move employee structures', href: `/${tenant}/staff/departments`, icon: Layers },
    { label: 'Upload Contract', desc: 'Attach signed PDF contract', href: `/${tenant}/staff/contracts`, icon: FileText },
    { label: 'Approve Leave', desc: 'Approve leave request forms', href: `/${tenant}/staff/leave`, icon: Clock },
    { label: 'Mark Attendance', desc: 'Roster check-ins override', href: `/${tenant}/staff/attendance`, icon: CheckSquare },
    { label: 'Generate Staff ID', desc: 'Auto-identity pool config', href: `/${tenant}/staff/bulk`, icon: Award },
    { label: 'Print ID Card', desc: 'Batch ID card prints', href: `/${tenant}/staff/bulk`, icon: LayoutGrid },
    { label: 'Export Staff List', desc: 'Download rosters', href: `/${tenant}/staff/bulk`, icon: Download },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Human Capital Management (HCM)</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Workforce insights, performance trackers, and personnel recruitment logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
            Active Payroll Period: July 2026
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] tracking-wider truncate mr-2">{kpi.label}</span>
                <Icon className={`w-4 h-4 flex-shrink-0 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <p className="text-lg font-bold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                {kpi.change && (
                  <span className={`text-[10px] font-semibold flex items-center ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    <ArrowUpRight className={`w-3 h-3 ${!kpi.up && 'rotate-90'}`} />
                    {kpi.change}
                  </span>
                )}
                {kpi.subtitle && (
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{kpi.subtitle}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Insights Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Workforce Analytics</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Demographics, qualification distribution, and department mappings</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Active Term: Term 1 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Custom SVG line/area chart (High Performance/Zero Dep) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department distribution */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Staff by Department</p>
                <div className="space-y-2">
                  {[
                    { dept: 'Administration', count: 18, pct: '21%' },
                    { dept: 'Mathematics', count: 14, pct: '16%' },
                    { dept: 'Science & Chemistry', count: 16, pct: '19%' },
                    { dept: 'Finance & HR', count: 8, pct: '9%' },
                    { dept: 'Operations & Maintenance', count: 28, pct: '35%' },
                  ].map(d => (
                    <div key={d.dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{d.dept}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{d.count} ({d.pct})</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: d.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demographics distributions */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Qualifications &amp; Leave</p>
                <div className="space-y-2">
                  {[
                    { label: 'Doctorate (PhD)', count: 6, pct: '7%' },
                    { label: 'Masters (MSc/MEd)', count: 24, pct: '28%' },
                    { label: 'Bachelors (BSc/BEd)', count: 48, pct: '57%' },
                    { label: 'Diploma / Certificate', count: 6, pct: '7%' },
                  ].map(q => (
                    <div key={q.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{q.label}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{q.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-indigo-400" style={{ width: q.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Teachers vs Non-Teaching Staff</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '57%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">48/36</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Gender Distribution</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-teal-400" style={{ width: '52%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">52% F</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Leave Accrued utilization</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: '12%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickActions.map(act => (
              <button
                key={act.label}
                onClick={() => router.push(act.href)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left hover:scale-[1.01] hover:border-[hsl(var(--border-hover))] transition-all ${
                  act.primary
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.15)]'
                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <act.icon className={`w-5 h-5 ${act.primary ? 'text-white' : 'text-[hsl(var(--accent))]'}`} />
                  <div>
                    <p className="text-sm font-semibold">{act.label}</p>
                    <p className={`text-xs mt-0.5 ${act.primary ? 'text-white/80' : 'text-[hsl(var(--text-tertiary))]'}`}>{act.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${act.primary ? 'text-white/85' : 'text-[hsl(var(--text-tertiary))]'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
