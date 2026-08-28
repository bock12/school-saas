'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Clock, Calendar, BookOpen, ChevronLeft, ChevronRight,
  Printer, Download, MapPin, Users, Coffee
} from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
  { id: 1, label: 'Period 1', time: '07:30 – 08:15' },
  { id: 2, label: 'Period 2', time: '08:15 – 09:00' },
  { id: 3, label: 'Period 3', time: '09:15 – 10:00' },
  { id: 4, label: 'Period 4', time: '10:00 – 10:45' },
  { id: 5, label: 'Short Break', time: '10:45 – 11:00' },
  { id: 6, label: 'Period 5', time: '11:00 – 11:45' },
  { id: 7, label: 'Period 6', time: '11:45 – 12:30' },
  { id: 8, label: 'Lunch Break', time: '12:30 – 13:00' },
  { id: 9, label: 'Period 7', time: '13:00 – 13:45' },
  { id: 10, label: 'Period 8', time: '13:45 – 14:30' },
];

const timetableMatrix: Record<string, Record<number, { subject: string; class: string; room: string; color: string } | null>> = {
  Monday: {
    1: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    2: { subject: 'Mathematics', class: 'SS2B', room: 'Room 4', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    3: null,
    4: { subject: 'Further Maths', class: 'SS3A', room: 'Room 7', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    5: null,
    6: null,
    7: { subject: 'Mathematics', class: 'JS3A', room: 'Room 2', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    8: null,
    9: null,
    10: { subject: 'Mathematics', class: 'SS1A', room: 'Room 9', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  },
  Tuesday: {
    1: null,
    2: { subject: 'Further Maths', class: 'SS3A', room: 'Room 7', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    3: { subject: 'Mathematics', class: 'SS1A', room: 'Room 9', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    4: null,
    5: null,
    6: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    7: null,
    8: null,
    9: { subject: 'Mathematics', class: 'SS2B', room: 'Room 4', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    10: null,
  },
  Wednesday: {
    1: { subject: 'Mathematics', class: 'JS3A', room: 'Room 2', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    2: null,
    3: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    4: null,
    5: null,
    6: null,
    7: { subject: 'Further Maths', class: 'SS3A', room: 'Room 7', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    8: null,
    9: null,
    10: { subject: 'Mathematics', class: 'SS1A', room: 'Room 9', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  },
  Thursday: {
    1: null,
    2: { subject: 'Mathematics', class: 'SS2B', room: 'Room 4', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    3: null,
    4: { subject: 'Mathematics', class: 'SS1A', room: 'Room 9', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    5: null,
    6: { subject: 'Mathematics', class: 'JS3A', room: 'Room 2', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    7: null,
    8: null,
    9: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    10: null,
  },
  Friday: {
    1: { subject: 'Further Maths', class: 'SS3A', room: 'Room 7', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    2: null,
    3: { subject: 'Mathematics', class: 'SS2B', room: 'Room 4', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    4: null,
    5: null,
    6: { subject: 'Mathematics', class: 'SS1A', room: 'Room 9', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    7: null,
    8: null,
    9: null,
    10: { subject: 'Mathematics', class: 'JS3A', room: 'Room 2', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  },
};

export function ScheduleTab({ teacher }: { teacher: TeacherData }) {
  const router = useRouter();
  const [weekNumber, setWeekNumber] = useState(1);
  const [classFilter, setClassFilter] = useState('All');

  const todayIndex = new Date().getDay();
  const todayDay = todayIndex >= 1 && todayIndex <= 5 ? days[todayIndex - 1] : 'Monday';

  // Calculate stats
  const totalWeeklyTeachingPeriods = 22;
  const freePeriods = 18;

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-black">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              Master Weekly Timetable
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Complete 5-day period allocation matrix, classroom allocations, and departmental schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-semibold text-[hsl(var(--text-secondary))] transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            onClick={() => router.push(`/${teacher.tenantSlug}/teacher?tab=schedule`)}
            className="px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span>Today's Schedule →</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar & Filters ──────────────────────────────── */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekNumber(w => Math.max(1, w - 1))}
            className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer text-[hsl(var(--text-secondary))]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-black text-[hsl(var(--text-primary))] font-mono">
            Academic Term 2 • Week {weekNumber}
          </span>
          <button
            onClick={() => setWeekNumber(w => w + 1)}
            className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer text-[hsl(var(--text-secondary))]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] cursor-pointer"
          >
            <option value="All">All Assigned Classes</option>
            <option value="SS2A">SS2A</option>
            <option value="SS2B">SS2B</option>
            <option value="SS3A">SS3A</option>
            <option value="JS3A">JS3A</option>
            <option value="SS1A">SS1A</option>
          </select>
        </div>
      </div>

      {/* ── Summary KPI Strip ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Weekly Teaching Load</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalWeeklyTeachingPeriods} Periods / Week</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Approx. 16.5 hours classroom contact time</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Planning &amp; Free Periods</span>
          <p className="text-2xl font-black text-emerald-400">{freePeriods} Periods</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">For lesson preparation, grading &amp; student consultations</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Form Class Duty</span>
          <p className="text-2xl font-black text-blue-400">SS2A (Daily Morning)</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">07:15 – 07:30 AM Morning Assembly &amp; Form Registration</p>
        </div>
      </div>

      {/* ── Master Weekly Timetable Grid ────────────────────── */}
      <div className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                <th className="text-left py-3.5 px-4 text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase w-32">
                  Period / Time
                </th>
                {days.map(day => (
                  <th
                    key={day}
                    className={`py-3.5 px-3 text-[11px] font-black uppercase text-center ${
                      day === todayDay ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)]' : 'text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{day}</span>
                      {day === todayDay && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {periods.map(period => {
                const isBreak = period.label.includes('Break');

                return (
                  <tr
                    key={period.id}
                    className={isBreak ? 'bg-[hsl(var(--bg-tertiary)/0.4)] text-[hsl(var(--text-tertiary))]' : 'hover:bg-[hsl(var(--bg-tertiary)/0.15)] transition-colors'}
                  >
                    <td className="py-3 px-4 whitespace-nowrap bg-[hsl(var(--bg-secondary)/0.5)]">
                      <p className="font-black text-[hsl(var(--text-primary))] text-xs">{period.label}</p>
                      <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{period.time}</p>
                    </td>

                    {days.map(day => {
                      if (isBreak) {
                        return (
                          <td key={day} className="py-2 px-2 text-center text-[10px] font-bold text-[hsl(var(--text-tertiary))] italic">
                            {period.label}
                          </td>
                        );
                      }

                      const cell = timetableMatrix[day]?.[period.id];
                      const matchesFilter = !cell || classFilter === 'All' || cell.class === classFilter;
                      const isToday = day === todayDay;

                      return (
                        <td
                          key={day}
                          className={`py-2 px-2 text-center align-middle ${
                            isToday ? 'bg-[hsl(var(--accent)/0.03)]' : ''
                          }`}
                        >
                          {cell && matchesFilter ? (
                            <div className={`p-2.5 rounded-2xl border ${cell.color} text-left transition-all hover:scale-[1.02] shadow-sm space-y-1`}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-[11px]">{cell.class}</span>
                                <span className="text-[9px] opacity-80">{cell.room}</span>
                              </div>
                              <p className="font-bold text-xs text-[hsl(var(--text-primary))] line-clamp-1">
                                {cell.subject}
                              </p>
                            </div>
                          ) : (
                            <div className="h-12 rounded-xl flex items-center justify-center text-[10px] text-[hsl(var(--text-tertiary))] opacity-40 font-mono">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Subject Legend ─────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm">
        <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Subject / Class Colour Legend</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Mathematics · SS2A',   color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
            { label: 'Mathematics · SS2B',   color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
            { label: 'Further Maths · SS3A', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
            { label: 'Mathematics · JS3A',   color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
            { label: 'Mathematics · SS1A',   color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
          ].map(({ label, color }) => (
            <span key={label} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Per-Class Weekly Stats ──────────────────────────── */}
      <div className="glass-card rounded-2xl border border-[hsl(var(--border))] p-4 shadow-sm">
        <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Weekly Periods Per Class</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { cls: 'SS2A', periods: 5, subject: 'Mathematics' },
            { cls: 'SS2B', periods: 4, subject: 'Mathematics' },
            { cls: 'SS3A', periods: 4, subject: 'Further Maths' },
            { cls: 'JS3A', periods: 4, subject: 'Mathematics' },
            { cls: 'SS1A', periods: 5, subject: 'Mathematics' },
          ].map(({ cls, periods: p, subject }) => (
            <div key={cls} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] text-center">
              <p className="text-sm font-black text-[hsl(var(--text-primary))]">{cls}</p>
              <p className="text-2xl font-black text-[hsl(var(--accent))] leading-none mt-1">{p}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{subject}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
