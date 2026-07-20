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

  const quickActions = [
    { label: 'Admit Student', desc: 'Start admissions process', href: `/admin/students/admissions`, icon: UserPlus, primary: true },
    { label: 'Import Students', desc: 'Bulk upload CSV rosters', href: `/admin/students/bulk`, icon: Upload },
    { label: 'Promote Students', desc: 'Class promotion engine', href: `/admin/students/promotions`, icon: TrendingUp },
    { label: 'Assign Class', desc: 'Bulk class allocation', href: `/admin/students/allocation`, icon: Layers },
    { label: 'Print Student ID', desc: 'Generate barcodes & ID cards', href: `/admin/students/bulk`, icon: QrCode },
    { label: 'Generate Admission #', desc: 'Auto-identity pool config', href: `/admin/students/bulk`, icon: ClipboardCheck },
    { label: 'Export Data', desc: 'Download rosters', href: `/admin/students/bulk`, icon: Download },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))]">
            Student Lifecycle Management (SLM)
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Complete student progression tracker, enrollment controls, and academic merit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>

      {/* Modern High-End KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled Students', value: totalStudents.toLocaleString(), sub: `${activeStudents} active check-ins`, change: '+4.2%', icon: Users, color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
          { label: 'New Admissions (YTD)', value: '68 Students', sub: '14 applications pending review', change: '+12%', icon: UserPlus, color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400' },
          { label: 'Alumni Directory', value: '524 Alumni', sub: '142 graduates this session', change: '+14%', icon: Award, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' },
          { label: 'Compliance Issues', value: '3 Flags', sub: 'Suspended roster accounts', change: 'Alert', icon: ShieldAlert, color: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400' }
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
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Enrollment &amp; Growth Trends</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Historical trends of new admissions vs graduations</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1 cursor-pointer hover:underline">
                Active Year: 2026 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* High-Fidelity SVG Curve */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Annual Enrollment Progress (Growth Rate)</p>
              <div className="h-60 w-full relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="enrollCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  {/* Curved Area */}
                  <path d="M 0 180 Q 125 100 250 120 T 500 40 L 500 200 L 0 200 Z" fill="url(#enrollCurveGrad)" />
                  {/* Curved Line */}
                  <path d="M 0 180 Q 125 100 250 120 T 500 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
                  {/* Nodes */}
                  <circle cx="250" cy="120" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-2">
                  <span>Term Start</span>
                  <span>Mid Term</span>
                  <span>End Term</span>
                  <span>Current (94% Promotion)</span>
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for occupancy metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[hsl(var(--border))]">
              {[
                { label: 'Class Occupancy Rate', val: '82%', color: 'bg-blue-500' },
                { label: 'Graduation Pass Rate', val: '98%', color: 'bg-emerald-500' },
                { label: 'Attendance Trends (YTD)', val: '93%', color: 'bg-purple-500' }
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
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest">SLM Operations</h3>
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
