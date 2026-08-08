'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { FileText, CheckCircle2, XCircle, AlertTriangle, Plus } from 'lucide-react';

const roster = [
  { name: 'Mr. Kamara', subject: 'Mathematics', hall: 'Hall A', date: 'Mon, Aug 18', time: '08:30 – 11:30', status: 'Confirmed', conflicts: 0 },
  { name: 'Mrs. Johnson', subject: 'Mathematics', hall: 'Hall A', date: 'Mon, Aug 18', time: '08:30 – 11:30', status: 'Confirmed', conflicts: 0 },
  { name: 'Mr. Davies', subject: 'English Language', hall: 'Hall B', date: 'Mon, Aug 18', time: '12:30 – 15:30', status: 'Confirmed', conflicts: 0 },
  { name: 'Mrs. Koroma', subject: 'Physics', hall: 'Lab 2', date: 'Tue, Aug 19', time: '08:30 – 11:00', status: 'Conflict', conflicts: 1 },
  { name: 'Mr. Bangura', subject: 'Chemistry', hall: 'Hall A', date: 'Wed, Aug 20', time: '08:30 – 11:30', status: 'Confirmed', conflicts: 0 },
  { name: 'Ms. Sesay', subject: 'Biology', hall: 'Hall C', date: 'Thu, Aug 21', time: '08:30 – 11:30', status: 'Pending', conflicts: 0 },
];

export function InvigilationTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Invigilation Duty Roster</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Assign invigilators to exam halls, detect conflicts, and track attendance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Assign Invigilator
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Invigilator', 'Subject', 'Hall', 'Date', 'Duty Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {roster.map((r, i) => (
                <tr key={i} className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${r.status === 'Conflict' ? 'bg-red-500/5' : ''}`}>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{r.name}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{r.subject}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{r.hall}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{r.time}</td>
                  <td className="py-3 px-4">
                    {r.status === 'Confirmed' && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Confirmed</span>}
                    {r.status === 'Conflict' && <span className="flex items-center gap-1 text-xs font-bold text-red-400"><AlertTriangle className="w-3.5 h-3.5" />Conflict</span>}
                    {r.status === 'Pending' && <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><XCircle className="w-3.5 h-3.5" />Pending</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-violet-400 transition-colors">Replace</button>
                      <button className="text-xs px-2 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-emerald-400 transition-colors">Sign In</button>
                    </div>
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
