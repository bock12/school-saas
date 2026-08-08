'use client';

import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { ClipboardList, Plus, ChevronRight, Calendar, Users, CheckCircle2, Clock, Archive } from 'lucide-react';

const sessions = [
  { id: '1', name: 'End-of-Term Examination', year: '2025/2026', term: '3rd Term', type: 'Final', start: 'Aug 18', end: 'Aug 29', status: 'Ongoing', classes: 12, candidates: 1248 },
  { id: '2', name: 'Mid-Term Assessment', year: '2025/2026', term: '3rd Term', type: 'CA', start: 'Jul 7', end: 'Jul 9', status: 'Completed', classes: 12, candidates: 1241 },
  { id: '3', name: 'Mock Examination (SSS 3)', year: '2025/2026', term: '2nd Term', type: 'Mock', start: 'May 3', end: 'May 14', status: 'Archived', classes: 4, candidates: 312 },
  { id: '4', name: '2nd Term Examinations', year: '2025/2026', term: '2nd Term', type: 'Final', start: 'Mar 10', end: 'Mar 21', status: 'Archived', classes: 12, candidates: 1189 },
];

const statusColors: Record<string, string> = {
  Ongoing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Archived: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Upcoming: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

export function SessionsTab({ officer }: { officer: OfficerData }) {
  const [activeSession, setActiveSession] = useState(sessions[0].id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Sessions</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Manage examination terms, types, and academic calendars</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Examination
        </button>
      </div>

      {/* Lifecycle stages reference */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Examination Lifecycle</p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {['Draft', 'Setup', 'Registration', 'Timetabled', 'Ongoing', 'Marking', 'Moderation', 'Approved', 'Published', 'Archived'].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[s] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>{s}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">All Examination Sessions</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Examination Name', 'Year', 'Term', 'Type', 'Dates', 'Classes', 'Candidates', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer" onClick={() => setActiveSession(s.id)}>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[hsl(var(--text-primary))]">{s.name}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.year}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.term}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">{s.type}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.start} – {s.end}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.classes}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.candidates.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                      Manage <ChevronRight className="w-3 h-3" />
                    </button>
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
