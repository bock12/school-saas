'use client';

import { useState } from 'react';
import { Megaphone, Plus, Search } from 'lucide-react';

const mockBroadcasts = [
  { id: '1', subject: 'PTA Assembly Call - SMS + Email', reach: '620 Recipients', channels: 'SMS, Email', status: 'Sent' },
  { id: '2', subject: 'Grade 10 Examinations Time-table', reach: '210 Recipients', channels: 'Email, Push', status: 'Sent' }
];

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState(mockBroadcasts);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Multi-Channel Broadcast announcements</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Send a single message across multiple channels (SMS, Email, Push) to targeted recipient groups.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Broadcast
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Broadcast Subject', 'Total Reach', 'Channels Used', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {broadcasts.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Megaphone className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.reach}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.channels}</td>
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
