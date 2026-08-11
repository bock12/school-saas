'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Activity, Users, BookOpen, AlertTriangle, Scale, CheckCircle2,
  Send, UserX, Shield, MessageSquare, Clock, TrendingUp, TrendingDown,
  ChevronRight, Plus, Upload, BarChart3, ScrollText, Zap,
  FileText, Stamp, Award, RefreshCw
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const defaultKpis = [
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
  { subject: 'Biology', teacher: 'Dr. Cole', class: 'SSS 2A', pct: 0, status: 'pending' },
  { subject: 'English Language', teacher: 'Mrs. Mansaray', class: 'SSS 2A', pct: 100, status: 'submitted' },
];

const quickActions = [
  { label: '+ New Exam', icon: Plus, color: 'from-violet-600 to-indigo-600', tab: 'sessions' },
  { label: 'Import Marks', icon: Upload, color: 'from-amber-500 to-orange-600', tab: 'score-entry' },
  { label: 'Generate Results', icon: Zap, color: 'from-teal-500 to-emerald-600', tab: 'validation' },
  { label: 'Publish Results', icon: Send, color: 'from-green-500 to-teal-600', tab: 'publication' },
  { label: 'Reports', icon: BarChart3, color: 'from-blue-500 to-indigo-600', tab: 'reports' },
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

  const [kpisList, setKpisList] = useState(defaultKpis);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    syncExamDatabase();
  }, [officer.tenantSlug]);

  async function syncExamDatabase() {
    setIsLoadingDb(true);
    try {
      const res = await fetch(`/api/exam-office/dashboard?tenantSlug=${officer.tenantSlug}`);
      const json = await res.json();
      if (json.success && json.data.summary) {
        const { activeCount, totalSessions, pendingModerationCount, malpracticeCount, appealsCount } = json.data.summary;
        setKpisList([
          { id: 'sessions', label: 'Active Exams', value: activeCount || 2, sub: 'Running now in DB', icon: Activity, color: 'bg-emerald-500', urgency: 'normal' },
          { id: 'sessions', label: 'Total Sessions', value: totalSessions || 4, sub: 'Configured in DB', icon: Clock, color: 'bg-blue-500', urgency: 'normal' },
          { id: 'eligibility', label: 'Candidates', value: '1,248', sub: 'Registered', icon: Users, color: 'bg-indigo-500', urgency: 'normal' },
          { id: 'missing-marks', label: 'Pending Marks', value: 32, sub: 'Subjects incomplete', icon: BookOpen, color: 'bg-amber-500', urgency: 'warn' },
          { id: 'moderation', label: 'Pending Moderation', value: pendingModerationCount || 0, sub: 'Awaiting review', icon: Scale, color: 'bg-purple-500', urgency: 'warn' },
          { id: 'validation', label: 'Results Ready', value: 6, sub: '4 classes', icon: CheckCircle2, color: 'bg-teal-500', urgency: 'normal' },
          { id: 'publication', label: 'Published Results', value: 3, sub: 'Classes released', icon: Send, color: 'bg-green-500', urgency: 'normal' },
          { id: 'hall-attendance', label: 'Absent Candidates', value: 17, sub: 'Requiring action', icon: UserX, color: 'bg-orange-500', urgency: 'warn' },
          { id: 'malpractice', label: 'Malpractice Cases', value: malpracticeCount || 0, sub: 'Open incidents in DB', icon: Shield, color: 'bg-red-500', urgency: 'critical' },
          { id: 'appeals', label: 'Pending Appeals', value: appealsCount || 0, sub: 'Awaiting review in DB', icon: MessageSquare, color: 'bg-rose-500', urgency: 'warn' },
        ]);
        setIsDbSynced(true);
      }
    } catch (err) {
      console.warn('DB Sync fallback:', err);
    } finally {
      setIsLoadingDb(false);
    }
  }

  function nav(tab: string) {
    router.push(`/${officer.tenantSlug}/exam-office?tab=${tab}`);
  }

  const marksOverall = Math.round(marksProgress.reduce((s, m) => s + m.pct, 0) / marksProgress.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Header Banner ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 sm:p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e508)', border: '1px solid #7c3aed30' }}>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[hsl(var(--text-tertiary))]">{getGreeting()}, Exam Officer</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[hsl(var(--text-primary))] mt-0.5">{officer.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 font-semibold border border-violet-500/20">
                  Examination Office
                </span>
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Admin DB Synced
                </span>
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] font-medium border border-[hsl(var(--border)/0.5)]">
                  {officer.tenantName}
                </span>
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-tertiary))] font-medium border border-[hsl(var(--border)/0.5)]">
                  {dateStr}
                </span>
              </div>
            </div>
            <button
              onClick={syncExamDatabase}
              disabled={isLoadingDb}
              className="px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} /> Refresh Admin Sync
            </button>
          </div>

          {/* Dedicated full-width single-row quick actions container */}
          <div className="w-full flex flex-nowrap items-center gap-2 overflow-x-auto pt-3 border-t border-[hsl(var(--border)/0.3)] scrollbar-none min-w-0">
            {quickActions.map((a) => (
              <button
                key={a.tab}
                onClick={() => nav(a.tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${a.color} hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-shrink-0`}
              >
                <a.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10 bg-violet-600 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-indigo-600 pointer-events-none" />
      </div>

      {/* ── Examination Lifecycle Pipeline ────────────────────────── */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <h2 className="font-black text-[hsl(var(--text-primary))] text-xs sm:text-sm">End-of-Term Examination — Lifecycle Progress</h2>
          </div>
          <span className="text-[10px] sm:text-xs text-[hsl(var(--text-tertiary))]">Academic Year 2026</span>
        </div>
        <div className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-violet-500/20">
          {lifecycleStages.map((s, i) => (
            <div key={s.stage} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center gap-1 px-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.status === 'active' ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[hsl(var(--bg-secondary))] animate-pulse' : ''} ${s.color}`} />
                <span className={`text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${s.status === 'active' ? 'text-blue-400' : s.status === 'done' ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                  {s.stage}
                </span>
              </div>
              {i < lifecycleStages.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-8 mx-0.5 sm:mx-1 flex-shrink-0 ${lifecycleStages[i + 1].status !== 'pending' ? 'bg-emerald-500' : 'bg-[hsl(var(--border))]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {kpisList.map((k) => (
          <button
            key={k.label}
            onClick={() => nav(k.id)}
            className="glass-card rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 group hover:scale-[1.02] active:scale-[0.98] transition-transform text-left"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color} ${k.urgency === 'critical' ? 'animate-pulse' : ''}`}>
              <k.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg sm:text-xl font-black text-[hsl(var(--text-primary))] leading-none">{k.value}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-[hsl(var(--text-secondary))] mt-0.5 truncate">{k.label}</p>
              <p className="text-[9px] sm:text-[10px] text-[hsl(var(--text-tertiary))] truncate">{k.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── EXAM COMMUNICATION CENTER WIDGET ───────────────────── */}
      <div className="glass-card rounded-2xl p-5 border border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[hsl(var(--border))] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))] uppercase tracking-wider">Exam Communication Center</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Gateways Live</span>
          </div>
          <button
            onClick={() => nav('communications')}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Open Communication Center <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Required */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">Action Required</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                <span className="text-red-400 font-bold">🔴 7 teachers — pending marks</span>
                <button onClick={() => nav('communications')} className="text-[10px] px-2 py-0.5 rounded bg-violet-600 text-white font-bold">Notify</button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                <span className="text-amber-400 font-bold">🟠 3 subjects — moderation pending</span>
                <button onClick={() => nav('communications')} className="text-[10px] px-2 py-0.5 rounded bg-violet-600 text-white font-bold">Notify</button>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                <span className="text-amber-400 font-bold">🟡 5 appeals — awaiting response</span>
                <button onClick={() => nav('communications')} className="text-[10px] px-2 py-0.5 rounded bg-violet-600 text-white font-bold">Notify</button>
              </div>
            </div>
          </div>

          {/* Upcoming Automated */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">Upcoming Automated</p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Tomorrow 08:00 — Exam reminder</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">142 candidates</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[hsl(var(--text-primary))]">Tomorrow 18:00 — Mark deadline reminder</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">28 teachers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-widest">Recent Dispatches</p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] flex items-center justify-between">
                <span className="font-semibold text-[hsl(var(--text-secondary))]">✓ Timetable published</span>
                <span className="text-[10px] text-emerald-400">Sent (142)</span>
              </div>
              <div className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] flex items-center justify-between">
                <span className="font-semibold text-[hsl(var(--text-secondary))]">✓ Moderation reminder</span>
                <span className="text-[10px] text-emerald-400">Read</span>
              </div>
              <div className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] flex items-center justify-between">
                <span className="font-semibold text-[hsl(var(--text-secondary))]">✓ Result approval notice</span>
                <span className="text-[10px] text-emerald-400">Read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
