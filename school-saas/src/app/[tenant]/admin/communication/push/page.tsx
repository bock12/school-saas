'use client';

import { useState } from 'react';
import { Bell, Plus, Search } from 'lucide-react';

const mockPushLogs = [
  { id: '1', title: 'New homework uploaded', target: 'SS2 Science Students', date: '2026-07-04 11:00 AM', status: 'Sent' },
  { id: '2', title: 'PTA General Assembly Starts in 1 Hour', target: 'All Parents', date: '2026-07-01 09:00 AM', status: 'Sent' }
];

export default function PushNotificationsPage() {
  const [pushes, setPushes] = useState(mockPushLogs);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Push Notifications Dispatcher</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure deep-linked mobile push alerts and target specific student or parent sub-groups.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Send Push Alert
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Notification Title', 'Target Group', 'Sent Date', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pushes.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Bell className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.title}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.target}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.date}</td>
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
