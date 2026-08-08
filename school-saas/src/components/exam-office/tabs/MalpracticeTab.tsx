'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { AlertTriangle, Plus, ChevronRight, Clock, XCircle, CheckCircle2, Shield } from 'lucide-react';

const incidents = [
  { id: 'INC-001', candidate: 'Ibrahim Bangura', class: 'SSS 3A', examNo: 'EX-0005', exam: 'Physics', type: 'Possession of Mobile Phone', hall: 'Hall A', invigilator: 'Mr. Kamara', date: 'Aug 19, 2026', severity: 'Major', status: 'Under Investigation' },
  { id: 'INC-002', candidate: 'Samuel Turay', class: 'SSS 2B', examNo: 'EX-0041', exam: 'Mathematics', type: 'Copying from Adjacent Candidate', hall: 'Hall A', invigilator: 'Mrs. Johnson', date: 'Aug 18, 2026', severity: 'Major', status: 'Resolved — Cancelled' },
  { id: 'INC-003', candidate: 'Mary Koroma', class: 'SSS 1A', examNo: 'EX-0107', exam: 'English', type: 'Unauthorized Notes', hall: 'Hall B', invigilator: 'Mr. Davies', date: 'Aug 18, 2026', severity: 'Minor', status: 'Warning Issued' },
];

const severityColors: Record<string, string> = {
  Major: 'bg-red-500/15 text-red-400 border-red-500/30',
  Minor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};
const statusColors: Record<string, string> = {
  'Under Investigation': 'text-blue-400',
  'Resolved — Cancelled': 'text-red-400',
  'Warning Issued': 'text-amber-400',
};

export function MalpracticeTab({ officer }: { officer: OfficerData }) {
  const [selected, setSelected] = useState<typeof incidents[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Malpractice & Incident Management</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Log, investigate, and resolve academic dishonesty and exam-day incidents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Incidents', value: incidents.filter(i => i.status === 'Under Investigation').length, color: 'text-red-400' },
          { label: 'Resolved', value: incidents.filter(i => i.status !== 'Under Investigation').length, color: 'text-emerald-400' },
          { label: 'Major Cases', value: incidents.filter(i => i.severity === 'Major').length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Ref', 'Candidate', 'Type of Infraction', 'Exam', 'Date', 'Severity', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer" onClick={() => setSelected(inc)}>
                    <td className="py-3 px-4 text-xs font-bold text-red-400">{inc.id}</td>
                    <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{inc.candidate}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{inc.type}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{inc.exam}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{inc.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severityColors[inc.severity]}`}>{inc.severity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold ${statusColors[inc.status]}`}>{inc.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-400" />
                <h3 className="font-black text-[hsl(var(--text-primary))] text-sm">Incident Report</h3>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${severityColors[selected.severity]}`}>{selected.severity}</span>
              </div>
              {[
                { label: 'Ref', value: selected.id },
                { label: 'Candidate', value: selected.candidate },
                { label: 'Exam No.', value: selected.examNo },
                { label: 'Class', value: selected.class },
                { label: 'Exam', value: selected.exam },
                { label: 'Infraction', value: selected.type },
                { label: 'Hall', value: selected.hall },
                { label: 'Invigilator', value: selected.invigilator },
                { label: 'Date', value: selected.date },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-xs py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--text-tertiary))]">{f.label}</span>
                  <span className="font-bold text-[hsl(var(--text-primary))] text-right max-w-[60%]">{f.value}</span>
                </div>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <button className="w-full py-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors">Issue Formal Warning</button>
                <button className="w-full py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors">Cancel Examination</button>
                <button className="w-full py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors">Mark as Resolved</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <AlertTriangle className="w-8 h-8 text-[hsl(var(--text-tertiary))] mb-3" />
              <p className="text-sm font-bold text-[hsl(var(--text-secondary))]">Select an incident</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Click any row to view details and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
