'use client';

import { useState } from 'react';
import { MessageSquare, Search, Plus, Mail } from 'lucide-react';

const mockCommunications = [
  { id: '1', date: 'Jul 3, 2026', sender: 'Term 3 Grades Dispatch', recipients: 'Grade 10 Parent Cohort', type: 'Email', status: 'Delivered' },
  { id: '2', date: 'Jul 1, 2026', sender: 'Tuition Outstanding Alert', recipients: 'Smith Family representative', type: 'SMS', status: 'Delivered' },
  { id: '3', date: 'Jun 12, 2026', sender: 'Emergency closure notification', recipients: 'All Contacts', type: 'WhatsApp', status: 'Delivered' }
];

export default function CommunicationPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Logs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review broadcast records, email lists, SMS histories, and parent conference log sheets.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Log Date', 'Broadcast / Sender', 'Recipients Target', 'Channel', 'Delivery Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCommunications.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{row.date}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.sender}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.recipients}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {row.type}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
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
