'use client';

import { useState } from 'react';
import {
  Clock, Search, CheckCircle, Plus, AlertCircle, Calendar,
  CheckCircle2, XCircle, FileText, UserCheck, AlertTriangle
} from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockLeaves = [
  { id: '1', name: 'John Doe', role: 'Head of Mathematics', dept: 'Mathematics', type: 'Annual Leave', start: 'Jul 15, 2026', end: 'Jul 22, 2026', days: 6, status: 'Pending Supervisor Approval', reason: 'Family vacation & travel' },
  { id: '2', name: 'Kwame Darko', role: 'Bus Driver', dept: 'Transport', type: 'Sick Leave', start: 'Jun 28, 2026', end: 'Jul 04, 2026', days: 5, status: 'Approved', reason: 'Medical appointment & recovery' },
  { id: '3', name: 'Ms. Sarah Mensah', role: 'Lead Librarian', dept: 'Library', type: 'Maternity Leave', start: 'Aug 01, 2026', end: 'Oct 31, 2026', days: 90, status: 'Approved', reason: 'Maternity leave plan' },
];

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [search, setSearch] = useState('');

  const handleAction = (id: string, newStatus: string) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, status: newStatus };
      }
      return l;
    }));
  };

  const filtered = leaves.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase()) ||
    l.dept.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = leaves.filter(l => l.status.startsWith('Pending')).length;

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Staff Leave & Absence Management"
        subtitle="Review leave applications, enforce department coverage rules, and track annual leave quotas."
        badge={`${pendingCount} Pending Approvals`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Approvals', value: `${pendingCount} Requests`, sub: 'Requires supervisor sign-off', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Currently On Leave', value: '4 Staff', sub: 'Across 3 departments', icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Approved This Term', value: '18 Leaves', sub: '98% within annual quotas', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                <kpi.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">{kpi.value}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search leave requests by staff name, department, or leave type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Staff Member', 'Leave Type', 'Duration & Dates', 'Reason / Notes', 'Status', 'Review Action'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{l.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{l.dept} • {l.role}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))]">
                      {l.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                    <p className="font-semibold text-[hsl(var(--text-primary))]">{l.days} Days</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{l.start} → {l.end}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[200px] truncate">{l.reason}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      l.status === 'Approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : l.status.startsWith('Pending')
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {l.status.startsWith('Pending') ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleAction(l.id, 'Approved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(l.id, 'Rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[hsl(var(--text-tertiary))] italic">Decision Finalized</span>
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
