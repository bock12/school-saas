'use client';

import { useState } from 'react';
import { ShieldCheck, Plus, Search } from 'lucide-react';

const mockRules = [
  { id: '1', trigger: 'Student Marked Absent', condition: 'AttendanceStatus = Absent', actions: 'Send Parent SMS & Push Alert', active: true },
  { id: '2', trigger: 'Invoice Overdue > 7 Days', condition: 'Balance > 0 AND Age > 7', actions: 'Send Sponsor Email Reminder', active: true }
];

export default function AutomationRulesPage() {
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Automated Notifications rules</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure event-driven trigger rules (e.g. `WHEN Attendance = Absent THEN Send SMS`) to automate school alerts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Trigger Event', 'Condition Constraints', 'Actions to Execute', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.trigger}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">`{row.condition}`</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.actions}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      row.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toggleRule(row.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity ${
                        row.active
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {row.active ? 'Disable' : 'Enable'}
                    </button>
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
