'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherData } from '../TeacherDashboardContent';
import { StaffMobileCheckinWidget } from '@/app/[tenant]/admin/staff/_components/staff-mobile-checkin-widget';
import {
  CheckSquare, FileText, Upload, ClipboardList, Calendar,
  BookOpen, MessageSquare, AlertTriangle, BarChart3, Zap,
  Clock, Users, Award, Bell, TrendingUp, BookMarked,
  ChevronRight, Play, Edit3, Eye, CheckCircle2, X,
  AlertCircle, Target, UserCheck, Megaphone, Layers,
  LayoutDashboard, GraduationCap, Star, ArrowRight,
  UserX, Activity, Shield, Sparkles, Filter, PhoneCall
} from 'lucide-react';

// ── Mock data ──────────────────────────────────────────────────────────────────

const todaySchedule = [
  { period: 1, time: '07:30 – 08:15', subject: 'Mathematics',  class: 'SS2A', room: 'Room 4',  topic: 'Quadratic Polynomial Factorisation', status: 'done',     attendanceDone: true  },
  { period: 2, time: '08:15 – 09:00', subject: 'Mathematics',  class: 'SS2B', room: 'Lab 1',   topic: 'Linear Equations & Systems',         status: 'current',  attendanceDone: false },
  { period: 3, time: '09:15 – 10:00', subject: 'Further Maths',class: 'SS3A', room: 'Room 7',  topic: 'Differential Calculus & Limits',     status: 'upcoming', attendanceDone: false },
  { period: 4, time: '10:00 – 10:45', subject: 'Mathematics',  class: 'JS3A', room: 'Room 2',  topic: 'Angles & Triangles Review',          status: 'upcoming', attendanceDone: false },
  { period: 5, time: '12:00 – 12:45', subject: 'Mathematics',  class: 'SS1A', room: 'Room 9',  topic: 'Number Bases & Conversions',         status: 'upcoming', attendanceDone: false },
];

const assignedClasses = [
  { id: '1', name: 'SS2A', subject: 'Mathematics',   students: 35, attendance: 91, avgScore: 74, pendingAssignments: 2, nextLesson: 'Today · 12:00 PM', isFormMaster: true  },
  { id: '2', name: 'SS2B', subject: 'Mathematics',   students: 38, attendance: 88, avgScore: 69, pendingAssignments: 1, nextLesson: 'Now · Period 2',   isFormMaster: false },
  { id: '3', name: 'SS3A', subject: 'Further Maths', students: 33, attendance: 85, avgScore: 76, pendingAssignments: 3, nextLesson: 'Today · 09:15 AM', isFormMaster: false },
  { id: '4', name: 'JS3A', subject: 'Mathematics',   students: 41, attendance: 93, avgScore: 71, pendingAssignments: 0, nextLesson: 'Today · 10:00 AM', isFormMaster: false },
  { id: '5', name: 'SS1A', subject: 'Mathematics',   students: 40, attendance: 90, avgScore: 68, pendingAssignments: 2, nextLesson: 'Today · 12:00 PM', isFormMaster: false },
];

const studentAlerts = [
  { name: 'Ibrahim Kamara',   admNo: 'ADM/2024/112', class: 'SS2A', attendance: 68, avgScore: 41, level: 'critical' as const, reason: 'Attendance below 70% & failing Math tests' },
  { name: 'David Okonkwo',    admNo: 'ADM/2024/203', class: 'JS3A', attendance: 72, avgScore: 44, level: 'critical' as const, reason: '5 consecutive unexcused absences' },
  { name: 'Fatmata Sesay',    admNo: 'ADM/2024/087', class: 'SS3A', attendance: 79, avgScore: 48, level: 'warning'  as const, reason: '3 consecutive homework submissions missed' },
  { name: 'Ngozi Eze',        admNo: 'ADM/2024/056', class: 'SS2B', attendance: 83, avgScore: 52, level: 'warning'  as const, reason: 'Sudden grade decline in midterm test' },
];

const pendingTasks = [
  { id: 1, priority: 'critical' as const, title: 'Submit SS2A Marks to Exam Office',        detail: 'CA3 + Midterm scores due today by 4:00 PM',          tab: 'scores',        dueLabel: 'Due Today' },
  { id: 2, priority: 'critical' as const, title: 'Take Roll Call — SS2B (Period 2)',         detail: 'Class in progress right now (08:15 – 09:00 AM)',     tab: 'attendance',    dueLabel: 'Live Now'  },
  { id: 3, priority: 'warning'  as const, title: 'Grade 14 Assignment Submissions',          detail: 'Quadratic Equations Practice Set — SS2A',            tab: 'assignments',   dueLabel: 'Due Tomorrow' },
  { id: 4, priority: 'warning'  as const, title: 'Complete Week 3 Lesson Plan',              detail: 'Trigonometry & Elevation/Depression for SS3A',       tab: 'lesson-plans',  dueLabel: 'Due Tomorrow' },
  { id: 5, priority: 'info'     as const, title: 'Review HOD Feedback on Week 2 Unit',       detail: '2 lesson plans returned with departmental notes',     tab: 'lesson-plans',  dueLabel: 'This Week' },
];

const attendanceToday = [
  { class: 'SS2A', present: 33, total: 35, done: true  },
  { class: 'SS2B', present: 0,  total: 38, done: false },
  { class: 'SS3A', present: 0,  total: 33, done: false },
  { class: 'JS3A', present: 0,  total: 41, done: false },
  { class: 'SS1A', present: 0,  total: 40, done: false },
];

const assignmentSnapshot = [
  { title: 'Quadratic Equations HW',    class: 'SS2A', submitted: 32, total: 35, dueLabel: 'Due Today',    status: 'grading' as const },
  { title: 'Mid-Term Quiz — Algebra',   class: 'SS2B', submitted: 19, total: 38, dueLabel: 'Due Friday',   status: 'open'    as const },
  { title: 'Statistics Group Project',  class: 'SS3A', submitted: 8,  total: 33, dueLabel: 'Due Saturday', status: 'open'    as const },
];

const announcements = [
  { id: 1, priority: 'critical' as const, tag: 'Exam Office',   text: 'Examination marks submission portal closes Friday 30 August, 5:00 PM sharp.',   time: '2h ago'   },
  { id: 2, priority: 'warning'  as const, tag: 'Staff',         text: 'Mandatory general staff meeting — Thursday 3:30 PM in the School Auditorium.',   time: '5h ago'   },
  { id: 3, priority: 'info'     as const, tag: 'Department',    text: 'Mathematics moderation meeting rescheduled to Monday 9:00 AM in HOD office.',   time: '1d ago'   },
  { id: 4, priority: 'info'     as const, tag: 'Admin',         text: 'Sports Day registration for students & staff is now open with PE coordinators.', time: '2d ago'   },
];

const quickActions = [
  { id: 'attendance',  label: 'Take Attendance',    icon: CheckSquare,    color: 'bg-emerald-500', tab: 'attendance'  },
  { id: 'scores',      label: 'Enter Marks',         icon: ClipboardList,  color: 'bg-purple-500',  tab: 'scores'      },
  { id: 'assignments', label: 'Create Task',         icon: FileText,       color: 'bg-blue-500',    tab: 'assignments' },
  { id: 'lesson-plans',label: 'Lesson Planner',      icon: BookOpen,       color: 'bg-indigo-500',  tab: 'lesson-plans'},
  { id: 'students',    label: 'My Students',         icon: Users,          color: 'bg-cyan-500',    tab: 'students'    },
  { id: 'behaviour',   label: 'Record Behaviour',    icon: AlertTriangle,  color: 'bg-orange-500',  tab: 'behaviour'   },
  { id: 'messages',    label: 'Send Message',         icon: MessageSquare,  color: 'bg-pink-500',    tab: 'messages'    },
  { id: 'materials',   label: 'Upload Resource',      icon: Upload,         color: 'bg-amber-500',   tab: 'materials'   },
  { id: 'ai-assistant',label: 'AI Teaching Help',    icon: Zap,            color: 'bg-yellow-500',  tab: 'ai-assistant'},
  { id: 'analytics',   label: 'View Analytics',      icon: BarChart3,      color: 'bg-teal-500',    tab: 'analytics'   },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const priorityConfig = {
  critical: { dot: 'bg-rose-500',   badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',   icon: 'text-rose-400' },
  warning:  { dot: 'bg-amber-500',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: 'text-amber-400' },
  info:     { dot: 'bg-blue-500',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',    icon: 'text-blue-400' },
};

export function DashboardTab({ teacher }: { teacher: TeacherData }) {
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<'all' | 'subject' | 'form_master' | 'hod'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent' | 'pending'>('all');
  const [dismissedTasks, setDismissedTasks] = useState<number[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>([]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const currentPeriod = todaySchedule.find(p => p.status === 'current');
  const upcomingPeriod = todaySchedule.find(p => p.status === 'upcoming');

  const totalStudents = assignedClasses.reduce((s, c) => s + c.students, 0);
  const attendancePending = attendanceToday.filter(a => !a.done).length;
  const marksPending = 8;
  const assignmentsToGrade = 14;
  const unreadMessages = 4;

  const activeTasks = pendingTasks
    .filter(t => !dismissedTasks.includes(t.id))
    .filter(t => {
      if (taskFilter === 'urgent') return t.priority === 'critical';
      if (taskFilter === 'pending') return t.priority !== 'critical';
      return true;
    });

  const criticalCount = pendingTasks.filter(t => !dismissedTasks.includes(t.id) && t.priority === 'critical').length;

  function navigate(tab: string) {
    router.push(`/${teacher.tenantSlug}/teacher?tab=${tab}`);
  }

  return (
    <div className="space-y-5 pb-16 animate-fade-in w-full max-w-[1600px] mx-auto">

      {/* ════════════════════════════════════════════════════════════
          WELCOME BANNER + LIVE PERIOD COMMAND CARD
      ════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden border shadow-sm transition-all"
        style={{
          background: `linear-gradient(135deg, ${teacher.primaryColor}14, ${teacher.primaryColor}04)`,
          borderColor: `${teacher.primaryColor}28`,
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
          {/* Identity Info */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-md shrink-0 ring-2 ring-white/10"
              style={{ background: `linear-gradient(135deg, ${teacher.primaryColor}, ${teacher.primaryColor}cc)` }}
            >
              {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">{getGreeting()},</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Term 2 Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] mt-0.5 truncate tracking-tight">
                {teacher.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 text-xs text-[hsl(var(--text-secondary))]">
                <span
                  className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize border shrink-0"
                  style={{ background: `${teacher.primaryColor}18`, color: teacher.primaryColor, borderColor: `${teacher.primaryColor}35` }}
                >
                  {teacher.role.replace('_', ' ')}
                </span>
                {teacher.department && (
                  <span className="text-[11px] text-[hsl(var(--text-tertiary))] hidden sm:inline">
                    • {teacher.department} Dept.
                  </span>
                )}
                <span className="text-[11px] text-[hsl(var(--text-tertiary))]">
                  • {dateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Live Action Widget */}
          {currentPeriod ? (
            <div className="glass-card rounded-2xl p-3.5 sm:p-4 min-w-full sm:min-w-[280px] lg:min-w-[300px] border border-emerald-500/25 bg-emerald-500/10 shadow-sm shrink-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Now · Period {currentPeriod.period}</span>
                </div>
                <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{currentPeriod.time}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-black text-[hsl(var(--text-primary))] text-base truncate">{currentPeriod.subject}</p>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                  {currentPeriod.class}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">{currentPeriod.room} • {currentPeriod.topic}</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-emerald-500/20">
                <button
                  onClick={() => navigate('attendance')}
                  className="flex-1 py-2 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all cursor-pointer shadow-md shadow-emerald-500/25 text-center flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Take Attendance</span>
                </button>
                <button
                  onClick={() => navigate('lesson-plans')}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer shrink-0"
                  title="Open Lesson Plan"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : upcomingPeriod ? (
            <div className="glass-card rounded-2xl p-3.5 sm:p-4 min-w-full sm:min-w-[280px] lg:min-w-[300px] border border-blue-500/25 bg-blue-500/10 shadow-sm shrink-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Up Next · Period {upcomingPeriod.period}</span>
                </div>
                <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{upcomingPeriod.time}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-black text-[hsl(var(--text-primary))] text-base truncate">{upcomingPeriod.subject}</p>
                <span className="text-xs font-black text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                  {upcomingPeriod.class}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">{upcomingPeriod.room} • {upcomingPeriod.topic}</p>
              <button
                onClick={() => navigate('schedule')}
                className="w-full mt-3 py-2 text-xs font-black rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer text-center"
              >
                View Full Timetable →
              </button>
            </div>
          ) : null}
        </div>

        {/* Decorative background orbs */}
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full opacity-[0.06] pointer-events-none" style={{ background: teacher.primaryColor }} />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full opacity-[0.06] pointer-events-none" style={{ background: teacher.primaryColor }} />
      </div>

      {/* ════════════════════════════════════════════════════════════
          ACTIONABLE KPI STRIP — 6 RESPONSIVE STAT CARDS
      ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
        {[
          { label: "Today's Classes",      value: todaySchedule.length, sub: `${todaySchedule.filter(p=>p.status==='done').length} completed`, icon: Calendar,      color: 'bg-indigo-500',  tab: 'schedule',    urgent: false },
          { label: 'Attendance Pending',   value: attendancePending,    sub: `${attendancePending} awaiting roll`, icon: CheckSquare,   color: 'bg-amber-500',   tab: 'attendance',  urgent: attendancePending > 0 },
          { label: 'Marks Pending',        value: marksPending,         sub: 'awaiting submission',   icon: ClipboardList, color: 'bg-purple-500',  tab: 'scores',      urgent: marksPending > 0 },
          { label: 'Assignments to Grade', value: assignmentsToGrade,   sub: 'student submissions',   icon: FileText,      color: 'bg-blue-500',    tab: 'assignments', urgent: false },
          { label: 'Unread Messages',      value: unreadMessages,       sub: 'parents & department',  icon: MessageSquare, color: 'bg-pink-500',    tab: 'messages',    urgent: false },
          { label: 'Pending Tasks',        value: criticalCount,        sub: `${pendingTasks.length} total tasks`, icon: Bell,        color: 'bg-rose-500',    tab: 'schedule',    urgent: criticalCount > 0 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => card.tab ? navigate(card.tab) : undefined}
              className={`glass-card rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 group hover:scale-[1.02] active:scale-[0.98] transition-all text-left cursor-pointer border shadow-sm ${
                card.urgent ? 'border-rose-500/35 bg-rose-500/5' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)]'
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-lg sm:text-xl font-black leading-none ${card.urgent ? 'text-rose-400' : 'text-[hsl(var(--text-primary))]'}`}>
                  {card.value}
                </p>
                <p className="text-[11px] font-bold text-[hsl(var(--text-primary))] mt-1 truncate">{card.label}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{card.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════
          ROLE WORKSPACE SELECTOR RAIL
      ════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl glass-card border border-[hsl(var(--border))] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          <LayoutDashboard className="w-4 h-4 text-[hsl(var(--accent))]" />
          <span className="text-xs font-bold text-[hsl(var(--text-secondary))] hidden md:inline">Adaptive Focus:</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'all',         label: '🎯 Unified View',       badge: `${assignedClasses.length} Classes` },
            { id: 'subject',     label: '📖 Subject Teacher',    badge: 'Math & Calculus' },
            { id: 'form_master', label: '🏫 Form Master (SS2A)', badge: '35 Students' },
            { id: 'hod',         label: '👑 HOD (Dept. Head)',   badge: '4 Pending Reviews' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setRoleMode(m.id as typeof roleMode)}
              className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                roleMode === m.id
                  ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <span>{m.label}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full hidden sm:inline ${
                roleMode === m.id ? 'bg-white/20 text-white' : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))]'
              }`}>
                {m.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          ADAPTIVE ROLE ACTION BANNERS
      ════════════════════════════════════════════════════════════ */}
      {roleMode === 'form_master' && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-300">Form Class Master — Senior Secondary 2A (SS2A)</p>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                35 total enrolled students • 2 students flagged with attendance concerns • 1 parent inquiry pending review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('attendance')} className="px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 text-xs font-black transition-colors cursor-pointer border border-amber-500/40 shadow-sm">
              Form Attendance →
            </button>
            <button onClick={() => navigate('students')} className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-bold transition-colors cursor-pointer border border-amber-500/25">
              Class Roster
            </button>
          </div>
        </div>
      )}

      {roleMode === 'hod' && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-purple-300">Head of Department (HOD) — Mathematics &amp; Sciences</p>
              <p className="text-xs text-purple-300/80 mt-0.5 leading-relaxed">
                4 weekly lesson plans awaiting your moderation • 2 department teachers have unsubmitted CA continuous assessments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('lesson-plans')} className="px-3.5 py-2 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 text-xs font-black transition-colors cursor-pointer border border-purple-500/40 shadow-sm">
              Review 4 Lesson Plans →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MAIN RESPONSIVE 12-COLUMN GRID
      ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT / MAIN WORKSTATION COLUMN (8 of 12 cols on desktop) ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">

          {/* 1. TODAY'S TEACHING SCHEDULE */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-black text-[hsl(var(--text-primary))] text-sm sm:text-base">Today's Teaching Schedule</h2>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                    {todaySchedule.filter(p=>p.status==='done').length} Completed • {todaySchedule.filter(p=>p.status!=='done').length} Remaining Today
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('schedule')}
                className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Table View (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)] text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-3">Subject &amp; Topic</th>
                    <th className="py-3 px-3">Class / Room</th>
                    <th className="py-3 px-3">Roll Call Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {todaySchedule.map(row => {
                    const isCurrent = row.status === 'current';
                    const isDone = row.status === 'done';

                    return (
                      <tr
                        key={row.period}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/8 font-semibold'
                            : isDone
                            ? 'opacity-60 hover:opacity-80'
                            : 'hover:bg-[hsl(var(--bg-tertiary)/0.3)]'
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                              isCurrent ? 'bg-emerald-500 text-white shadow-sm' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
                            }`}>
                              {row.period}
                            </span>
                            <span className="font-mono text-[11px] text-[hsl(var(--text-tertiary))]">{row.time}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE
                              </span>
                            )}
                            <span className="font-black text-sm text-[hsl(var(--text-primary))]">{row.subject}</span>
                          </div>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))] truncate max-w-[200px] mt-0.5">{row.topic}</p>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-xs font-mono font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] px-2 py-0.5 rounded-md text-[hsl(var(--text-primary))]">
                            {row.class}
                          </span>
                          <span className="text-[11px] text-[hsl(var(--text-tertiary))] ml-1.5">{row.room}</span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {row.attendanceDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Roll Taken
                            </span>
                          ) : !isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              <AlertCircle className="w-3 h-3" /> Roll Pending
                            </span>
                          ) : (
                            <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Completed</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isCurrent ? (
                              <button
                                onClick={() => navigate('attendance')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Take Roll</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate('attendance')}
                                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-pointer"
                                  title="Take Attendance"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => navigate('lesson-plans')}
                                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-blue-400 hover:border-blue-500/30 transition-colors cursor-pointer"
                                  title="View Lesson Plan"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View (sm:hidden) */}
            <div className="sm:hidden divide-y divide-[hsl(var(--border)/0.5)]">
              {todaySchedule.map(row => {
                const isCurrent = row.status === 'current';
                const isDone = row.status === 'done';

                return (
                  <div key={row.period} className={`p-4 space-y-3 ${isCurrent ? 'bg-emerald-500/8' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${
                          isCurrent ? 'bg-emerald-500 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'
                        }`}>
                          P{row.period}
                        </span>
                        <span className="font-mono text-xs text-[hsl(var(--text-tertiary))]">{row.time}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          LIVE NOW
                        </span>
                      ) : row.attendanceDone ? (
                        <span className="text-[10px] font-bold text-emerald-400">✓ Roll Done</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400">⚠ Roll Pending</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">{row.subject}</h4>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                          {row.class} • {row.room}
                        </span>
                      </div>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{row.topic}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => navigate('attendance')}
                        className="flex-1 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Take Roll Call</span>
                      </button>
                      <button
                        onClick={() => navigate('lesson-plans')}
                        className="px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                      >
                        Lesson
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PENDING TASKS WORKBENCH */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-black text-[hsl(var(--text-primary))] text-sm sm:text-base">Pending Tasks &amp; Actions</h2>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                    {criticalCount} Critical Items Awaiting Completion
                  </p>
                </div>
              </div>

              {/* Task filter tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))] self-start sm:self-auto">
                {[
                  { id: 'all', label: 'All Tasks' },
                  { id: 'urgent', label: '🔴 Urgent' },
                  { id: 'pending', label: '🟡 General' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTaskFilter(f.id as typeof taskFilter)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      taskFilter === f.id
                        ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {activeTasks.map(task => {
                const conf = priorityConfig[task.priority];
                return (
                  <div
                    key={task.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 sm:py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors group ${
                      task.priority === 'critical' ? 'bg-rose-500/4' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${conf.dot} ${task.priority === 'critical' ? 'animate-pulse' : ''}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-bold text-[hsl(var(--text-primary))]">{task.title}</p>
                          <span className={`text-[9px] font-black px-2 py-0.2 rounded-full border ${conf.badge}`}>
                            {task.dueLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{task.detail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {task.tab && (
                        <button
                          onClick={() => navigate(task.tab)}
                          className="px-3.5 py-1.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <span>Execute</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDismissedTasks(p => [...p, task.id])}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer"
                        title="Dismiss task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeTasks.length === 0 && (
                <div className="py-10 text-center space-y-2">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-400">All caught up! No pending tasks.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. ATTENDANCE PULSE & CLASS PERFORMANCE METERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Attendance Today Widget */}
            <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Class Attendance Today</h3>
                </div>
                <button onClick={() => navigate('attendance')} className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer flex items-center gap-0.5">
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {attendanceToday.map(item => (
                  <div key={item.class} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[hsl(var(--text-primary))] w-12 shrink-0">{item.class}</span>
                    {item.done ? (
                      <>
                        <div className="flex-1 h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400 transition-all"
                            style={{ width: `${Math.round((item.present / item.total) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 shrink-0 w-20 text-right font-mono">
                          {item.present}/{item.total} (94%)
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 h-2 rounded-full bg-[hsl(var(--bg-tertiary))]" />
                        <button
                          onClick={() => navigate('attendance')}
                          className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0"
                        >
                          Take Roll
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Performance Distribution */}
            <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Class Academic Averages</h3>
                </div>
                <button onClick={() => navigate('analytics')} className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer flex items-center gap-0.5">
                  <span>Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {assignedClasses.map(cls => (
                  <div key={cls.id} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[hsl(var(--text-primary))] w-12 shrink-0">{cls.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cls.avgScore >= 75 ? 'bg-emerald-400' : cls.avgScore >= 55 ? 'bg-blue-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${cls.avgScore}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold font-mono shrink-0 w-12 text-right ${
                      cls.avgScore >= 75 ? 'text-emerald-400' : cls.avgScore >= 55 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {cls.avgScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. ASSIGNMENTS SUBMISSION SNAPSHOT */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))]">Assignments &amp; Submissions Snapshot</h3>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Track active homework and synchronize continuous assessment</p>
                </div>
              </div>
              <button onClick={() => navigate('assignments')} className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 divide-x divide-[hsl(var(--border))] border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)]">
              {[
                { label: 'Active Submissions', value: 3,  color: 'text-blue-400' },
                { label: 'Needs Grading',      value: 14, color: 'text-amber-400' },
                { label: 'Past Deadline',      value: 1,  color: 'text-rose-400'  },
              ].map(s => (
                <div key={s.label} className="py-3 px-2 text-center">
                  <p className={`text-base sm:text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium truncate mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {assignmentSnapshot.map((a, i) => {
                const pct = Math.round((a.submitted / a.total) * 100);
                return (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[hsl(var(--text-primary))] truncate">{a.title}</span>
                        <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded-md font-mono shrink-0">
                          {a.class}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden max-w-xs">
                          <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[hsl(var(--text-tertiary))] font-mono">{a.submitted}/{a.total} ({pct}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        a.dueLabel === 'Due Today'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]'
                      }`}>
                        {a.dueLabel}
                      </span>
                      {a.status === 'grading' && (
                        <button
                          onClick={() => navigate('assignments')}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-black hover:bg-amber-500/25 transition-colors cursor-pointer"
                        >
                          Grade Scripts
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 of 12 cols on desktop) ── */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">

          {/* 1. QUICK ACTIONS GRID */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Quick Teaching Workflows</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => navigate(action.tab)}
                    className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] transition-all cursor-pointer group text-left shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-xl ${action.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] transition-colors leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MY ASSIGNED CLASSES */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--accent))]" />
                <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">My Classes</h3>
              </div>
              <button onClick={() => navigate('classes')} className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {assignedClasses.map(cls => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => navigate('classes')}
                  className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-[hsl(var(--bg-tertiary)/0.6)] border border-transparent hover:border-[hsl(var(--border))] transition-all cursor-pointer group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] font-black flex items-center justify-center shrink-0 text-xs">
                    {cls.name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-black text-[hsl(var(--text-primary))]">{cls.name}</p>
                      {cls.isFormMaster && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20 shrink-0">
                          Form Master
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">{cls.subject} • {cls.students} Students</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${cls.attendance}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono shrink-0">{cls.attendance}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. AT-RISK STUDENT INTERVENTIONS */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Student Alerts &amp; Welfare</h3>
              </div>
              <button onClick={() => navigate('students')} className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer">
                All Students
              </button>
            </div>

            <div className="space-y-2.5">
              {studentAlerts.map((s, i) => (
                <div key={i} className={`p-3 rounded-2xl border transition-all ${
                  s.level === 'critical'
                    ? 'bg-rose-500/5 border-rose-500/25'
                    : 'bg-amber-500/5 border-amber-500/25'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <UserX className={`w-4 h-4 shrink-0 mt-0.5 ${s.level === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-black text-[hsl(var(--text-primary))] truncate">{s.name}</p>
                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] shrink-0">
                          {s.class}
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5 leading-snug">{s.reason}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                        <span className="text-[hsl(var(--text-tertiary))]">Attendance: <strong className={s.attendance < 75 ? 'text-rose-400' : 'text-amber-400'}>{s.attendance}%</strong></span>
                        <span className="text-[hsl(var(--text-tertiary))]">Average: <strong className={s.avgScore < 45 ? 'text-rose-400' : 'text-amber-400'}>{s.avgScore}%</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. SCHOOL & DEPARTMENT ANNOUNCEMENTS */}
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-[hsl(var(--accent))]" />
              <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Noticeboard &amp; Circulars</h3>
            </div>

            <div className="space-y-2.5">
              {announcements.filter(a => !dismissedAnnouncements.includes(a.id)).map(ann => {
                const conf = priorityConfig[ann.priority];
                return (
                  <div key={ann.id} className={`p-3 rounded-2xl border group transition-all ${
                    ann.priority === 'critical'
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : ann.priority === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'border-[hsl(var(--border))]'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${conf.badge} shrink-0`}>
                            {ann.tag}
                          </span>
                          <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{ann.time}</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-primary))] leading-relaxed">{ann.text}</p>
                      </div>
                      <button
                        onClick={() => setDismissedAnnouncements(p => [...p, ann.id])}
                        className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. PERSONAL STAFF MOBILE CHECK-IN WIDGET */}
          <StaffMobileCheckinWidget
            staffName={teacher.name}
            staffId={teacher.id.substring(0, 10).toUpperCase()}
          />
        </div>
      </div>
    </div>
  );
}
