'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { MessageSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';

const appeals = [
  { id: 'APP-001', student: 'John Kamara', class: 'SSS 2A', subject: 'Physics', reason: 'Score not reflecting paper submitted — believes marking error', submittedScore: 52, expectedScore: 68, status: 'Under Review', date: 'Aug 24' },
  { id: 'APP-002', student: 'Aminata Sesay', class: 'SSS 1A', subject: 'Chemistry', reason: 'CA 2 score missing from records', submittedScore: 61, expectedScore: 71, status: 'Approved — Score Corrected', date: 'Aug 23' },
  { id: 'APP-003', student: 'Ibrahim Bangura', class: 'SSS 3A', subject: 'Mathematics', reason: 'Grade calculated incorrectly', submittedScore: 74, expectedScore: 76, status: 'Rejected', date: 'Aug 22' },
];

const statusColors: Record<string, string> = {
  'Under Review': 'text-amber-400',
  'Approved — Score Corrected': 'text-emerald-400',
  'Rejected': 'text-red-400',
};

export function AppealsTab({ officer }: { officer: OfficerData }) {
  const [selected, setSelected] = useState<typeof appeals[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Appeals & Score Corrections</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Manage student result appeals, investigate score discrepancies, and issue corrections</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Ref', 'Student', 'Subject', 'Reason', 'Recorded', 'Claimed', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {appeals.map(a => (
                  <tr key={a.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer" onClick={() => setSelected(a)}>
                    <td className="py-3 px-4 text-xs font-bold text-violet-400">{a.id}</td>
                    <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{a.student}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.subject}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))] max-w-xs truncate">{a.reason}</td>
                    <td className="py-3 px-4 text-xs font-bold text-red-400">{a.submittedScore}%</td>
                    <td className="py-3 px-4 text-xs font-bold text-emerald-400">{a.expectedScore}%</td>
                    <td className="py-3 px-4"><span className={`text-xs font-bold ${statusColors[a.status]}`}>{a.status}</span></td>
                    <td className="py-3 px-4"><button className="text-xs text-violet-400 hover:underline">Details</button></td>
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
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="font-black text-[hsl(var(--text-primary))] text-sm">{selected.id}</h3>
              </div>
              {[
                { label: 'Student', value: selected.student },
                { label: 'Class', value: selected.class },
                { label: 'Subject', value: selected.subject },
                { label: 'Recorded Score', value: `${selected.submittedScore}%` },
                { label: 'Claimed Score', value: `${selected.expectedScore}%` },
                { label: 'Date', value: selected.date },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-xs py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--text-tertiary))]">{f.label}</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{f.value}</span>
                </div>
              ))}
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1">Reason</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{selected.reason}</p>
              </div>
              {selected.status === 'Under Review' && (
                <div className="flex flex-col gap-2 pt-2">
                  <button className="w-full py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors">✓ Approve Correction</button>
                  <button className="w-full py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors">✗ Reject Appeal</button>
                  <button className="w-full py-2 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs font-bold transition-colors">📋 Request Re-mark</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MessageSquare className="w-8 h-8 text-[hsl(var(--text-tertiary))] mb-3" />
              <p className="text-sm font-bold text-[hsl(var(--text-secondary))]">Select an appeal</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Click any row to review and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
