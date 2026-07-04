'use client';

import { useState } from 'react';
import { Phone, Plus, Search, DollarSign } from 'lucide-react';

const mockSMSLogs = [
  { id: '1', recipient: 'Sarah Smith (Parent)', message: 'Your child was marked absent today.', date: '2026-07-04 09:12 AM', cost: '$0.02', status: 'Delivered' },
  { id: '2', recipient: 'David Smith (Parent)', message: 'Term 1 Exam Schedule has been published.', date: '2026-07-03 04:30 PM', cost: '$0.02', status: 'Delivered' }
];

export default function SMSPage() {
  const [logs, setLogs] = useState(mockSMSLogs);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Outbound SMS Gateway Logs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review urgent alerts delivery statuses, bulk dispatch summaries, and accumulated cost logs.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Send Bulk SMS
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Recipient parent', 'Message Text snippet', 'Dispatch Date', 'SMS cost Charge', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Phone className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.recipient}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] max-w-xs truncate" title={row.message}>{row.message}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.date}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-mono flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{row.cost}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {row.status}
                    </span>
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
