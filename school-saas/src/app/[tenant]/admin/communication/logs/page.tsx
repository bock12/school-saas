'use client';

import { useState } from 'react';
import { ClipboardList, Search, RefreshCw } from 'lucide-react';

const mockLogs = [
  { id: '1', sender: 'Admissions Office', recipient: 'Sarah Smith (Parent)', channel: 'Email', time: '2026-07-04 10:15 AM', status: 'Sent', reason: '-' },
  { id: '2', sender: 'Attendance System', recipient: 'David Johnson (Sponsor)', channel: 'SMS', time: '2026-07-04 09:12 AM', status: 'Failed', reason: 'Invalid phone prefix (os error 41)' }
];

export default function CommunicationLogsPage() {
  const [logs, setLogs] = useState(mockLogs);
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.recipient.toLowerCase().includes(search.toLowerCase()) ||
    l.sender.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Center History Logs</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Audit trail records of every outbound alert, failed transaction reason, and related origin module.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search logs by sender or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Sender System', 'Recipient', 'Channel', 'Timestamp', 'Status', 'Failure Reason', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.sender}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.recipient}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.channel}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.time}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      row.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-rose-400">{row.reason}</td>
                  <td className="px-5 py-3.5 text-right">
                    {row.status === 'Failed' && (
                      <button className="text-xs text-[hsl(var(--accent))] hover:underline font-semibold flex items-center gap-1.5 ml-auto">
                        <RefreshCw className="w-3.5 h-3.5" /> Re-send
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
