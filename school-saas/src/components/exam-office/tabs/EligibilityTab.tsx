'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { UserCheck, AlertTriangle, CheckCircle2, XCircle, Search } from 'lucide-react';

const candidates = [
  { id: '1', name: 'John Kamara', admNo: 'ST-2026-001', class: 'SSS 2A', examNo: 'EX-2026-0001', attendance: 89, fees: 'Cleared', subjects: 9, status: 'Eligible' },
  { id: '2', name: 'Aminata Sesay', admNo: 'ST-2026-002', class: 'SSS 2A', examNo: 'EX-2026-0002', attendance: 72, fees: 'Cleared', subjects: 9, status: 'Eligible' },
  { id: '3', name: 'Mohamed Conteh', admNo: 'ST-2026-003', class: 'SSS 2B', examNo: 'EX-2026-0003', attendance: 61, fees: 'Outstanding', subjects: 9, status: 'Ineligible' },
  { id: '4', name: 'Fatima Koroma', admNo: 'ST-2026-004', class: 'SSS 1A', examNo: 'EX-2026-0004', attendance: 93, fees: 'Cleared', subjects: 8, status: 'Eligible' },
  { id: '5', name: 'Ibrahim Bangura', admNo: 'ST-2026-005', class: 'SSS 3A', examNo: 'EX-2026-0005', attendance: 55, fees: 'Partial', subjects: 9, status: 'Ineligible' },
];

export function EligibilityTab({ officer }: { officer: OfficerData }) {
  const [q, setQ] = useState('');
  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.admNo.toLowerCase().includes(q.toLowerCase())
  );

  const eligible = candidates.filter(c => c.status === 'Eligible').length;
  const ineligible = candidates.length - eligible;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Candidate Eligibility & Clearance</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Verify attendance threshold, fee clearance, and exam eligibility for all candidates</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Candidates', value: candidates.length, color: 'bg-indigo-500' },
          { label: 'Eligible', value: eligible, color: 'bg-emerald-500' },
          { label: 'Ineligible', value: ineligible, color: 'bg-red-500' },
          { label: 'Pending Review', value: 2, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><UserCheck className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p><p className="text-xs text-[hsl(var(--text-secondary))]">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
        <p className="text-xs font-bold text-amber-300">⚠ Eligibility Rules: Minimum 75% attendance AND fee clearance required to sit examinations.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or admission number..." className="flex-1 bg-transparent text-sm text-[hsl(var(--text-primary))] outline-none placeholder:text-[hsl(var(--text-tertiary))]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student', 'Adm No.', 'Exam No.', 'Class', 'Attendance', 'Fees', 'Subjects', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{c.name}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.admNo}</td>
                  <td className="py-3 px-4 text-xs font-bold text-violet-400">{c.examNo}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.class}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold ${c.attendance >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>{c.attendance}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold ${c.fees === 'Cleared' ? 'text-emerald-400' : 'text-red-400'}`}>{c.fees}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{c.subjects}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${c.status === 'Eligible' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {c.status === 'Eligible' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors font-bold">Override</button>
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
