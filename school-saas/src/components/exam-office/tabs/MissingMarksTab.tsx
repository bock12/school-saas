'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { AlertTriangle } from 'lucide-react';

const missing = [
  { class: 'SSS 1A', subject: 'Physics', teacher: 'Mr. Bangura', daysOverdue: 8, ca1: false, ca2: false, exam: false, lastContacted: '3 days ago' },
  { class: 'SSS 1A', subject: 'English', teacher: 'Mrs. Kamara', daysOverdue: 3, ca1: true, ca2: true, exam: false, lastContacted: '1 day ago' },
  { class: 'SSS 2A', subject: 'Biology', teacher: 'Mrs. Sesay', daysOverdue: 5, ca1: true, ca2: false, exam: false, lastContacted: '2 days ago' },
  { class: 'SSS 3A', subject: 'Physics', teacher: 'Mr. Bangura', daysOverdue: 3, ca1: true, ca2: true, exam: false, lastContacted: '1 day ago' },
];

export function MissingMarksTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Missing Marks Audit</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Track overdue score submissions and escalate to department heads or principal</p>
      </div>
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-400">⚠ {missing.length} Missing Mark Submissions</p>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">Results cannot be finalized until all scores are submitted. Deadline: Aug 28, 2026.</p>
        </div>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Class', 'Subject', 'Teacher', 'Days Overdue', 'CA 1', 'CA 2', 'Exam Marks', 'Last Contacted', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {missing.map((m, i) => (
                <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{m.class}</td>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{m.subject}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{m.teacher}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-black ${m.daysOverdue >= 7 ? 'text-red-400' : 'text-amber-400'}`}>{m.daysOverdue}d overdue</span>
                  </td>
                  {[m.ca1, m.ca2, m.exam].map((v, vi) => (
                    <td key={vi} className="py-3 px-4">
                      <span className={`text-xs font-bold ${v ? 'text-emerald-400' : 'text-red-400'}`}>{v ? '✓' : '✗ Missing'}</span>
                    </td>
                  ))}
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{m.lastContacted}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      <button className="text-xs px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold hover:bg-amber-500/25 transition-colors">📧 Remind</button>
                      <button className="text-xs px-2 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold hover:bg-red-500/25 transition-colors">🔴 Escalate</button>
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
