'use client';
import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Stamp, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const queue = [
  { class: 'SSS 1A', exam: 'End-of-Term', submitted: 'Aug 22', validators: 'Dr. Cole', hodStatus: 'Approved', examOfficerStatus: 'Pending', principalStatus: 'Not Started', stage: 1 },
  { class: 'SSS 1B', exam: 'End-of-Term', submitted: 'Aug 22', validators: 'Dr. Cole', hodStatus: 'Approved', examOfficerStatus: 'Approved', principalStatus: 'Pending', stage: 2 },
  { class: 'SSS 2A', exam: 'End-of-Term', submitted: 'Aug 21', validators: 'Dr. Bangura', hodStatus: 'Pending', examOfficerStatus: 'Not Started', principalStatus: 'Not Started', stage: 0 },
  { class: 'SSS 2B', exam: 'End-of-Term', submitted: 'Aug 21', validators: 'Dr. Bangura', hodStatus: 'Rejected', examOfficerStatus: 'Not Started', principalStatus: 'Not Started', stage: -1 },
  { class: 'SSS 3A', exam: 'End-of-Term', submitted: 'Aug 20', validators: 'Dr. Sesay', hodStatus: 'Approved', examOfficerStatus: 'Approved', principalStatus: 'Approved', stage: 3 },
];

function StageTag({ v }: { v: string }) {
  if (v === 'Approved') return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Approved</span>;
  if (v === 'Pending') return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">⏳ Pending</span>;
  if (v === 'Rejected') return <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">✗ Rejected</span>;
  return <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded-full">Not Started</span>;
}

export function ApprovalTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Approval Center</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Multi-stage result approval pipeline — HOD → Exam Officer → Principal</p>
      </div>

      {/* Pipeline legend */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 text-xs">
        {['HOD Approval', 'Exam Officer Approval', 'Principal Sign-off', 'Published'].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-violet-500' : i === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}>{i + 1}</div>
            <span className="text-[hsl(var(--text-secondary))] font-semibold">{s}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Class', 'Examination', 'Submitted', 'HOD', 'Exam Officer', 'Principal', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {queue.map((q, i) => (
                <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-black text-[hsl(var(--text-primary))]">{q.class}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{q.exam}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{q.submitted}</td>
                  <td className="py-3 px-4"><StageTag v={q.hodStatus} /></td>
                  <td className="py-3 px-4"><StageTag v={q.examOfficerStatus} /></td>
                  <td className="py-3 px-4"><StageTag v={q.principalStatus} /></td>
                  <td className="py-3 px-4">
                    {q.hodStatus === 'Approved' && q.examOfficerStatus === 'Pending' ? (
                      <div className="flex gap-1">
                        <button className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-colors">✓ Approve</button>
                        <button className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 font-bold hover:bg-red-500/25 transition-colors">✗ Reject</button>
                      </div>
                    ) : q.principalStatus === 'Approved' ? (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 font-bold">→ Publish</button>
                    ) : (
                      <button className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold">View</button>
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
