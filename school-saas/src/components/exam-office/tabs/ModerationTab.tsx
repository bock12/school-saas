'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Scale, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const items = [
  { class: 'SSS 1A', subject: 'Mathematics', hod: 'Dr. Cole', avg: 74.2, modAvg: 74.2, delta: 0, status: 'Approved', notes: 'No changes required' },
  { class: 'SSS 2A', subject: 'Physics', hod: 'Dr. Bangura', avg: 68.5, modAvg: 70.1, delta: 1.6, status: 'Modified', notes: 'Scaling applied — marking error corrected' },
  { class: 'SSS 2A', subject: 'Chemistry', hod: 'Dr. Koroma', avg: 71.3, modAvg: null, delta: null, status: 'Pending Review', notes: 'Awaiting HOD review' },
  { class: 'SSS 3A', subject: 'Biology', hod: 'Mrs. Sesay', avg: 64.8, modAvg: null, delta: null, status: 'Rejected', notes: 'Inconsistencies found — returned to teacher' },
];

const statusColors: Record<string, string> = {
  Approved: 'text-emerald-400',
  Modified: 'text-blue-400',
  'Pending Review': 'text-amber-400',
  Rejected: 'text-red-400',
};

export function ModerationTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Moderation Workflow</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">HOD and department review of score distributions, statistical outliers, and scaling decisions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Approved', 'Modified', 'Pending Review', 'Rejected'].map(s => (
          <div key={s} className="glass-card rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${statusColors[s]}`}>{items.filter(i => i.status === s).length}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Class', 'Subject', 'HOD', 'Raw Avg', 'Moderated Avg', 'Δ Change', 'Status', 'Notes', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{item.class}</td>
                  <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{item.subject}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{item.hod}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{item.avg}%</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{item.modAvg !== null ? `${item.modAvg}%` : '—'}</td>
                  <td className="py-3 px-4">
                    {item.delta !== null ? (
                      <span className={`text-xs font-bold ${item.delta > 0 ? 'text-emerald-400' : item.delta < 0 ? 'text-red-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                        {item.delta > 0 ? '+' : ''}{item.delta}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold ${statusColors[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))] max-w-xs truncate">{item.notes}</td>
                  <td className="py-3 px-4">
                    {item.status === 'Pending Review' && (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 font-bold hover:bg-violet-500/25 transition-colors">Review</button>
                    )}
                    {item.status === 'Rejected' && (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold hover:bg-amber-500/25 transition-colors">Re-submit</button>
                    )}
                    {(item.status === 'Approved' || item.status === 'Modified') && (
                      <span className="text-xs text-emerald-400">✓ Done</span>
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
