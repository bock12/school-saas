'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FlaskConical, Plus, Calendar, CheckCircle2, Clock, BarChart3, Users, FileText,
  Edit2, ChevronRight, LayoutDashboard, Layers, ShieldCheck, TrendingUp, Award, ClipboardList, AlertTriangle
} from 'lucide-react';

export default function ExaminationsDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const quickActions = [
    { label: 'Create Examination', desc: 'Add new session exams', href: `/${tenant}/academics/examinations/list`, icon: FlaskConical, primary: true },
    { label: 'Generate Timetable', desc: 'Create exam rooms list', href: `/${tenant}/academics/examinations/timetable`, icon: Clock },
    { label: 'Open Marks Entry', desc: 'Secure marks entry screen', href: `/${tenant}/academics/examinations/marks`, icon: Edit2 },
    { label: 'Moderate Results', desc: 'HOD review variance check', href: `/${tenant}/academics/examinations/moderation`, icon: ClipboardList },
    { label: 'Approve Results', desc: 'Verify and sign grade registers', href: `/${tenant}/academics/examinations/approval`, icon: ShieldCheck },
    { label: 'Publish Results', desc: 'Enable student portal visibility', href: `/${tenant}/academics/examinations/publish`, icon: FileText },
    { label: 'Generate Report Cards', desc: 'Compile PDF student profiles', href: `/${tenant}/academics/examinations/report-cards`, icon: Award }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))]">
            Assessment &amp; Academic Records
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Configure assessment weight categories, digital gradebooks, multi-stage approvals, report card templates compilation, and verified transcripts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active: First Term Exams
          </span>
        </div>
      </div>

      {/* Modern High-End KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Session', value: 'First Term Exams', sub: '46/46 subjects linked', change: 'Ongoing', icon: FlaskConical, color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
          { label: 'Marks Submitted', value: '84.2%', sub: '15.8% pending (8 streams left)', change: 'Progress', icon: Edit2, color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400' },
          { label: 'Validations Queue', value: '12 Logs', sub: '4 subjects pending VP sign-off', change: 'Moderate', icon: ShieldCheck, color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400' },
          { label: 'Average GPA Result', value: '3.42 GPA', sub: '96.8% Promotion Rate', change: 'Out of 4.0', icon: Award, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' }
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
                <span className="font-semibold text-emerald-400">{kpi.change}</span>
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
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Grades &amp; Class Average Distributions</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Automated marks metrics and teacher progress checks</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1 cursor-pointer hover:underline">
                Average Class GPA: 3.42 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Custom SVG line graph */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Weekly Grading Distribution Curve</p>
              <div className="h-60 w-full relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="examsCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  {/* Curved Area */}
                  <path d="M 0 180 Q 125 60 250 120 T 500 40 L 500 200 L 0 200 Z" fill="url(#examsCurveGrad)" />
                  {/* Curved Line */}
                  <path d="M 0 180 Q 125 60 250 120 T 500 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
                  {/* Nodes */}
                  <circle cx="250" cy="120" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-2">
                  <span>Fail Range (&lt;50%)</span>
                  <span>C Grade Range (50%-69%)</span>
                  <span>B Grade Range (70%-79%)</span>
                  <span>A Grade Range (80%-100%)</span>
                </div>
              </div>
            </div>

            {/* Custom mini bar charts for statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[hsl(var(--border))]">
              {[
                { label: 'Weekly Marks Submitted', val: '84%', color: 'bg-blue-500' },
                { label: 'Promotion Passing Rate', val: '96.8%', color: 'bg-emerald-500' },
                { label: 'Transcripts Verified Codes', val: '100%', color: 'bg-purple-500' }
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
          <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Assessment Operations</h3>
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
