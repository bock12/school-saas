'use client';

import { useState } from 'react';
import { Clock, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

const mockSchedules = [
  { subject: 'Mathematics (MTH101)', date: '2026-12-07', session: 'Morning (09:00 AM)', duration: '3 hrs', room: 'Hall A', clash: false },
  { subject: 'English Language (ENG101)', date: '2026-12-08', session: 'Morning (09:00 AM)', duration: '2.5 hrs', room: 'Hall B', clash: false },
  { subject: 'Physics Mechanics (PHY101)', date: '2026-12-09', session: 'Morning (09:00 AM)', duration: '2.5 hrs', room: 'Hall A', clash: true, clashDetail: 'Class SS1 room space overlaps with chemistry practicals' }
];

export default function TimetablePage() {
  const [schedules, setSchedules] = useState(mockSchedules);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Examinations Timetable &amp; Clash Detector</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure dates, sessions, rooms allocations, and verify schedules for invigilation time clashes.</p>
      </div>

      <div className="space-y-4">
        {schedules.map((row, idx) => (
          <div key={idx} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{row.subject}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {row.date} • {row.session}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                row.clash ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
              }`}>
                {row.clash ? 'Clash Flagged' : 'Verified OK'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[hsl(var(--text-secondary))]">
              <div>
                <p>Room Assigned: <span className="font-semibold text-[hsl(var(--text-primary))]">{row.room}</span></p>
                <p className="mt-1">Duration: <span className="font-semibold text-[hsl(var(--text-primary))]">{row.duration}</span></p>
              </div>
              {row.clash && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-400 font-medium leading-relaxed">{row.clashDetail}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
