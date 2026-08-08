'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Clock, AlertTriangle, CheckCircle2, Plus, Download, Printer } from 'lucide-react';

const schedule = [
  { date: 'Mon, Aug 18', subject: 'Mathematics', classes: 'SSS 1, 2, 3', room: 'Hall A', time: '09:00 – 11:00', invigilators: 3, status: 'confirmed' },
  { date: 'Mon, Aug 18', subject: 'English Language', classes: 'SSS 1, 2', room: 'Hall B', time: '13:00 – 15:00', invigilators: 2, status: 'confirmed' },
  { date: 'Tue, Aug 19', subject: 'Physics', classes: 'SSS 2, 3', room: 'Lab 2', time: '09:00 – 11:00', invigilators: 2, status: 'conflict' },
  { date: 'Tue, Aug 19', subject: 'Chemistry', classes: 'SSS 2, 3', room: 'Hall A', time: '09:00 – 11:00', invigilators: 2, status: 'conflict' },
  { date: 'Wed, Aug 20', subject: 'Biology', classes: 'SSS 2, 3', room: 'Lab 1', time: '09:00 – 11:00', invigilators: 2, status: 'confirmed' },
  { date: 'Thu, Aug 21', subject: 'Further Mathematics', classes: 'SSS 3', room: 'Room 5', time: '09:00 – 11:00', invigilators: 1, status: 'confirmed' },
];

const conflicts = [
  { type: 'Subject Clash', desc: 'Physics and Chemistry scheduled at same time for SSS 3 candidates', severity: 'critical' },
  { type: 'Room Capacity', desc: 'Hall B capacity (60) exceeded by SSS 1 English (72 candidates)', severity: 'warn' },
];

export function TimetablesTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Timetable</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Build and manage the exam schedule with automatic conflict detection</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))]">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Schedule
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((c, i) => (
            <div key={i} className={`p-4 rounded-2xl flex items-start gap-3 border ${c.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-xs font-bold ${c.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>{c.type}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{c.desc}</p>
              </div>
              <button className="ml-auto text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold">Resolve</button>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Date', 'Subject', 'Classes', 'Room', 'Time', 'Invigilators', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {schedule.map((s, i) => (
                <tr key={i} className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${s.status === 'conflict' ? 'bg-red-500/5' : ''}`}>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{s.date}</td>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{s.subject}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.classes}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.room}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.time}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.invigilators}</td>
                  <td className="py-3 px-4">
                    {s.status === 'conflict' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-400"><AlertTriangle className="w-3 h-3" />Conflict</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3 h-3" />Confirmed</span>
                    )}
                  </td>
                  <td className="py-3 px-4"><button className="text-xs text-violet-400 hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
