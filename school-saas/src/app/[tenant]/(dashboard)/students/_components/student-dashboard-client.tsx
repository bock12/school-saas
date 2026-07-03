'use client';

import {
  Users, UserCheck, UserPlus, Clock, ShieldAlert, UserMinus, GraduationCap, Award,
  ArrowUpRight, Plus, Download, Upload, RefreshCw, QrCode, ClipboardCheck, ArrowRightLeft,
  ChevronRight, BarChart3, TrendingUp, Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface StudentDashboardClientProps {
  tenant: string;
  totalStudents: number;
  activeStudents: number;
}

export function StudentDashboardClient({ tenant, totalStudents, activeStudents }: StudentDashboardClientProps) {
  const router = useRouter();

  const kpis = [
    { label: 'Total Students', value: totalStudents, change: '+4.2%', up: true, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Active Students', value: activeStudents, change: '+3.1%', up: true, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'New Admissions', value: 68, change: '+12%', up: true, icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Pending Admissions', value: 14, change: '-2', up: false, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Suspended Students', value: 3, change: '0', up: true, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Withdrawn Students', value: 8, change: '+1', up: false, icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Graduates (YTD)', value: 142, change: '+8%', up: true, icon: GraduationCap, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Active Alumni', value: 524, change: '+14%', up: true, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Male/Female Ratio', value: '48% / 52%', subtitle: 'Balanced enrollment', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Class Capacity', value: '82%', subtitle: '168 open slots', icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'New Transfers', value: 6, change: '+2', up: true, icon: ArrowRightLeft, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  ];

  const quickActions = [
    { label: 'Admit Student', desc: 'Start admissions process', href: `/${tenant}/students/admissions`, icon: UserPlus, primary: true },
    { label: 'Import Students', desc: 'Bulk upload CSV rosters', href: `/${tenant}/students/bulk`, icon: Upload },
    { label: 'Promote Students', desc: 'Class promotion engine', href: `/${tenant}/students/promotions`, icon: TrendingUp },
    { label: 'Assign Class', desc: 'Bulk class allocation', href: `/${tenant}/students/allocation`, icon: Layers },
    { label: 'Print Student ID', desc: 'Generate barcodes & ID cards', href: `/${tenant}/students/bulk`, icon: QrCode },
    { label: 'Generate Admission #', desc: 'Auto-identity pool config', href: `/${tenant}/students/bulk`, icon: ClipboardCheck },
    { label: 'Export Data', desc: 'Download rosters', href: `/${tenant}/students/bulk`, icon: Download },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Student Lifecycle Management</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Operational dashboard and key stats for student progression stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
            System Online
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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
        {/* Charts & Graphs Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Enrollment & Growth Trends</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Historical trends of new admissions vs graduations</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Active Year: 2026 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Custom SVG line/area chart (High Performance/Zero Dep) */}
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <line x1="0" y1="200" x2="600" y2="200" stroke="hsl(var(--border))" strokeDasharray="3 3" />
                {/* Area path */}
                <path d="M 0 200 Q 100 130 200 140 T 400 60 T 600 30 L 600 200 Z" fill="url(#growthGrad)" />
                {/* Line path */}
                <path d="M 0 200 Q 100 130 200 140 T 400 60 T 600 30" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
              </svg>
              {/* Legend overlay */}
              <div className="absolute top-2 left-2 flex gap-4 bg-[hsl(var(--bg-primary)/0.6)] px-3 py-1 rounded-lg border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--accent))]" /> Student Count
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Promotion Rate (94%)
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for occupancy metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Class Occupancy Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '82%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">82%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Graduation Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '98.4%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">98%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Attendance Trends (YTD)</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '93.5%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">93%</span>
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
