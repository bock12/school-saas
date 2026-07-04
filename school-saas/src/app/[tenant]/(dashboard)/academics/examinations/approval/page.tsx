'use client';

import { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2 } from 'lucide-react';

const mockApprovals = [
  { id: '1', subject: 'General Mathematics', classLink: 'SS2 Science', currentStage: 'HOD Moderated', nextStage: 'VP Academic sign-off', status: 'Pending Review' },
  { id: '2', subject: 'English Language Core', classLink: 'SS1 General', currentStage: 'Approved & Signed', nextStage: 'Published', status: 'Completed' }
];

export default function ApprovalWorkflowPage() {
  const [approvals, setApprovals] = useState(mockApprovals);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Completed', currentStage: 'Approved & Signed', nextStage: 'Published' };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Results Approval Workflows</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Audit result verification stages from initial marks entry through departmental checks to final sign-off.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject Course', 'Class Level', 'Verification Stage', 'Next Required Role', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.classLink}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.currentStage}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.nextStage}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      row.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {row.status === 'Pending Review' && (
                      <button
                        onClick={() => handleApprove(row.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Results
                      </button>
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
