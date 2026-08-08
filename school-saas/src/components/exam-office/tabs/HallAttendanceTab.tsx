'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { CheckSquare, Users, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';

const halList = [
  { examNo: 'EX-2026-0001', name: 'John Kamara', class: 'SSS 2A', seat: 'A-01', signedIn: '09:04', status: 'Present' },
  { examNo: 'EX-2026-0002', name: 'Aminata Sesay', class: 'SSS 2A', seat: 'A-02', signedIn: '09:02', status: 'Present' },
  { examNo: 'EX-2026-0003', name: 'Mohamed Conteh', class: 'SSS 2B', seat: 'A-03', signedIn: null, status: 'Absent' },
  { examNo: 'EX-2026-0004', name: 'Fatima Koroma', class: 'SSS 1A', seat: 'A-04', signedIn: '09:15', status: 'Late' },
  { examNo: 'EX-2026-0005', name: 'Ibrahim Bangura', class: 'SSS 3A', seat: 'A-05', signedIn: null, status: 'Absent' },
  { examNo: 'EX-2026-0006', name: 'Mariama Cole', class: 'SSS 2A', seat: 'A-06', signedIn: '09:01', status: 'Present' },
];

export function HallAttendanceTab({ officer }: { officer: OfficerData }) {
  const [q, setQ] = useState('');
  const filtered = halList.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.examNo.includes(q));
  const present = halList.filter(c => c.status === 'Present').length;
  const absent = halList.filter(c => c.status === 'Absent').length;
  const late = halList.filter(c => c.status === 'Late').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Hall Attendance</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Real-time exam hall sign-in, absence tracking, and late entry management</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">🟢 LIVE — Mathematics Hall A</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Expected', value: halList.length, color: 'bg-indigo-500' },
          { label: 'Present', value: present, color: 'bg-emerald-500' },
          { label: 'Absent', value: absent, color: 'bg-red-500' },
          { label: 'Late Entry', value: late, color: 'bg-amber-500' },
          { label: '% Attendance', value: `${Math.round((present / halList.length) * 100)}%`, color: 'bg-blue-500' },
          { label: 'Reports Sent', value: absent > 0 ? absent : '—', color: 'bg-violet-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or exam number..." className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] outline-none placeholder:text-[hsl(var(--text-tertiary))]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Exam No.', 'Candidate', 'Class', 'Seat', 'Sign-in Time', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map(c => (
                <tr key={c.examNo} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 text-xs font-bold text-violet-400">{c.examNo}</td>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{c.name}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.class}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-secondary))]">{c.seat}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.signedIn || '—'}</td>
                  <td className="py-3 px-4">
                    {c.status === 'Present' && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Present</span>}
                    {c.status === 'Absent' && <span className="flex items-center gap-1 text-xs font-bold text-red-400"><XCircle className="w-3.5 h-3.5" />Absent</span>}
                    {c.status === 'Late' && <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><Clock className="w-3.5 h-3.5" />Late</span>}
                  </td>
                  <td className="py-3 px-4">
                    {c.status === 'Absent' ? (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 font-bold transition-colors">Flag Absent</button>
                    ) : (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-violet-400 font-bold transition-colors">Note</button>
                    )}
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
