'use client';

import { useState } from 'react';
import { Clock, Search, CheckCircle, Plus, AlertCircle } from 'lucide-react';

const mockLeaves = [
  { id: '1', name: 'John Doe', type: 'Annual Leave', start: 'Jul 15, 2026', end: 'Jul 22, 2026', status: 'Pending Supervisor Approval' },
  { id: '2', name: 'Kwame Darko', type: 'Sick Leave', start: 'Jun 28, 2026', end: 'Jul 04, 2026', status: 'Approved' }
];

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState(mockLeaves);

  const handleApprove = (id: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, status: 'Approved' };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Leave Requests</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review leave request logs and approve/reject forms.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Staff Member', 'Leave Type', 'Start Date', 'End Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{l.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{l.type}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{l.start}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{l.end}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      l.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {l.status.startsWith('Pending') && (
                      <button
                        onClick={() => handleApprove(l.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-semibold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve Leave
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
