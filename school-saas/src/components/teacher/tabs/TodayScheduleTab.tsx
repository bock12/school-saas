'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Clock, Calendar, CheckSquare, BookOpen, Users, AlertTriangle,
  CheckCircle2, ArrowRight, Play, Eye, MapPin, Sparkles,
  ChevronLeft, ChevronRight, FileText, Award, AlertCircle
} from 'lucide-react';

interface SchedulePeriod {
  period: number;
  time: string;
  subject: string;
  class: string;
  room: string;
  topic: string;
  subtopic?: string;
  studentsCount: number;
  status: 'done' | 'current' | 'upcoming';
  attendanceDone: boolean;
  lessonPlanApproved: boolean;
  homeworkAssigned?: string;
}

const daySchedules: Record<string, SchedulePeriod[]> = {
  Monday: [
    { period: 1, time: '07:30 – 08:15', subject: 'Mathematics', class: 'SS2A', room: 'Room 4', topic: 'Quadratic Polynomial Factorisation', subtopic: 'Grouping & Difference of Squares', studentsCount: 35, status: 'done', attendanceDone: true, lessonPlanApproved: true, homeworkAssigned: 'Textbook Pg 28 Q1-12' },
    { period: 2, time: '08:15 – 09:00', subject: 'Mathematics', class: 'SS2B', room: 'Lab 1', topic: 'Linear Equations & Systems', subtopic: 'Elimination Method', studentsCount: 38, status: 'current', attendanceDone: false, lessonPlanApproved: true },
    { period: 3, time: '09:15 – 10:00', subject: 'Further Maths', class: 'SS3A', room: 'Room 7', topic: 'Differential Calculus & Limits', subtopic: 'First Principles', studentsCount: 33, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 4, time: '10:00 – 10:45', subject: 'Mathematics', class: 'JS3A', room: 'Room 2', topic: 'Angles & Triangles Review', subtopic: 'Congruence & Similarity', studentsCount: 41, status: 'upcoming', attendanceDone: false, lessonPlanApproved: false },
    { period: 5, time: '12:00 – 12:45', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', topic: 'Number Bases & Conversions', subtopic: 'Base 2 to Base 10', studentsCount: 40, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
  ],
  Tuesday: [
    { period: 2, time: '08:15 – 09:00', subject: 'Further Maths', class: 'SS3A', room: 'Room 7', topic: 'Derivatives of Trigonometric Functions', studentsCount: 33, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 3, time: '09:15 – 10:00', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', topic: 'Modular Arithmetic Basics', studentsCount: 40, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 6, time: '11:00 – 11:45', subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', topic: 'Simultaneous Equations Applications', studentsCount: 35, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 9, time: '13:00 – 13:45', subject: 'Mathematics', class: 'SS2B', room: 'Room 4', topic: 'Quadratic Curves & Graphs', studentsCount: 38, status: 'upcoming', attendanceDone: false, lessonPlanApproved: false },
  ],
  Wednesday: [
    { period: 1, time: '07:30 – 08:15', subject: 'Mathematics', class: 'JS3A', room: 'Room 2', topic: 'Simple Interest & Compound Interest', studentsCount: 41, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 3, time: '09:15 – 10:00', subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', topic: 'Word Problems on Linear Systems', studentsCount: 35, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 7, time: '11:45 – 12:30', subject: 'Further Maths', class: 'SS3A', room: 'Room 7', topic: 'Integration as Reverse of Differentiation', studentsCount: 33, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 10, time: '13:45 – 14:30', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', topic: 'Set Theory & Venn Diagrams', studentsCount: 40, status: 'upcoming', attendanceDone: false, lessonPlanApproved: false },
  ],
  Thursday: [
    { period: 2, time: '08:15 – 09:00', subject: 'Mathematics', class: 'SS2B', room: 'Room 4', topic: 'Coordinate Geometry & Slopes', studentsCount: 38, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 4, time: '10:00 – 10:45', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', topic: 'Venn Diagrams 3 Sets Problem Sets', studentsCount: 40, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 6, time: '11:00 – 11:45', subject: 'Mathematics', class: 'JS3A', room: 'Room 2', topic: 'Probability of Single Events', studentsCount: 41, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 9, time: '13:00 – 13:45', subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', topic: 'Completing the Square Proofs', studentsCount: 35, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
  ],
  Friday: [
    { period: 1, time: '07:30 – 08:15', subject: 'Further Maths', class: 'SS3A', room: 'Room 7', topic: 'Definite Integrals & Area Under Curve', studentsCount: 33, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 3, time: '09:15 – 10:00', subject: 'Mathematics', class: 'SS2B', room: 'Room 4', topic: 'Distance Formula on Cartesian Plane', studentsCount: 38, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 6, time: '11:00 – 11:45', subject: 'Mathematics', class: 'SS1A', room: 'Room 9', topic: 'Weekly Revision & Quiz Review', studentsCount: 40, status: 'upcoming', attendanceDone: false, lessonPlanApproved: true },
    { period: 10, time: '13:45 – 14:30', subject: 'Mathematics', class: 'JS3A', room: 'Room 2', topic: 'Geometry Assessment Test', studentsCount: 41, status: 'upcoming', attendanceDone: false, lessonPlanApproved: false },
  ],
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function TodayScheduleTab({ teacher }: { teacher: TeacherData }) {
  const router = useRouter();
  const todayIndex = new Date().getDay();
  const defaultDay = todayIndex >= 1 && todayIndex <= 5 ? daysOfWeek[todayIndex - 1] : 'Monday';

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);

  const periods = daySchedules[selectedDay] || [];
  const completedCount = periods.filter(p => p.status === 'done').length;
  const currentPeriod = periods.find(p => p.status === 'current');
  const attendancePendingCount = periods.filter(p => !p.attendanceDone).length;

  function navigate(tab: string) {
    router.push(`/${teacher.tenantSlug}/teacher?tab=${tab}`);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              Today's Teaching Schedule
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Real-time daily classroom schedule, active lesson tracker, and direct attendance roll call actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('timetable')}
            className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[hsl(var(--accent))]" />
            <span>Switch to Weekly Matrix →</span>
          </button>
        </div>
      </div>

      {/* ── Day Switcher Toolbar ────────────────────────────── */}
      <div className="glass-card rounded-2xl p-2 border border-[hsl(var(--border))] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shadow-sm">
        <div className="flex items-center gap-1.5">
          {daysOfWeek.map(day => {
            const isSelected = selectedDay === day;
            const count = daySchedules[day]?.length || 0;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                    : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] px-3 hidden md:inline">
          {selectedDay === defaultDay ? "Showing Today's Classes" : `Viewing ${selectedDay}`}
        </span>
      </div>

      {/* ── Daily Summary KPI Strip ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Scheduled Classes</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{periods.length} Periods</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{completedCount} completed so far</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Total Students Teaching</span>
          <p className="text-2xl font-black text-emerald-400">
            {periods.reduce((acc, p) => acc + p.studentsCount, 0)} Students
          </p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Across {new Set(periods.map(p=>p.class)).size} distinct class arms</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-amber-500/5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Roll Calls Pending</span>
          <p className="text-2xl font-black text-amber-400">{attendancePendingCount} Classes</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Awaiting attendance submission</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Contact Time</span>
          <p className="text-2xl font-black text-blue-400">{periods.length * 45} Minutes</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">45-min standard period blocks</p>
        </div>
      </div>

      {/* ── Periods Stream / Actionable Cards ────────────────── */}
      <div className="space-y-4">
        {periods.map(p => {
          const isCurrent = p.status === 'current';
          const isDone = p.status === 'done';

          return (
            <div
              key={p.period}
              className={`glass-card rounded-2xl sm:rounded-3xl p-5 border transition-all shadow-sm ${
                isCurrent
                  ? 'border-emerald-500/40 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                  : isDone
                  ? 'border-[hsl(var(--border))] opacity-75'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Period & Class Badge */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]'
                  }`}>
                    <span className="text-[9px] uppercase tracking-wider">Period</span>
                    <span className="text-base leading-none">{p.period}</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[hsl(var(--text-primary))]">{p.subject}</h3>
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))]">
                        {p.class}
                      </span>
                      <span className="text-xs text-[hsl(var(--text-tertiary))] font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[hsl(var(--accent))]" /> {p.room}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          IN PROGRESS NOW
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">
                      Topic: <span className="text-[hsl(var(--text-primary))]">{p.topic}</span>
                      {p.subtopic && <span className="text-[hsl(var(--text-tertiary))] font-normal"> ({p.subtopic})</span>}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--text-tertiary))] pt-0.5">
                      <span className="font-mono">{p.time} (45 mins)</span>
                      <span>•</span>
                      <span>{p.studentsCount} Students Enrolled</span>
                      {p.homeworkAssigned && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">HW: {p.homeworkAssigned}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Center */}
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[hsl(var(--border))]">
                  {p.attendanceDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Roll Call Submitted
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('attendance')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isCurrent
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25'
                          : 'bg-[hsl(var(--accent))] hover:opacity-90 text-white'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Take Roll Call</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('lesson-plans')}
                    className="px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                    <span>Lesson Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('students')}
                    className="px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Class List</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
