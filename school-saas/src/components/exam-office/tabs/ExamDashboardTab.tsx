'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Activity, Users, BookOpen, AlertTriangle, Scale, CheckCircle2,
  Send, UserX, Shield, MessageSquare, Clock, TrendingUp, TrendingDown,
  ChevronRight, Plus, Upload, BarChart3, ScrollText, Zap,
  FileText, Stamp, Award,
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const kpis = [
  { id: 'sessions', label: 'Active Exams', value: 2, sub: 'Running now', icon: Activity, color: 'bg-emerald-500', urgency: 'normal' },
  { id: 'sessions', label: 'Upcoming Exams', value: 4, sub: 'Next 7 days', icon: Clock, color: 'bg-blue-500', urgency: 'normal' },
  { id: 'eligibility', label: 'Candidates', value: '1,248', sub: 'Registered', icon: Users, color: 'bg-indigo-500', urgency: 'normal' },
  { id: 'missing-marks', label: 'Pending Marks', value: 32, sub: 'Subjects incomplete', icon: BookOpen, color: 'bg-amber-500', urgency: 'warn' },
  { id: 'moderation', label: 'Pending Moderation', value: 8, sub: 'Awaiting review', icon: Scale, color: 'bg-purple-500', urgency: 'warn' },
  { id: 'validation', label: 'Results Ready', value: 6, sub: '4 classes', icon: CheckCircle2, color: 'bg-teal-500', urgency: 'normal' },
  { id: 'publication', label: 'Published Results', value: 3, sub: 'Classes released', icon: Send, color: 'bg-green-500', urgency: 'normal' },
  { id: 'hall-attendance', label: 'Absent Candidates', value: 17, sub: 'Requiring action', icon: UserX, color: 'bg-orange-500', urgency: 'warn' },
  { id: 'malpractice', label: 'Malpractice Cases', value: 2, sub: 'Open incidents', icon: Shield, color: 'bg-red-500', urgency: 'critical' },
  { id: 'appeals', label: 'Pending Appeals', value: 5, sub: 'Awaiting review', icon: MessageSquare, color: 'bg-rose-500', urgency: 'warn' },
];

const actionRequired = [
  { icon: '🔴', label: '7 Missing marks — 3 subjects haven\'t submitted scores', tab: 'missing-marks', severity: 'critical' },
  { icon: '🟠', label: '3 Moderation pending — HOD approval outstanding', tab: 'moderation', severity: 'warn' },
  { icon: '🟠', label: '2 Timetable conflicts detected — requires resolution', tab: 'timetables', severity: 'warn' },
  { icon: '🔴', label: '1 Active malpractice investigation — Physics Hall A', tab: 'malpractice', severity: 'critical' },
  { icon: '🟡', label: '5 Result appeals awaiting review', tab: 'appeals', severity: 'info' },
  { icon: '🟢', label: '12 Results ready for publication — click to publish', tab: 'publication', severity: 'ready' },
];

const todayExams = [
  { subject: 'Mathematics', class: 'SSS 2A/B/C', room: 'Hall A', time: '09:00 – 11:00', candidates: 92, invigilators: 3, status: 'ongoing' },
  { subject: 'English Language', class: 'SSS 1A/B', room: 'Hall B', time: '11:30 – 13:30', candidates: 64, invigilators: 2, status: 'upcoming' },
  { subject: 'Physics', class: 'SSS 3A', room: 'Lab 2', time: '14:00 – 16:00', candidates: 38, invigilators: 2, status: 'upcoming' },
];

const approvalQueue = [
  { class: 'SSS 1A', status: 'complete', marks: true, moderated: true, approved: false },
  { class: 'SSS 1B', status: 'complete', marks: true, moderated: true, approved: false },
  { class: 'SSS 2A', status: 'pending', marks: true, moderated: false, approved: false },
  { class: 'SSS 2B', status: 'pending', marks: false, moderated: false, approved: false },
];

const performanceStats = [
  { label: 'School Average', value: '74%', trend: 'up', prev: '71%' },
  { label: 'Pass Rate', value: '87%', trend: 'up', prev: '83%' },
  { label: 'Highest Score', value: '96%', trend: 'stable', prev: '96%' },
  { label: 'Lowest Score', value: '31%', trend: 'down', prev: '28%' },
];

const marksProgress = [
  { subject: 'Mathematics', teacher: 'Mr. Conteh', class: 'SSS 2A', pct: 100, status: 'submitted' },
  { subject: 'Physics', teacher: 'Mrs. Bangura', class: 'SSS 2A', pct: 82, status: 'partial' },
  { subject: 'Chemistry', teacher: 'Mr. Koroma', class: 'SSS 2A', pct: 63, status: 'partial' },
  { subject: 'Biology', teacher: 'Mrs. Sesay', class: 'SSS 2A', pct: 45, status: 'overdue' },
  { subject: 'English', teacher: 'Mr. Davies', class: 'SSS 2A', pct: 100, status: 'submitted' },
];

const recentActivity = [
  { icon: BookOpen, text: 'Mr. Conteh submitted Mathematics marks for SSS 2A', time: '12 min ago', color: 'text-emerald-400' },
  { icon: Scale, text: 'HOD approved Chemistry results — SSS 3A', time: '1 hr ago', color: 'text-purple-400' },
  { icon: Stamp, text: 'Principal approved SSS 1 end-of-term results', time: '3 hrs ago', color: 'text-blue-400' },
  { icon: MessageSquare, text: 'Result correction requested — John Kamara, Physics', time: '5 hrs ago', color: 'text-amber-400' },
  { icon: AlertTriangle, text: 'Malpractice incident reported — Hall A Physics exam', time: '6 hrs ago', color: 'text-red-400' },
  { icon: Send, text: 'SSS 2 results published — 128 students notified', time: '1 day ago', color: 'text-teal-400' },
];

const quickActions = [
  { label: '+ New Examination', icon: Plus, color: 'from-violet-600 to-indigo-600', tab: 'sessions' },
  { label: 'Import Marks', icon: Upload, color: 'from-amber-500 to-orange-600', tab: 'score-entry' },
  { label: 'Generate Results', icon: Zap, color: 'from-teal-500 to-emerald-600', tab: 'validation' },
  { label: 'Publish Results', icon: Send, color: 'from-green-500 to-teal-600', tab: 'publication' },
  { label: 'Generate Report', icon: BarChart3, color: 'from-blue-500 to-indigo-600', tab: 'reports' },
  { label: 'Broadsheets', icon: ScrollText, color: 'from-rose-500 to-pink-600', tab: 'broadsheets' },
];

const lifecycleStages = [
  { stage: 'Planning', status: 'done', color: 'bg-emerald-500' },
  { stage: 'Setup', status: 'done', color: 'bg-emerald-500' },
  { stage: 'Registration', status: 'done', color: 'bg-emerald-500' },
  { stage: 'Timetabled', status: 'done', color: 'bg-emerald-500' },
  { stage: 'Ongoing', status: 'active', color: 'bg-blue-500' },
  { stage: 'Marking', status: 'partial', color: 'bg-amber-500' },
  { stage: 'Moderation', status: 'pending', color: 'bg-slate-600' },
  { stage: 'Approved', status: 'pending', color: 'bg-slate-600' },
  { stage: 'Published', status: 'pending', color: 'bg-slate-600' },
  { stage: 'Archived', status: 'pending', color: 'bg-slate-600' },
];

export function ExamDashboardTab({ officer }: { officer: OfficerData }) {
  const router = useRouter();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  function nav(tab: string) {
    router.push(`/${officer.tenantSlug}/exam-office?tab=${tab}`);
  }

  const marksOverall = Math.round(marksProgress.reduce((s, m) => s + m.pct, 0) / marksProgress.length);

  return (
    <div className="space-y-6">
      {/* ── Header Banner ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e508)', border: '1px solid #7c3aed30' }}>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--text-tertiary))]">{getGreeting()}, Exam Officer</p>
            <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] mt-0.5">{officer.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-semibold">Examination Office</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">• {officer.tenantName}</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">• {dateStr}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button
                key={a.tab}
                onClick={() => nav(a.tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${a.color} hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm`}
              >
                <a.icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10 bg-violet-600" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-indigo-600" />
      </div>

      {/* ── Examination Lifecycle Pipeline ────────────────────────── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-400" />
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">End-of-Term Examination — Lifecycle Progress</h2>
          <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">Academic Year 2026</span>
        </div>
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {lifecycleStages.map((s, i) => (
            <div key={s.stage} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.status === 'active' ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[hsl(var(--bg-secondary))] animate-pulse' : ''} ${s.color}`} />
                <span className={`text-[9px] font-bold whitespace-nowrap ${s.status === 'active' ? 'text-blue-400' : s.status === 'done' ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                  {s.stage}
                </span>
              </div>
              {i < lifecycleStages.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 flex-shrink-0 ${lifecycleStages[i + 1].status !== 'pending' ? 'bg-emerald-500' : 'bg-[hsl(var(--border))]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <button
            key={k.label}
            onClick={() => nav(k.id)}
            className="glass-card rounded-2xl p-4 flex items-center gap-3 group hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color} ${k.urgency === 'critical' ? 'animate-pulse' : ''}`}>
              <k.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-[hsl(var(--text-primary))] leading-none">{k.value}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">{k.label}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{k.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Action Required ───────────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Action Required</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold">
            {actionRequired.filter(a => a.severity === 'critical' || a.severity === 'warn').length} items
          </span>
        </div>
        <div className="space-y-2">
          {actionRequired.map((a, i) => (
            <button
              key={i}
              onClick={() => nav(a.tab)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[hsl(var(--bg-tertiary)/0.6)] transition-colors text-left group"
            >
              <span className="text-base">{a.icon}</span>
              <span className="flex-1 text-xs text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] transition-colors">{a.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] flex-shrink-0 group-hover:text-[hsl(var(--accent))] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left col (2 spans) ───────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Exams */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Today's Examinations</h2>
              </div>
              <button onClick={() => nav('timetables')} className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                Full Timetable <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {todayExams.map((e) => (
                <div key={e.subject} className={`flex items-center gap-4 p-3 rounded-xl border ${e.status === 'ongoing' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary)/0.4)]'} transition-colors`}>
                  <div className="flex-shrink-0">
                    {e.status === 'ongoing' ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Next</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[hsl(var(--text-primary))]">{e.subject}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{e.class} • {e.room} • {e.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{e.candidates} candidates</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{e.invigilators} invigilators</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marks Submission Progress */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Marks Submission Status</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Overall: {marksOverall}%</span>
                <button onClick={() => nav('score-entry')} className="text-xs text-violet-400 hover:underline">View all</button>
              </div>
            </div>
            <div className="space-y-3">
              {marksProgress.map((m) => (
                <div key={m.subject} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0">
                    <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{m.subject}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{m.teacher}</p>
                  </div>
                  <div className="flex-1 h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${m.status === 'submitted' ? 'bg-emerald-500' : m.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-8 text-right flex-shrink-0 ${m.status === 'submitted' ? 'text-emerald-400' : m.status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                    {m.pct}%
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold w-16 text-center flex-shrink-0 ${m.status === 'submitted' ? 'bg-emerald-500/15 text-emerald-400' : m.status === 'overdue' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {m.status === 'submitted' ? '✓ Done' : m.status === 'overdue' ? '⚠ Overdue' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Performance Overview</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {performanceStats.map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] text-center">
                  <p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {s.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : s.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-400" /> : null}
                    <span className={`text-[10px] font-bold ${s.trend === 'up' ? 'text-emerald-400' : s.trend === 'down' ? 'text-red-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                      {s.trend !== 'stable' ? `vs ${s.prev}` : 'Unchanged'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            {/* Bar chart by class */}
            {[
              { c: 'SSS 1A', v: 78 }, { c: 'SSS 1B', v: 74 }, { c: 'SSS 2A', v: 83 }, { c: 'SSS 2B', v: 79 }, { c: 'SSS 3A', v: 71 },
            ].map((d) => (
              <div key={d.c} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))] w-12">{d.c}</span>
                <div className="flex-1 h-3 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700" style={{ width: `${d.v}%` }} />
                </div>
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))] w-8 text-right">{d.v}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right col ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Approval Queue */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-violet-400" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Approval Queue</h2>
              </div>
              <button onClick={() => nav('approval')} className="text-xs text-violet-400 hover:underline">View all</button>
            </div>
            <div className="space-y-2.5">
              {approvalQueue.map((q) => (
                <div key={q.class} className="flex items-center gap-3 p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${q.approved ? 'bg-emerald-500' : !q.marks ? 'bg-red-500' : !q.moderated ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <span className="text-xs font-bold text-[hsl(var(--text-primary))] flex-1">{q.class}</span>
                  <div className="flex gap-1">
                    <span title="Marks" className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${q.marks ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>M</span>
                    <span title="Moderated" className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${q.moderated ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>R</span>
                    <span title="Approved" className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${q.approved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-[hsl(var(--text-tertiary))]'}`}>A</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-3">M = Marks · R = Reviewed · A = Approved</p>
          </div>

          {/* RBAC Summary */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Permission Matrix</h2>
            </div>
            <div className="space-y-2 text-[10px]">
              {[
                { action: 'Enter Marks', teacher: '✅', hod: '👁', you: '👁', principal: '❌' },
                { action: 'Moderate Results', teacher: '❌', hod: '✅', you: '✅', principal: '👁' },
                { action: 'Approve Results', teacher: '❌', hod: '❌', you: '❌', principal: '✅' },
                { action: 'Publish Results', teacher: '❌', hod: '❌', you: '🔐', principal: '✅' },
                { action: 'Handle Incidents', teacher: 'Report', hod: 'Review', you: '✅', principal: 'Final' },
              ].map((r) => (
                <div key={r.action} className="grid grid-cols-5 gap-1 py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="col-span-2 text-[hsl(var(--text-secondary))] font-semibold">{r.action}</span>
                  <span className="text-center">{r.teacher}</span>
                  <span className="text-center">{r.hod}</span>
                  <span className="text-center font-bold text-violet-400">{r.you}</span>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-1 pt-1">
                <span className="col-span-2" />
                <span className="text-center text-[hsl(var(--text-tertiary))]">Teacher</span>
                <span className="text-center text-[hsl(var(--text-tertiary))]">HOD</span>
                <span className="text-center text-violet-400 font-bold">You</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[hsl(var(--accent))]" />
              <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <a.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-snug">{a.text}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
