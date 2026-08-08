'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { FlaskConical, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const submissions = [
  { class: 'SSS 1A', subject: 'Mathematics', teacher: 'Mr. Conteh', ca1: true, ca2: true, exam: true, total: '10/10/80', status: 'Complete' },
  { class: 'SSS 1A', subject: 'English', teacher: 'Mrs. Kamara', ca1: true, ca2: true, exam: false, total: '10/10/—', status: 'Partial' },
  { class: 'SSS 1A', subject: 'Physics', teacher: 'Mr. Bangura', ca1: false, ca2: false, exam: false, total: '—/—/—', status: 'Missing' },
  { class: 'SSS 2A', subject: 'Mathematics', teacher: 'Mr. Conteh', ca1: true, ca2: true, exam: true, total: '10/10/80', status: 'Complete' },
  { class: 'SSS 2A', subject: 'Biology', teacher: 'Mrs. Sesay', ca1: true, ca2: false, exam: false, total: '10/—/—', status: 'Partial' },
  { class: 'SSS 2B', subject: 'Chemistry', teacher: 'Mr. Koroma', ca1: true, ca2: true, exam: true, total: '10/10/80', status: 'Complete' },
  { class: 'SSS 3A', subject: 'Physics', teacher: 'Mr. Bangura', ca1: true, ca2: true, exam: false, total: '10/10/—', status: 'Partial' },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  Complete: { color: 'text-emerald-400', icon: CheckCircle2 },
  Partial: { color: 'text-amber-400', icon: Clock },
  Missing: { color: 'text-red-400', icon: AlertTriangle },
};

export function ScoreEntryTab({ officer }: { officer: OfficerData }) {
  const complete = submissions.filter(s => s.status === 'Complete').length;
  const partial = submissions.filter(s => s.status === 'Partial').length;
  const missing = submissions.filter(s => s.status === 'Missing').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Score Entry Status</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Monitor teacher mark submissions by class, subject, and assessment component</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Complete', value: complete, color: 'bg-emerald-500' },
          { label: 'Partial', value: partial, color: 'bg-amber-500' },
          { label: 'Not Submitted', value: missing, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><FlaskConical className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p><p className="text-xs text-[hsl(var(--text-secondary))]">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Class', 'Subject', 'Teacher', 'CA 1', 'CA 2', 'Exam', 'Score Summary', 'Status', 'Reminder'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {submissions.map((s, i) => {
                const { color, icon: Icon } = statusConfig[s.status];
                return (
                  <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.class}</td>
                    <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{s.subject}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.teacher}</td>
                    {[s.ca1, s.ca2, s.exam].map((val, vi) => (
                      <td key={vi} className="py-3 px-4">
                        {val ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-secondary))] font-mono">{s.total}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${color}`}><Icon className="w-3.5 h-3.5" />{s.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      {s.status !== 'Complete' && (
                        <button className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 font-bold transition-colors">📧 Send Reminder</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
