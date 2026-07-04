'use client';

import { useState } from 'react';
import { Mail, Plus, Search } from 'lucide-react';

const mockEmailLogs = [
  { id: '1', subject: 'Admission Offer: Sarah Smith (Grade 10)', recipient: 'parent.smith@mail.com', date: '2026-07-04 10:15 AM', openStatus: 'Opened' },
  { id: '2', subject: 'Term 1 Report Card Publication', recipient: 'parent.smith@mail.com', date: '2026-07-01 02:00 PM', openStatus: 'Opened' }
];

export default function EmailCenterPage() {
  const [emails, setEmails] = useState(mockEmailLogs);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Email Center</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review news updates, admission letters templates, and email open receipt logs.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Email Subject', 'Recipient address', 'Dispatched Date', 'Open Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Mail className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.recipient}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {row.openStatus}
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
