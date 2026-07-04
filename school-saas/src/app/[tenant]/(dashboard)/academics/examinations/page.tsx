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

  const kpis: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
    subtitle: string;
  }[] = [
    { label: 'Active Examination', value: 'First Term Exams', icon: FlaskConical, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', subtitle: 'ongoing status' },
    { label: 'Subjects Assessed', value: '46/46', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', subtitle: 'All courses linked' },
    { label: 'Marks Submitted', value: '84.2%', icon: Edit2, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', subtitle: '32 teacher inputs' },
    { label: 'Pending Marks', value: '15.8%', icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', subtitle: '8 class streams left' },
    { label: 'Pending Moderation', value: '12 logs', icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', subtitle: 'HOD checks' },
    { label: 'Pending Approval', value: '4 subjects', icon: ShieldCheck, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', subtitle: 'VP Office review' },
    { label: 'Published Results', value: '0/1', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', subtitle: 'Draft state' },
    { label: 'Students Passed', value: 588, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', subtitle: 'Promoted check' },
    { label: 'Students Failed', value: 20, icon: AlertTriangle, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', subtitle: 'Repeat indicators' },
    { label: 'Average GPA', value: '3.42', icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', subtitle: 'Out of 4.0' }
  ];

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
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Assessment &amp; Academic Records Dashboard</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Configure assessment weight categories, digital gradebooks, multi-stage approvals, report card templates compilation, and verified transcripts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
            Active: First Term Exams
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] tracking-wider truncate mr-1">{kpi.label}</span>
                <Icon className={`w-4 h-4 flex-shrink-0 ${kpi.color}`} />
              </div>
              <div className="mt-auto space-y-0.5">
                <p className="text-base font-bold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Grades &amp; Class Average Distributions</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Automated marks metrics and teacher progress checks</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Average Class GPA: 3.42 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grade distribution */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Cumulative Grade Distributions</p>
                <div className="space-y-2">
                  {[
                    { grade: 'A Grade Range (80% - 100%)', count: 240, pct: '40%' },
                    { grade: 'B Grade Range (70% - 79%)', count: 180, pct: '30%' },
                    { grade: 'C Grade Range (50% - 69%)', count: 152, pct: '26%' },
                    { grade: 'F Fail Range (<50%)', count: 20, pct: '4%' },
                  ].map(g => (
                    <div key={g.grade} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))] truncate mr-2">{g.grade}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))] flex-shrink-0">{g.count} students</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: g.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher marking progress */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Weekly Teacher Marking Progress</p>
                <div className="space-y-2">
                  {[
                    { range: 'Fully Submitted & approved', count: 22, pct: '78%' },
                    { range: 'Submitted / pending HOD moderation', count: 4, pct: '14%' },
                    { range: 'Pending marks entry sheet', count: 2, pct: '8%' },
                  ].map(t => (
                    <div key={t.range} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{t.range}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{t.count} teachers</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: t.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Promotion Passing Rate</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '96.8%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">96.8%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Transcripts verified codes</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">100%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Audit log anomalies flags</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '0%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Quick Assessments Actions</h3>
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

