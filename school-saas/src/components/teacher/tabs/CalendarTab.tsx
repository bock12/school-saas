'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Calendar, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

type EventType = 'exam' | 'test' | 'assignment' | 'meeting' | 'holiday' | 'event' | 'lesson' | 'personal';

const typeColors: Record<EventType, string> = {
  exam: 'bg-red-500/15 text-red-400 border-red-500/30',
  test: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  assignment: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  meeting: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  holiday: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  event: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  lesson: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  personal: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const events = [
  { id: '1', title: 'Mid-Term Mathematics Exam — SS2A', type: 'exam' as EventType, date: '2026-08-07', class: 'SS2A', time: '8:00 AM' },
  { id: '2', title: 'Further Maths Quiz — SS3A', type: 'test' as EventType, date: '2026-08-08', class: 'SS3A', time: '9:00 AM' },
  { id: '3', title: 'Assignment Due — SS2B Quadratics', type: 'assignment' as EventType, date: '2026-08-09', class: 'SS2B', time: 'EOD' },
  { id: '4', title: 'Staff Meeting — Academic Progress Review', type: 'meeting' as EventType, date: '2026-08-07', class: '', time: '2:00 PM' },
  { id: '5', title: 'Independence Day Holiday', type: 'holiday' as EventType, date: '2026-10-01', class: '', time: 'All Day' },
  { id: '6', title: 'Parent-Teacher Conference', type: 'event' as EventType, date: '2026-08-14', class: '', time: '10:00 AM' },
  { id: '7', title: 'Mathematics Lesson — Trigonometry Week 3', type: 'lesson' as EventType, date: '2026-08-11', class: 'SS2A', time: '7:30 AM' },
  { id: '8', title: 'Prepare Term-End Reports', type: 'personal' as EventType, date: '2026-08-15', class: '', time: 'Reminder' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ teacher }: { teacher: TeacherData }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function getEventsForDay(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr && (filter === 'all' || e.type === filter));
  }

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today && (filter === 'all' || e.type === filter))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Academic Calendar</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Track exams, assignments, meetings, and school events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>All</button>
        {(Object.keys(typeColors) as EventType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? 'all' : t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${filter === t ? typeColors[t] : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-transparent'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
            </button>
            <h2 className="font-black text-[hsl(var(--text-primary))]">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
              <ChevronRight className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-black text-[hsl(var(--text-tertiary))] py-1">{d}</div>
            ))}
            {cells.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              return (
                <div
                  key={i}
                  className={`min-h-[60px] p-1 rounded-xl transition-colors ${day ? 'hover:bg-[hsl(var(--bg-tertiary)/0.5)] cursor-pointer' : ''} ${isToday ? 'bg-[hsl(var(--accent)/0.1)] ring-1 ring-[hsl(var(--accent)/0.3)]' : ''}`}
                >
                  {day && (
                    <>
                      <p className={`text-xs font-bold text-center mb-0.5 ${isToday ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))]'}`}>{day}</p>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div key={e.id} className={`text-[8px] px-1 py-0.5 rounded font-bold truncate border ${typeColors[e.type]}`}>
                            {e.title.split('—')[0].trim()}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[8px] text-[hsl(var(--text-tertiary))] text-center">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-4 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--accent))]" /> Upcoming Events
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-xl border ${typeColors[event.type]}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black leading-snug">{event.title}</p>
                    {event.class && <p className="text-[10px] opacity-70 mt-0.5">{event.class}</p>}
                  </div>
                  <button><X className="w-3 h-3 opacity-50 flex-shrink-0" /></button>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] opacity-70">
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>·</span>
                  <span>{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
