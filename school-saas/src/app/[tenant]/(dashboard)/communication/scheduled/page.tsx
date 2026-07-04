'use client';

import { useState } from 'react';
import { Clock, Plus, Search } from 'lucide-react';

const mockScheduled = [
  { id: '1', subject: 'Term 2 Fee Invoice Dispatches', target: 'All Parents', scheduledTime: '2026-07-15 08:00 AM', channel: 'Email' },
  { id: '2', subject: 'Sports day countdown newsletter', target: 'All Students & Parents', scheduledTime: '2026-07-10 09:00 AM', channel: 'SMS + Push' }
];

export default function ScheduledMessagesPage() {
  const [items, setItems] = useState(mockScheduled);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Scheduled Announcements Timeline</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure PTA general meetings reminders, fee schedules, or birthday greetings to trigger at a future date.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Schedule Message
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Scheduled Subject', 'Target Group', 'Target Time Slot', 'Channel'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Clock className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.target}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.scheduledTime}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
