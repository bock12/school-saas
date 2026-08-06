'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Clock, BookOpen, CheckSquare, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [
  { id: 1, label: 'Period 1', time: '7:30 – 8:15' },
  { id: 2, label: 'Period 2', time: '8:15 – 9:00' },
  { id: 3, label: 'Period 3', time: '9:15 – 10:00' },
  { id: 4, label: 'Period 4', time: '10:00 – 10:45' },
  { id: 5, label: 'Break', time: '10:45 – 11:00' },
  { id: 6, label: 'Period 5', time: '11:00 – 11:45' },
  { id: 7, label: 'Period 6', time: '11:45 – 12:30' },
  { id: 8, label: 'Lunch', time: '12:30 – 1:00' },
  { id: 9, label: 'Period 7', time: '1:00 – 1:45' },
  { id: 10, label: 'Period 8', time: '1:45 – 2:30' },
];

const timetable: Record<string, Record<number, { subject: string; class: string; room: string } | null>> = {
  Monday:    { 1: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1' }, 2: { subject: 'Mathematics', class: 'SS2B', room: 'Rm 4' }, 3: null, 4: { subject: 'Further Maths', class: 'SS3A', room: 'Rm 7' }, 5: null, 6: null, 7: { subject: 'Mathematics', class: 'JS3A', room: 'Rm 2' }, 8: null, 9: null, 10: null },
  Tuesday:   { 1: null, 2: { subject: 'Further Maths', class: 'SS3A', room: 'Rm 7' }, 3: { subject: 'Mathematics', class: 'SS1A', room: 'Rm 9' }, 4: null, 5: null, 6: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1' }, 7: null, 8: null, 9: { subject: 'Mathematics', class: 'SS2B', room: 'Rm 4' }, 10: null },
  Wednesday: { 1: { subject: 'Mathematics', class: 'JS3A', room: 'Rm 2' }, 2: null, 3: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1' }, 4: null, 5: null, 6: null, 7: { subject: 'Further Maths', class: 'SS3A', room: 'Rm 7' }, 8: null, 9: null, 10: { subject: 'Mathematics', class: 'SS1A', room: 'Rm 9' } },
  Thursday:  { 1: null, 2: { subject: 'Mathematics', class: 'SS2B', room: 'Rm 4' }, 3: null, 4: { subject: 'Mathematics', class: 'SS1A', room: 'Rm 9' }, 5: null, 6: { subject: 'Mathematics', class: 'JS3A', room: 'Rm 2' }, 7: null, 8: null, 9: { subject: 'Mathematics', class: 'SS2A', room: 'Lab 1' }, 10: null },
  Friday:    { 1: { subject: 'Further Maths', class: 'SS3A', room: 'Rm 7' }, 2: null, 3: { subject: 'Mathematics', class: 'SS2B', room: 'Rm 4' }, 4: null, 5: null, 6: { subject: 'Mathematics', class: 'SS1A', room: 'Rm 9' }, 7: null, 8: null, 9: null, 10: { subject: 'Mathematics', class: 'JS3A', room: 'Rm 2' } },
};

const todayDay = days[new Date().getDay() - 1] ?? 'Monday';

export function ScheduleTab({ teacher }: { teacher: TeacherData }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayDay);

  const currentHour = new Date().getHours();
  const isCurrentPeriod = (periodId: number) => {
    const starts = [7, 8, 9, 10, 10, 11, 11, 12, 13, 13];
    return currentHour >= starts[periodId - 1] && currentHour < starts[periodId - 1] + 1;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Weekly Timetable</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            {weekOffset === 0 ? 'Current week' : weekOffset > 0 ? `${weekOffset} week(s) ahead` : `${Math.abs(weekOffset)} week(s) ago`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <ChevronLeft className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors text-[hsl(var(--text-secondary))]">
            Today
          </button>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <ChevronRight className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          </button>
        </div>
      </div>

      {/* Day Tabs (mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${selectedDay === day ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'} ${day === todayDay && selectedDay !== day ? 'border border-[hsl(var(--accent)/0.4)]' : ''}`}
          >
            {day.substring(0, 3)}
            {day === todayDay && <span className="ml-1 w-1 h-1 rounded-full bg-emerald-400 inline-block" />}
          </button>
        ))}
      </div>

      {/* Desktop: Full Grid | Mobile: Single Day */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-xs hidden sm:table">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left py-3 px-4 text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase w-28">Period</th>
                {days.map((day) => (
                  <th
                    key={day}
                    className={`py-3 px-3 text-[10px] font-black uppercase text-center ${day === todayDay ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))]'}`}
                  >
                    {day.substring(0, 3)}
                    {day === todayDay && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block align-middle" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)]">
              {periods.map((period) => {
                const isBreak = period.label === 'Break' || period.label === 'Lunch';
                return (
                  <tr key={period.id} className={isBreak ? 'bg-[hsl(var(--bg-tertiary)/0.3)]' : 'hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors'}>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-[hsl(var(--text-secondary))]">{period.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{period.time}</p>
                    </td>
                    {days.map((day) => {
                      const cell = timetable[day]?.[period.id];
                      const isToday = day === todayDay;
                      const isCurrent = isToday && isCurrentPeriod(period.id) && !isBreak;
                      return (
                        <td key={day} className={`py-2 px-2 text-center ${isCurrent ? 'bg-[hsl(var(--accent)/0.06)]' : ''}`}>
                          {isBreak ? (
                            <span className="text-[10px] text-[hsl(var(--text-tertiary))] italic">{period.label}</span>
                          ) : cell ? (
                            <div className={`rounded-xl p-2 transition-all ${isCurrent ? 'bg-[hsl(var(--accent)/0.15)] ring-1 ring-[hsl(var(--accent)/0.3)]' : isToday ? 'bg-[hsl(var(--bg-tertiary)/0.6)]' : 'bg-[hsl(var(--bg-tertiary)/0.3)]'}`}>
                              <p className="font-black text-[hsl(var(--text-primary))] text-[10px] leading-tight">{cell.subject}</p>
                              <p className="font-bold text-[hsl(var(--accent))] text-[10px]">{cell.class}</p>
                              <p className="text-[9px] text-[hsl(var(--text-tertiary))]">{cell.room}</p>
                              {isCurrent && (
                                <span className="flex items-center justify-center gap-0.5 mt-0.5 text-emerald-400 text-[9px] font-bold">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Live
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[hsl(var(--text-tertiary))] opacity-30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile: Single Day View */}
          <div className="sm:hidden">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
              <p className="font-black text-[hsl(var(--text-primary))] text-sm">{selectedDay}</p>
            </div>
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {periods.map((period) => {
                const cell = timetable[selectedDay]?.[period.id];
                const isBreak = period.label === 'Break' || period.label === 'Lunch';
                return (
                  <div key={period.id} className={`flex items-center gap-4 px-4 py-3 ${isBreak ? 'bg-[hsl(var(--bg-tertiary)/0.3)]' : ''}`}>
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-bold text-[hsl(var(--text-secondary))]">{period.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{period.time}</p>
                    </div>
                    {cell ? (
                      <div className="flex-1 bg-[hsl(var(--bg-tertiary)/0.5)] rounded-xl p-2.5">
                        <p className="font-black text-xs text-[hsl(var(--text-primary))]">{cell.subject}</p>
                        <p className="text-[10px] text-[hsl(var(--accent))] font-bold">{cell.class} · {cell.room}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[hsl(var(--text-tertiary))] italic">{isBreak ? period.label : 'Free Period'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Hours Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {days.map((day) => {
          const count = periods.filter((p) => timetable[day]?.[p.id]).length;
          return (
            <div key={day} className={`glass-card rounded-xl p-3 text-center ${day === todayDay ? 'ring-1 ring-[hsl(var(--accent)/0.4)]' : ''}`}>
              <p className={`text-xs font-black ${day === todayDay ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]'}`}>{day.substring(0, 3)}</p>
              <p className="text-xl font-black text-[hsl(var(--text-primary))] mt-0.5">{count}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">lessons</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
