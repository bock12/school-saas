'use client';

import { useState } from 'react';
import { UsersRound, Search, CheckCircle2 } from 'lucide-react';

const mockInvigilations = [
  { teacher: 'Mr. Asante', subject: 'Mathematics (MTH101)', date: '2026-12-07', session: 'Morning', room: 'Hall A', workloadCount: 1 },
  { teacher: 'Ms. Williams', subject: 'English Language (ENG101)', date: '2026-12-08', session: 'Morning', room: 'Hall B', workloadCount: 2 },
  { teacher: 'Dr. Mensah', subject: 'Physics Mechanics (PHY101)', date: '2026-12-09', session: 'Morning', room: 'Hall A', workloadCount: 1 }
];

export default function InvigilationPage() {
  const [search, setSearch] = useState('');

  const filtered = mockInvigilations.filter(i =>
    i.teacher.toLowerCase().includes(search.toLowerCase()) ||
    i.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Teacher Invigilation Assignments</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Assign invigilators to exam rooms, verify schedules, and distribute invigilation duties evenly.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search invigilators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Invigilator Teacher', 'Assigned exam subject', 'Exam Date', 'Session Slot', 'Room Assigned', 'Invigilations count'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><UsersRound className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.teacher}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.subject}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.date}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.session}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.room}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                      {row.workloadCount} shifts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
