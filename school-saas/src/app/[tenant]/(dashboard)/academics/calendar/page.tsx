'use client';

import { useState } from 'react';
import { CalendarCheck, Plus, Calendar } from 'lucide-react';

const mockEvents = [
  { date: '2026-09-01', event: 'First Term Opening Resumption', category: 'Academic', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { date: '2026-10-15', event: 'Midterm recess Break', category: 'Holiday', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { date: '2026-11-20', event: 'Parent-Teacher Association Consultations', category: 'Meeting', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { date: '2026-12-07', event: 'First Term Closing Examinations Period', category: 'Examinations', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
];

export default function AcademicCalendarPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Academic Calendar Events</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Centralized schedule mapping resumption dates, holidays, sports meets, and parent-teacher consultations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Calendar Event Logs</h3>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {mockEvents.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{item.event}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5" />{item.date}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.color}`}>
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4 h-fit text-xs text-[hsl(var(--text-secondary))]">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Summary Info</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">Total Scheduled Holidays</span>
              <p className="text-lg font-bold text-rose-400">12 Days</p>
            </div>
            <div>
              <span className="text-[hsl(var(--text-tertiary))] block mb-1">PTA Consultation Meets</span>
              <p className="text-lg font-bold text-[hsl(var(--accent))]">3 Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
