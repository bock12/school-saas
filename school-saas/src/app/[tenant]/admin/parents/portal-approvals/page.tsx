'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const mockPortalApprovals = [
  { id: '1', name: 'John Doe', studentLink: 'Sarah Doe', relation: 'Father', idVerified: 'Pending Audit', status: 'Pending Verification' },
  { id: '2', name: 'Patricia Johnson', studentLink: 'Amara Johnson', relation: 'Mother', idVerified: 'Verified OK', status: 'Approved' }
];

export default function PortalApprovalsPage() {
  const [approvals, setApprovals] = useState(mockPortalApprovals);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Approved', idVerified: 'Verified OK' };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in p-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Portal Registrations &amp; Approvals</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review parent registration identity records and approve student relationship linkages before enabling portal login accounts access.</p>
      </div>

      <div className="glass-card overflow-hidden border border-[hsl(var(--border))] rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Parent Name', 'Student Child Link', 'Relationship', 'ID Check', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.studentLink}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.relation}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.idVerified}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      row.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {row.status.startsWith('Pending') && (
                      <button
                        onClick={() => handleApprove(row.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve Account
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
