'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherData } from '../TeacherDashboardContent';
import { StaffMobileCheckinWidget } from '@/app/[tenant]/admin/staff/_components/staff-mobile-checkin-widget';
import {
  CheckSquare, FileText, Upload, ClipboardList, Calendar,
  BookOpen, MessageSquare, AlertTriangle, BarChart3, Zap,
  Clock, Users, Award, Bell, TrendingUp, BookMarked,
  ChevronRight, Play, Edit3, Eye
} from 'lucide-react';

// ── Mock data ─────────────────────────────────────────────────
const todaySchedule = [
  { period: 1, time: '7:30 – 8:15', subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', status: 'done' },
  { period: 2, time: '8:15 – 9:00', subject: 'Mathematics', class: 'SS2B', room: 'Room 4', status: 'current' },
  { period: 3, time: '9:15 – 10:00', subject: 'Further Maths', class: 'SS3A', room: 'Room 7', status: 'upcoming' },
  { period: 4, time: '10:00 – 10:45', subject: 'Mathematics', class: 'JS3A', room: 'Room 2', status: 'upcoming' },
  { period: 5, time: '12:00 – 12:45', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', status: 'upcoming' },
];

const assignedClasses = [
  { id: '1', name: 'SS2A', level: 'Senior Secondary', students: 35, attendance: 91, avgScore: 74, isFormMaster: true },
  { id: '2', name: 'SS2B', level: 'Senior Secondary', students: 38, attendance: 88, avgScore: 69, isFormMaster: false },
  { id: '3', name: 'SS3A', level: 'Senior Secondary', students: 33, attendance: 85, avgScore: 76, isFormMaster: false },
  { id: '4', name: 'JS3A', level: 'Junior Secondary', students: 41, attendance: 93, avgScore: 71, isFormMaster: false },
  { id: '5', name: 'SS1A', level: 'Senior Secondary', students: 40, attendance: 90, avgScore: 68, isFormMaster: false },
];

const quickActions = [
  { id: 'attendance', label: 'Take Attendance', icon: CheckSquare, color: 'from-teal-500 to-emerald-600', tab: 'attendance' },
  { id: 'assignments', label: 'Create Assignment', icon: FileText, color: 'from-blue-500 to-indigo-600', tab: 'assignments' },
  { id: 'materials', label: 'Upload Notes', icon: Upload, color: 'from-amber-500 to-orange-600', tab: 'materials' },
  { id: 'scores', label: 'Enter Scores', icon: ClipboardList, color: 'from-purple-500 to-violet-600', tab: 'scores' },
  { id: 'lesson-plans', label: 'Lesson Planner', icon: BookOpen, color: 'from-indigo-500 to-blue-600', tab: 'lesson-plans' },
  { id: 'schedule', label: 'View Timetable', icon: Calendar, color: 'from-cyan-500 to-teal-600', tab: 'schedule' },
  { id: 'messages', label: 'Send Message', icon: MessageSquare, color: 'from-pink-500 to-rose-600', tab: 'messages' },
  { id: 'behaviour', label: 'Behaviour Report', icon: AlertTriangle, color: 'from-orange-500 to-red-600', tab: 'behaviour' },
  { id: 'analytics', label: 'View Analytics', icon: BarChart3, color: 'from-green-500 to-emerald-600', tab: 'analytics' },
  { id: 'ai-assistant', label: 'AI Teaching Help', icon: Zap, color: 'from-yellow-500 to-amber-600', tab: 'ai-assistant' },
];

const recentActivity = [
  { icon: CheckSquare, text: 'Attendance taken for SS2A', time: '45 min ago', color: 'text-emerald-400' },
  { icon: FileText, text: 'Assignment #7 submitted by 32 students', time: '2 hrs ago', color: 'text-blue-400' },
  { icon: Award, text: 'Gradebook updated for SS3A Term 2 CA', time: '3 hrs ago', color: 'text-purple-400' },
  { icon: MessageSquare, text: 'New message from Mrs. Okafor (Parent)', time: '5 hrs ago', color: 'text-pink-400' },
  { icon: Bell, text: 'Staff meeting rescheduled to Friday 2pm', time: '1 day ago', color: 'text-amber-400' },
];

// ── Helpers ────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3 group hover:scale-[1.02] transition-transform">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-black text-[hsl(var(--text-primary))] leading-none">{value}</p>
        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">{label}</p>
        {sub && <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardTab({ teacher }: { teacher: TeacherData }) {
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<'all' | 'subject' | 'form_master' | 'hod'>('all');
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const currentPeriod = todaySchedule.find((p) => p.status === 'current');

  function navigate(tab: string) {
    router.push(`/${teacher.tenantSlug}/teacher?tab=${tab}`);
  }

  const totalStudents = assignedClasses.reduce((s, c) => s + c.students, 0);

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${teacher.primaryColor}22, ${teacher.primaryColor}08)`, border: `1px solid ${teacher.primaryColor}30` }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--text-tertiary))]">{getGreeting()},</p>
            <h1 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] mt-0.5">
              {teacher.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-semibold capitalize">
                {teacher.role.replace('_', ' ')}
              </span>
              {teacher.department && (
                <span className="text-xs text-[hsl(var(--text-tertiary))]">• {teacher.department} Department</span>
              )}
              <span className="text-xs text-[hsl(var(--text-tertiary))]">• {teacher.tenantName}</span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-2">{dateStr}</p>
          </div>
          {currentPeriod && (
            <div className="glass-card rounded-xl p-4 min-w-[200px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Now</span>
              </div>
              <p className="font-black text-[hsl(var(--text-primary))] text-sm">{currentPeriod.subject}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))]">{currentPeriod.class} · {currentPeriod.room}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{currentPeriod.time}</p>
            </div>
          )}
        </div>
        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: teacher.primaryColor }} />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: teacher.primaryColor }} />
      </div>

      {/* ── Role Focus Mode Switcher ────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl glass-card border border-[hsl(var(--border))]">
        <div className="flex items-center gap-2 px-2">
          <Award className="w-4 h-4 text-[hsl(var(--accent))]" />
          <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Workspace Focus:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'All Roles (Unified)' },
            { id: 'subject', label: '📖 Subject Teacher View' },
            { id: 'form_master', label: '🏫 Class Master (Form) View' },
            { id: 'hod', label: '👑 HOD (Dept. Head) View' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setRoleMode(m.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                roleMode === m.id
                  ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Role-Specific Focus Notice ────────────────────────── */}
      {roleMode === 'form_master' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span><strong>Class Master View Active:</strong> Focused on Form Class SS2A Attendance, Conduct & Broadsheet Reports.</span>
          </div>
          <button onClick={() => navigate('attendance')} className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold transition-colors">
            Take Form Attendance →
          </button>
        </div>
      )}

      {roleMode === 'hod' && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span><strong>Head of Department (HOD) View Active:</strong> Focused on Department Lesson Plan Approvals & Curriculum Coverage.</span>
          </div>
          <button onClick={() => navigate('lesson-plans')} className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold transition-colors">
            Review 4 Pending Plans →
          </button>
        </div>
      )}

      {/* ── Quick Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Classes Assigned" value={assignedClasses.length} icon={Users} color="bg-indigo-500" />
        <StatCard label="Subjects Teaching" value={2} icon={BookOpen} color="bg-blue-500" />
        <StatCard label="Total Students" value={totalStudents} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Pending Attendance" value={3} icon={CheckSquare} color="bg-amber-500" sub="classes today" />
        <StatCard label="Ungraded Scripts" value={15} icon={ClipboardList} color="bg-purple-500" />
        <StatCard label="Pending Tasks" value={8} icon={Bell} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left Column (wider) ──────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-base">Today's Schedule</h2>
              </div>
              <button onClick={() => navigate('schedule')} className="text-xs text-[hsl(var(--accent))] hover:underline flex items-center gap-1">
                Full Timetable <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Period', 'Time', 'Subject', 'Class', 'Room', 'Status', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {todaySchedule.map((row) => (
                    <tr
                      key={row.period}
                      className={`transition-colors ${row.status === 'current' ? 'bg-[hsl(var(--accent)/0.06)]' : 'hover:bg-[hsl(var(--bg-tertiary)/0.4)]'}`}
                    >
                      <td className="py-2.5 px-2 font-bold text-[hsl(var(--text-secondary))]">{row.period}</td>
                      <td className="py-2.5 px-2 text-[hsl(var(--text-tertiary))] whitespace-nowrap text-xs">{row.time}</td>
                      <td className="py-2.5 px-2 font-semibold text-[hsl(var(--text-primary))]">{row.subject}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] text-xs font-bold">{row.class}</span>
                      </td>
                      <td className="py-2.5 px-2 text-[hsl(var(--text-tertiary))] text-xs">{row.room}</td>
                      <td className="py-2.5 px-2">
                        {row.status === 'current' && (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                          </span>
                        )}
                        {row.status === 'done' && <span className="text-[hsl(var(--text-tertiary))] text-xs">Done</span>}
                        {row.status === 'upcoming' && <span className="text-[hsl(var(--text-tertiary))] text-xs">Up next</span>}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => navigate('attendance')} className="p-1 rounded-lg hover:bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] transition-colors" title="Take Attendance">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => navigate('lesson-plans')} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors" title="Open Lesson">
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => navigate('students')} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors" title="View Students">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-[hsl(var(--text-primary))] text-base">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.tab)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:scale-105 active:scale-95 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] text-center leading-tight group-hover:text-[hsl(var(--text-primary))] transition-colors">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────── */}
        <div className="space-y-5">
          {/* Personal Staff Mobile Check-In Widget */}
          <StaffMobileCheckinWidget
            staffName={teacher.name}
            staffId={teacher.id.substring(0, 10).toUpperCase()}
          />

          {/* Assigned Classes */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--accent))]" />
                <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">My Classes</h2>
              </div>
              <button onClick={() => navigate('classes')} className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {assignedClasses.slice(0, 4).map((cls) => (
                <div key={cls.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors cursor-pointer group" onClick={() => navigate('classes')}>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[hsl(var(--accent))]">{cls.name.substring(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-[hsl(var(--text-primary))]">{cls.name}</p>
                      {cls.isFormMaster && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">Form Master</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{cls.students} students</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${cls.attendance}%` }} />
                      </div>
                      <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{cls.attendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[hsl(var(--accent))]" />
              <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[hsl(var(--text-primary))] leading-snug">{item.text}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
