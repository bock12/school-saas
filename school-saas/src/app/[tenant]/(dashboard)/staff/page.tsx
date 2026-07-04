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
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))]">
            Human Capital Management (HCM)
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Workforce recruitment tracking, live attendance integrations, and contract timelines checks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            84 Registered Staff
          </span>
        </div>
      </div>

      {/* Modern High-End KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', value: '84', sub: '48 Teachers • 36 Non-teaching', change: '+2.4%', icon: UsersRound, color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
          { label: 'Attendance (Today)', value: '95.2%', sub: '4 staff currently on leave', change: '+0.5%', icon: CalendarCheck, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' },
          { label: 'Contracts Expiring', value: '3 Contracts', sub: 'Expiring in next 30 days', change: 'Alert', icon: ClipboardList, color: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400' },
          { label: 'Vacant Roles', value: '5 Positions', sub: '2 active postings online', change: 'Hiring', icon: Briefcase, color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400' }
        ].map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${kpi.color} p-6 hover:-translate-y-1 transition-all duration-300 shadow-md`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">{kpi.label}</span>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[hsl(var(--text-primary))]">{kpi.value}</p>
              <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] pt-2 border-t border-white/5">
                <span>{kpi.sub}</span>
                <span className={`font-semibold flex items-center ${kpi.change === 'Alert' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Insights Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Charts & Graphs Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-[hsl(var(--border))] space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Workforce Mappings</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Demographics, qualification distribution, and department mappings</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1 cursor-pointer hover:underline">
                Active Term: Term 1 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Custom SVG Attendance Curve */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Weekly Workforce Attendance Ratios</p>
              <div className="h-60 w-full relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="staffCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  {/* Curved Area */}
                  <path d="M 0 140 Q 125 150 250 80 T 500 40 L 500 200 L 0 200 Z" fill="url(#staffCurveGrad)" />
                  {/* Curved Line */}
                  <path d="M 0 140 Q 125 150 250 80 T 500 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
                  {/* Nodes */}
                  <circle cx="250" cy="80" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-2">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Today (95.2%)</span>
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[hsl(var(--border))]">
              {[
                { label: 'Administration Dept', val: '21%', color: 'bg-blue-500' },
                { label: 'Science & Chemistry', val: '19%', color: 'bg-emerald-500' },
                { label: 'Operations & Maintenance', val: '35%', color: 'bg-purple-500' }
              ].map(stat => (
                <div key={stat.label} className="space-y-2">
                  <span className="text-[11px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">{stat.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                      <div className={`h-full rounded-full ${stat.color}`} style={{ width: stat.val }} />
                    </div>
                    <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{stat.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest">HCM Operations</h3>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map(act => (
              <button
                key={act.label}
                onClick={() => router.push(act.href)}
                className={`flex items-center justify-between p-4.5 rounded-2xl border text-left hover:-translate-y-0.5 hover:border-[hsl(var(--border-hover))] transition-all duration-300 ${
                  act.primary
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.2)]'
                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${act.primary ? 'bg-white/10' : 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'}`}>
                    <act.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{act.label}</p>
                    <p className={`text-[11px] mt-0.5 ${act.primary ? 'text-white/80' : 'text-[hsl(var(--text-tertiary))]'}`}>{act.desc}</p>
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
