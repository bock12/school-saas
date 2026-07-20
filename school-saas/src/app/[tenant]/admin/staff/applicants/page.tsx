'use client';

import { useState } from 'react';
import { UserPlus, Search, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

const mockApplicants = [
  { id: '1', name: 'Robert Hooke', role: 'Physics Teacher', status: 'Screening', date: 'Jul 2, 2026' },
  { id: '2', name: 'Gregor Mendel', role: 'Biology Teacher', status: 'Interview Scheduled', date: 'Jun 28, 2026' },
  { id: '3', name: 'Jane Goodall', role: 'Biology Teacher', status: 'Offer Issued', date: 'Jun 25, 2026' }
];

export default function ApplicantsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockApplicants.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Candidate Applicants</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review candidate applications and advance recruitment workflow stages.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search candidates..."
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
                {['Candidate', 'Applied Position', 'Application Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.role}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{app.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-[hsl(var(--accent))] font-semibold hover:underline mr-3">
                      Screen Details
                    </button>
                    {app.status === 'Offer Issued' && (
                      <button
                        onClick={() => alert(`Onboarding triggered! Robert Hooke has been added to employees.`)}
                        className="text-xs text-emerald-400 font-semibold hover:underline"
                      >
                        Confirm Hire & Onboard
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
